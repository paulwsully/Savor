import React from 'react';
import { supabase } from './supabaseClient'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt } from '@fortawesome/pro-light-svg-icons'

export const FoodRow = ({ user, food, highlight, addFood, context, viewExistingFoodItem }) => {

    async function deleteFood() {
        if (context === 'daily-foods') {
            const { error } = await supabase
                .from('daily_foods')
                .delete()
                .eq('id', food.id)
                .eq('user_id', user.id)
            if (error) { console.log(error) }
        } else if (context === 'my-foods') {
            const { error } = await supabase
                .from('foods')
                .delete()
                .eq('id', food.id)
                .eq('user_id', user.id)
            if (error) { console.log(error) }
        }
    }

    return (
        <div className={`row row-space-between cursor ${context} ${highlight ? 'highlight' : ''}`}
            onClick={() => {
                if (context === 'entry') { addFood(food) }
                else if (context === 'my-foods') { console.log('my-foods'); viewExistingFoodItem(food) }
            }}>
            <div className="food-label">{food.name}</div>
            <div className="food-calories">
                {food.calories} <span className="label">cal</span>
                <div className="delete" onClick={() => deleteFood()}>
                    <FontAwesomeIcon icon={faTrashAlt} />
                </div>
            </div>
        </div>
    )
}
