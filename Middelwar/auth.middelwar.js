import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const isLogin = async(req, res, next) => {
    try{
        const token = req.cookies.token || "";

        if(!token){
            return res.status(400).json({
                "message" : "authentication failed",
                "success" : false
            })
        }
        const decodedToken = jwt.verify(token, process.env.JWTSECURITY_WORD)
        req.user = decodedToken;
        next()
    }catch(error){
        console.log("auth middelwar failure error : ", error)
        return res.status(500).json({
            message : "internal server error",
            success : false
        })
    }
}

export {
    isLogin
}