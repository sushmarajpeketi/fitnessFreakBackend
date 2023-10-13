const jwt = require('jsonwebtoken')

function checkAdminToken(req,res,next){
    const adminAuthToken = req.cookie.adminAuthToken
    if(!adminAuthToken) {
            res.status(500).json({
            ok:false,
            message:"Invalid Admin credential"
        })}
    jwt.verify(adminAuthToken,process.env.JWT_ADMIN_SECRET_KEY,(err,decoded)=>{
        if(err){
           return res.status(500).json({
            ok:false,
            message:"Invalid Admin credential"
        })
        }
        else{
            res.adminId = decoded.adminId
            next() }
    })
}

module.exports = checkAdminToken