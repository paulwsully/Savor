import React, { useState, useEffect, useRef } from "react";
import { FoodRow } from './FoodRow';
import { supabase } from './supabaseClient'

export const Typeahead = ({ user, activeDate }) => {
    const [filteredFoods, setFilteredFoods] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [foods, setFoods] = useState([]);
    const [allFoods, setAllFoods] = useState([]);
    const inputRef = useRef(null);

    async function getFoods(user) {
        const { data, error } = await supabase
            .from('foods')
            .select()
            .eq('user_id', user?.id)
        setFilteredFoods(data)
        setAllFoods(data);
        if (error) console.log(error)
    }

    async function addFood(food) {
        console.log(food)
        let foodToAdd = {
            user_id: user.id,
            datetime: activeDate,
            name: food.name,
            calories: food.calories,
            protein: food.protein,
            fats: food.total_fat,
            carbs: food.total_carbs
        }

        const { error } = await supabase
            .from('daily_foods')
            .insert(foodToAdd)
        if (error) console.log(error)
        inputRef.current.value = '';
    }

    const handleInputChange = (event) => {
        const searchTerm = event.target.value.toLowerCase();
        const filtered = allFoods.filter((food) => food.name.toLowerCase().includes(searchTerm));
        setFilteredFoods(searchTerm ? filtered : allFoods);
        setSelectedIndex(-1);
    };

    const handleInputBlur = () => { setTimeout(() => setIsDropdownVisible(false), 50) };

    const handleInputFocus = () => {
        setIsDropdownVisible(true)
        getFoods(user)
        setSelectedIndex(-1)
    };

    const handleKeyDown = (event) => {
        let key = event.key
        if (key === 'ArrowDown') {
            if (selectedIndex !== filteredFoods.length - 1) { setSelectedIndex(selectedIndex + 1) }
        }
        if (key === 'ArrowUp') {
            if (selectedIndex !== -1) { setSelectedIndex(selectedIndex - 1) }
        }
        if (key === 'Enter') {
            if (selectedIndex >= 0) { addFood(filteredFoods[selectedIndex]) }
        }
        if (key === 'Escape') {
            event.target.value = ''
        }
    };

    useEffect(() => {
        setFoods(filteredFoods);
    }, [filteredFoods]);

    return (
        <div className={`typeahead ${isDropdownVisible ? 'active' : ''}`}>
            <input
                type="text"
                placeholder="New food or drink..."
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onFocus={handleInputFocus}
                onKeyDown={handleKeyDown}
                ref={inputRef}
            />
            <div className={`dropdown`}>
                {filteredFoods.map((food, index) => (
                    <FoodRow
                        context={'entry'}
                        key={food.id}
                        food={food}
                        highlight={index === selectedIndex}
                        addFood={addFood}
                    />
                ))}
            </div>
        </div>
    );
}