import React from 'react';
import { FoodRow } from './FoodRow'

export const FoodList = ({ foods, context, user, viewExistingFoodItem }) => {

    return (
        <div className="added-foods">
            {foods.length < 1 && <div className="no-results">No Foods found</div>}
            {foods && foods.map((food, index) => {
                return <FoodRow key={food + index} food={food} context={context} user={user} viewExistingFoodItem={viewExistingFoodItem} />
            })}
        </div>
    )
}