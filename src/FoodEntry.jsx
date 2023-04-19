import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient'
import { nutritionFields } from '../nutritionFields';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckSquare, faCircleCheck, faSquare } from '@fortawesome/pro-light-svg-icons'

export const FoodEntry = ({ user, activeDate, saved, context, viewExistingFood }) => {

    const [editSaved, seteditSaved] = useState(false)
    const [foodData, setFoodData] = useState(viewExistingFood || {});
    const [foodName, setFoodName] = useState(viewExistingFood?.name || "");
    const [addForToday, setaddForToday] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        calories: 0,
        total_fat: 0,
        saturated: 0,
        polyunsaturated: 0,
        monounsaturated: 0,
        trans: 0,
        cholesterol: 0,
        sodium: 0,
        total_carbs: 0,
        dietary_fiber: 0,
        total_sugars: 0,
        added_sugar: 0,
        protein: 0,
        potassium: 0,
    });

    async function addItem() {
        const { error } = await supabase
            .from('foods')
            .insert({ ...formData, user_id: user.id })
        if (error) console.log(error)

        if (addForToday) {
            let foodToAdd = {
                user_id: user.id,
                datetime: activeDate,
                name: formData.name,
                calories: formData.calories,
                protein: formData.protein,
                fats: formData.total_fat,
                carbs: formData.total_carbs
            }

            const { error } = await supabase
                .from('daily_foods')
                .insert(foodToAdd)
            if (error) console.log(error)
        }
        if (!error) { saved(true) }

    }

    async function updateItem() {
        const { error } = await supabase
            .from('foods')
            .update(formData)
            .eq('id', viewExistingFood.id)
        if (error) console.log(error)
        if (!error) {
            seteditSaved(true)
            setTimeout(() => {
                seteditSaved(false)
            }, 2000);
        }
    }

    const handleNameChange = (event) => {
        const { name, value } = event.target
        setFoodName(event.target.value);
        setFormData({ ...formData, [name]: value })
    }

    const handleDataChange = (event) => {
        const { name, value } = event.target
        setFormData({ ...formData, [name]: value })
        setFoodData({ ...foodData, [name]: value });
    }

    const handleKeyDown = (event) => {
        let key = event.key
        if (key === 'Enter') {
            console.log(key)
            if (context === 'my-foods') {
                updateItem()
            } else {
                addItem()
            }
        }
    };

    useEffect(() => {
        setFoodData(viewExistingFood || {});
        setFoodName(viewExistingFood?.name || "");
    }, [viewExistingFood]);

    const fields = nutritionFields.map((field, index) => {
        const name = field.name.replace(/\s+/g, '_').toLowerCase();
        const value = foodData[name] || "";
        return (
            <div key={field.name + index} className={`row row-space-between space-${field.indent}`}>
                <div className="nutrition-label">{field.name}</div>
                <div className="nutrition-value">
                    <input name={name} type="text" placeholder="0" value={value} onChange={handleDataChange} onKeyDown={handleKeyDown} />
                    <span className="label">
                        {field.unit}
                    </span>
                </div>
            </div>
        )
    });

    return (
        <div className="food-entry">
            <input name={"name"} type="text" placeholder="New food or drink..." value={foodName} onChange={handleNameChange} onKeyDown={handleKeyDown} />
            {fields}
            <hr />
            <div className="row row-space-between">
                {context === "entry" && <label htmlFor="addFood" className="checkbox">
                    <input id="addFood" type="checkbox" checked={addForToday} onChange={(e) => {
                        setaddForToday(e.target.checked)
                    }} />
                    {addForToday ? <FontAwesomeIcon icon={faCheckSquare} className={'checkbox-icon text-primary'} /> : <FontAwesomeIcon icon={faSquare} className={'checkbox-icon'} />}
                    Add for today
                </label>}
                {(formData.name && formData.calories) || context === 'my-foods' ? (<div className="btn" onClick={() => {
                    if (context !== 'my-foods') {
                        addItem()
                    } else {
                        updateItem()
                    }
                }}>{editSaved && <FontAwesomeIcon icon={faCircleCheck} className={'text-primary'} />} Save</div>) : null}
            </div>
        </div>
    )
}