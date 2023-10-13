const express = require('express')
const router = express.Router()
const User = require('../Models/UserSchema')
const errorHandler = require('../Middlewares/errorMiddleware')
const authTokenHandler = require('../Middlewares/checkAuthToken')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')

// zvnj okvs tzga tzuc

const transporter = nodemailer.createTransport(
    {
        service:'gmail',
        auth:{
            user:'sushmaraj808@gmail.com',
            pass: 'zvnj okvs tzga tzuc'
        }
    }
)

router.get('/test',async(req,res) => {
    res.json({
        message:"Auth api is working"
    })
})

function createResponse(ok, message, data){
    return{
        ok,
        message,
        data
    }
}

router.use(errorHandler)

router.post('/register',async(req,res,next)=>{
             try{
                const { name, email, password, weightInKg, heightInCm, gender, dob, goal, activityLevel } = req.body;
                const existingUser = await User.findOne({ email: email });
        
                if (existingUser) {
                    return res.status(409).json(createResponse(false, 'Email already exists'));
                }
        
                const newUser = new User({
                    name,
                    password,
                    email,
                    weight: [
                        {
                            weight: weightInKg,
                            unit: "kg",
                            date: Date.now()
                        }
                    ],
                    height: [
                        {
                            height: heightInCm,
                            date: Date.now(),
                            unit: "cm"
                        }
                    ],
                    gender,
                    dob,
                    goal,
                    activityLevel
                });
                await newUser.save(); // Await the save operation
        
                res.status(201).json(createResponse(true, 'User registered successfully'));
            }
                catch(err) {
                    next(err)
                }
       

})
router.post('/login',async(req,res,next)=>{
    try{
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json(createResponse(false, 'Invalid credentials'));
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json(createResponse(false, 'Invalid credentials'));
    }
    // jwt.sign(payload,key,option)
    const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '50m' });
    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: '100m' });

    // cookie(name,value,options(object literal)
    res.cookie('authToken',authToken,{httpOnly:true})
    res.cookie('refreshToken',refreshToken,{httpOnly:true})
}
    catch(err) {
        next(err)
    }

    
})
router.post('/sendotp',async(req,res,next)=>{
    try{
        const {email} = req.body
        const otp = Math.floor(100000 + Math.random()*900000)
         transporter.sendMail({
            from:'sushmaraj808@gmail.com',
            to:email,
            subject:'otp foe verification',
            body:`Your OTP is ${otp}`
        },(err,info)=>{
            if(err){
                console.log(err)
                res.status(500).json(createResponse(false,err.message))
            }
            else{
                res.json(createResponse(true,"OTP sent successfully",{otp}))
            }
        }
            
        )
    }
        catch(err) {
            next(err)
        }
})
router.post('/checklogin',authTokenHandler,async(req,res,next)=>{
    res.json({
        ok:true,
        message:"user was authenticated succesfully"
    })
})
router.use(errorHandler)


module.exports = router
