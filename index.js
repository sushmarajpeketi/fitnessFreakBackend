const express = require('express')
const app = express()

const bodyParser = require('body-parser')
const cors = require('cors')
const PORT = 8000
const cookieParser = require('cookie-parser')

require('dotenv').config();
require('./db')
app.use(bodyParser.json())
const allowedOrigins = ["https://localhost:3000"]

const authRoutes = require('./Routes/Auth');
const calorieIntakeRoutes = require('./Routes/CalorieIntake');
const adminRoutes = require('./Routes/Admin');
const imageUploadRoutes = require('./Routes/imageUploadRoutes');
const sleepTrackRoutes = require('./Routes/SleepTrack');
const stepTrackRoutes = require('./Routes/StepTrack');
const weightTrackRoutes = require('./Routes/WeightTrack');
const waterTrackRoutes = require('./Routes/WaterTrack');
const workoutTrackRoutes = require('./Routes/WorkoutTrack');
const workoutRoutes = require('./Routes/WorkoutPlans');
const reportRoutes = require('./Routes/Report');


app.use(
    cors(
        {
            origin: function(origin,callback){
                if (!origin || this.allowedOrigins.includes(origin)){
                    callback(null, true)
                }else
                {
                    callback(new Error('Not allowed by Cors'))
                }
            },
            credentials: true,
        }
    )
)

app.use(cookieParser())

app.get('/',(req,res)=>{
    res.json({message:'The API is working'})
})

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})