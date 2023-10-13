const mongoose = require('mongoose')
require('dotenv').config()

// mongoose.connect(process.env.MONGO_URL,{
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false
// }).then(con=>{
//     console.log(con.connections)
//     console.log("db connection successful")
// })

mongoose.connect(process.env.MONGO_URL,{
    dbName : process.env.DB_NAME
}).then(
    (con)=>{
        console.log(con.connections)
        console.log("connected to database")
    }
).catch((err)=>{
    console.log("Error connecting to database" + err)
})