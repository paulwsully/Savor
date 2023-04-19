import { useState, useEffect } from 'react'
import { FoodEntry } from './FoodEntry'
import { FoodList } from './FoodList'
import { Typeahead } from './Typeahead'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faPlus, faCrateApple, faSignOutAlt } from '@fortawesome/pro-light-svg-icons'
import { supabase } from './supabaseClient'
import Calendar from 'react-calendar'
import './App.scss'
import 'react-calendar/dist/Calendar.css'

function App() {

  const [user, setuser] = useState(null)
  const [session, setSession] = useState(null)

  const [addActive, setaddActive] = useState(false)
  const [existingFoodActive, setexistingFoodActive] = useState(false)
  const [existingFoods, setexistingFoods] = useState([])
  const [dailyFoods, setdailyFoods] = useState([])
  const [dailyTotalCalories, setdailyTotalCalories] = useState(0)
  const [activeDate, setactiveDate] = useState(formatDate(new Date()))
  const [calorieBudgetInputActive, setcalorieBudgetInputActive] = useState(false)
  const [remainingCalories, setremainingCalories] = useState(null)
  const [viewExistingFood, setviewExistingFood] = useState(null)

  calorieBudgetInputActive

  const toggleAdd = () => {
    setaddActive(!addActive)
    setexistingFoodActive(false)
  }

  const toggleExistingFoods = () => {
    getExistingFoods(user)
    setexistingFoodActive(!existingFoodActive)
    setaddActive(false)
  }

  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) console.log(error)
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) console.log(error)
  }

  async function getExistingFoods(user) {
    const { data, error } = await supabase
      .from('foods')
      .select()
      .eq('user_id', user?.id)
    setexistingFoods(data)
    if (error) console.log(error)
  }

  async function getDailyFood(user, date) {
    const { data, error } = await supabase
      .from('daily_foods')
      .select()
      .eq('user_id', user?.id)
      .eq('datetime', date)
    setdailyFoods(data)
    if (error) console.log(error)
    let totalCalorieCount = 0
    data.map((food) => {
      totalCalorieCount = totalCalorieCount + food.calories
    })
    setdailyTotalCalories(totalCalorieCount)
  }

  function formatDate(date) {
    if (typeof date === 'string') {
      let parts = date.split('-');
      let year = parseInt(parts[2], 10);
      let month = parseInt(parts[0], 10) - 1;
      let day = parseInt(parts[1], 10);
      date = new Date(year, month, day);
    }

    let month = '' + (date.getMonth() + 1);
    let day = '' + date.getDate();
    let year = date.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [month, day, year].join('-');
  }

  function handleDayClick(date) {
    setactiveDate(date)
    getDailyFood(session.user, formatDate(date))
  }

  async function handleCarlorieBudgetBlur(event) {
    let calorieBudget = event.target.value

    const { data, error } = await supabase
      .from('user_profile')
      .select()
      .eq('user_id', user?.id)

    if (data.length > 0) {
      const { error } = await supabase
        .from('user_profile')
        .update({ calorie_budget: calorieBudget })
        .eq('user_id', user.id)
      if (error) { console.log(error) }
    } else {
      const { error } = await supabase
        .from('user_profile')
        .insert({ 'user_id': user.id, 'calorie_budget': calorieBudget })
      if (error) { console.log(error) }
    }
    if (error) console.log(error)
    setcalorieBudgetInputActive(false)
  }

  async function getCaloieBudget(user) {
    const { data, error } = await supabase
      .from('user_profile')
      .select()
      .eq('user_id', user?.id)

    setremainingCalories(data && data.length > 0 ? data[0].calorie_budget : null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setuser(session.user)
      getDailyFood(session.user, formatDate(new Date()))
      getCaloieBudget(session.user)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    supabase.channel('any')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'daily_foods' }, (payload) => {
        setdailyFoods(prevFoods => [...prevFoods, payload.new])
        setdailyTotalCalories(prevCals => prevCals + payload.new.calories)
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'daily_foods' }, (payload) => {
        setdailyFoods(prevFoods => prevFoods.filter(food => food.id !== payload.old.id));
        setdailyTotalCalories(prevCals => prevCals - payload.old.calories)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'foods' }, (payload) => {
        setexistingFoods(prevFoods => prevFoods.filter(food => food.id !== payload.old.id));
        setexistingFoods(prevFoods => [...prevFoods, payload.new])
      })
      .subscribe()
  }, [])

  function saved() { setaddActive(false) }

  function viewExistingFoodItem(foodItem) {
    setviewExistingFood(foodItem)
  }

  return (
    <div className="App">
      {!session && <div className="btn sign-in" onClick={() => signInWithGoogle()}> Log In </div>}
      {user ?
        <>
          <div className="btn sign-out" onClick={() => signOut()}>
            <FontAwesomeIcon icon={faSignOutAlt} />
          </div>
          <div className="main-columns column">
            <div className="food-entry-details">
              <div className="calories-remaining-header">
                <h1 className="success" onClick={() => setcalorieBudgetInputActive(!calorieBudgetInputActive)}>
                  {remainingCalories - dailyTotalCalories}
                </h1>
                <span>Calories Remaining</span>
                {calorieBudgetInputActive &&
                  <div className="calorie-budget-input">
                    <input type="text" onBlur={handleCarlorieBudgetBlur} placeholder='Calorie Budget' />
                  </div>
                }

              </div>
              <div className="food-list">
                <div className="row row-right">
                  <div className="food-calories bold">
                    {dailyTotalCalories} <span className="label">cal</span>
                  </div>
                </div>
                <Typeahead user={user} activeDate={activeDate} />
                <FoodList user={user} foods={dailyFoods} context="daily-foods" />
              </div>
            </div>
          </div>
          <div className="main-columns column">
            <Calendar calendarType={"US"} showFixedNumberOfWeeks={true} onClickDay={(date) => handleDayClick(date)} />
          </div>
          {(addActive || existingFoodActive) &&
            <div className="overlay">
              {addActive && <FoodEntry user={user} activeDate={activeDate} saved={saved} context="entry" />}
              {existingFoodActive &&
                <div className="existing-foods">
                  <div className="main-columns column">
                    <h2>My Foods</h2>
                    <FoodList foods={existingFoods} context="my-foods" user={user} viewExistingFoodItem={viewExistingFoodItem} />
                  </div>
                  {viewExistingFood && <div className="main-columns column"><FoodEntry user={user} viewExistingFood={viewExistingFood} context={'my-foods'} /></div>}
                </div>
              }
            </div>
          }

          <div className="actions">
            <div className="action" onClick={() => toggleAdd()}>
              {addActive ? <FontAwesomeIcon icon={faTimes} /> : <FontAwesomeIcon icon={faPlus} />}
            </div>
            <div className="action" onClick={() => toggleExistingFoods()}>
              {existingFoodActive ? <FontAwesomeIcon icon={faTimes} /> : <FontAwesomeIcon icon={faCrateApple} />}
            </div>
          </div>
        </> :
        null
      }
    </div>
  )
}

export default App
