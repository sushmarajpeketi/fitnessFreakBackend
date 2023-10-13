const express = require('express')
const router = express.Router()
const authTokenHandler = require('../Middlewares/checkAuthToken');
const jwt = require('jsonwebtoken');
const errorHandler = require('../Middlewares/errorMiddleware');
const request = require('request');
const User = require('../Models/UserSchema');
require('dotenv').config();

function createResponse(ok, message, data) {
    return {
        ok,
        message,
        data,
    };
}

router.get('/test', authTokenHandler, async (req, res) => {
    res.json(createResponse(true, 'Test API works for calorie intake report'));
});

router.post('/addcalorieintake',authTokenHandler,async(req,res)=>{
    const {item,date,quantity,quantitytype} = req.body
    if(!item || !date || !quantity || !quantityType){
        return res.status(400).json(createResponse(false,"Please provide all the details"))
    }
    let qtyingrams = 0
    if(quantitytype === 'g' ){
        qtyingrams = quantity
    }
    else if(quantitytype === 'kg' ){
        qtyingrams = quantity * 1000
    }
    else if(quantitytype === 'ml' ){
        qtyingrams = quantity
    }
    else if(quantitytype === 'l' ){
        qtyingrams = quantity * 1000
    }
    else if(quantitytype = 'g' ){
        qtyingrams = quantity
    }
   
        var query = item;
        request.get({
        url: 'https://api.api-ninjas.com/v1/nutrition?query=' + query,
        headers: {
            'X-Api-Key': process.env.NUTRITION_API_KEY
        },
        },
    async function(error, response, body) {
        if(error) return console.error('Request failed:', error);
        else if(response.statusCode != 200) return console.error('Error:', response.statusCode, body.toString('utf8'));
        else {
            // body :[ {
            //     "name": "rice",
            //     "calories": 127.4,
            //     "serving_size_g": 100,
            //     "fat_total_g": 0.3,
            //     "fat_saturated_g": 0.1,
            //     "protein_g": 2.7,
            //     "sodium_mg": 1,
            //     "potassium_mg": 42,
            //     "cholesterol_mg": 0,
            //     "carbohydrates_total_g": 28.4,
            //     "fiber_g": 0.4,
            //     "sugar_g": 0.1
            // }]
            body = JSON.parse(body)
            let calorieIntake = (body[0].calories / body[0].serving_size_g) * parseInt(qtyingrams);
            const userId = req.userId;
            const user = await User.findOne({ _id: userId})
            user.calorieIntake.push({
                item,
                date : new Date(date),
                quantity,
                quantitytype,
                calorieIntake: parseInt(calorieIntake)

            })
            await user.save()
            res.json(createResponse(ok,"calorieIntake added successfully"))
        }
        });

})

router.post('/getcalorieintakebydate',authTokenHandler,async(req,res)=>{
    const {date} = req.body
    const userId = req.userId
    const user = await User.findOne({ _id:userId})
    if(!date){
        let date = new Date()
        
        user.calorieIntake = filterEnteriesByDate(user.calorieIntake,date)
        return res.createResponse(ok,"Calorie intake for today",user.calorieIntake)
    }
    user.calorieIntake = filterEnteriesByDate(user.calorieIntake,new Date(date))
})
router.post('/getcalorieintakebylimit',authTokenHandler,async(req,res)=>{

})
router.delete('/deletecalorieintake',authTokenHandler,async(req,res)=>{
    const { item, date } = req.body;
    if (!item || !date) {
        return res.status(400).json(createResponse(false, 'Please provide all the details'));
    }

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    user.calorieIntake = user.calorieIntake.filter((item) => {
        return item.item != item && item.date != date;
    })
    await user.save();
    res.json(createResponse(true, 'Calorie intake deleted successfully'));
})
router.post('/getgoalcalorieintake',authTokenHandler,async(req,res)=>{
    const userId = req.userId;
    const user = await User.findById({ _id: userId });
    let maxCalorieIntake = 0;
    let heightInCm = parseFloat(user.height[user.height.length - 1].height);
    let weightInKg = parseFloat(user.weight[user.weight.length - 1].weight);
    let age = new Date().getFullYear() - new Date(user.dob).getFullYear();
    let BMR = 0;
    let gender = user.gender;
    if (gender == 'male') {
        BMR = 88.362 + (13.397 * weightInKg) + (4.799 * heightInCm) - (5.677 * age)

    }
    else if (gender == 'female') {
        BMR = 447.593 + (9.247 * weightInKg) + (3.098 * heightInCm) - (4.330 * age)

    }
    else {
        BMR = 447.593 + (9.247 * weightInKg) + (3.098 * heightInCm) - (4.330 * age)
    }
    if (user.goal == 'weightLoss') {
        maxCalorieIntake = BMR - 500;
    }
    else if (user.goal == 'weightGain') {
        maxCalorieIntake = BMR + 500;
    }
    else {
        maxCalorieIntake = BMR;
    }

    res.json(createResponse(true, 'max calorie intake', { maxCalorieIntake }));
})

function filterEnteriesByDate(entries, targetDate){
    return entries.filter(entry=>{
        const entryDate = new Date(entry.date);
        return(
            entryDate.getDate() === targetDate.getDate() &&
            entryDate.getMonth() === targetDate.getMonth() &&
            entryDate.getFullYear() === targetDate.getFullYear() 
        )
    })
}

module.exports = router