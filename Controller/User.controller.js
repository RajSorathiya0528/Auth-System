import User from '../Model/User.model.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";


const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            "message": "all fields are required",
            "success": false
        })
    }

    if (password.length <= 8) {
        return res.status(400).json({
            "message": "password must be grater then 8 character",
            "success": false
        })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            "message": "Invalid email format",
            "success": false
        })
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                "message": "user already exists",
                "success": false
            })
        } else {
            const user = await User.create({
                name,
                email, 
                password
            });
            if (!user) {
                return res.status(400).json({
                    "message": "user not created",
                    "success": false
                })
            } else {
                const token = crypto.randomBytes(32).toString('hex')
                user.verificationToken = token;
                await user.save()

                const transporter = nodemailer.createTransport({
                    host: process.env.MAILTRAP_HOST,
                    port: process.env.MAILTRAP_PORT,
                    secure: false,
                    auth: {
                        user: process.env.MAILTRAP_USER,
                        pass: process.env.MAILTRAP_PASSWORD
                    }
                })

                const mailOption = {
                    from: process.env.MAILTRAP_USER,
                    to: user.email,
                    subject: "verify your email",
                    text: `plase click on the following link : ${process.env.BASE_URL}/api/v1/users/varify/${token}`
                }

                const tampmail = await transporter.sendMail(mailOption)

                if (tampmail) {
                    return res.status(201).json({
                        message: "User created successfully. Verification email sent.",
                        success: true
                    });
                } else {
                    return res.status(500).json({
                        message: "User created but verification email failed to send.",
                        success: false
                    });
                }
            }
        }
    } catch (error) {
        return res.status(500).json({
            "message": "internal server error",
            "error": error.message,
            success: false
        })
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            "message": "all fields are required",
            "success": false
        })
    }
    try {
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({
                "message": "Invalid email or password",
                "success": false
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({
                "message" : "invalid email or password",
                "success" : false
            })
        }

        if(!user.isVarified) {
            return res.status(400).json({
                "message" : "invalid email or password",
                "success" : false
            })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWTSECURITY_WORD, {
            expiresIn : "24h"
        });

        const cookieOptions = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: false,
            sameSite: "none"
        }

        res.cookie("token", token, cookieOptions);
        console.log("Token Cookie: ", token);
        console.log("Token Cookie: ", req.cookies.token);
        
        return res.status(200).json({
            "message" : "Login successful",
            "success" : true
        })
    } catch (error) {
        console.log("Error during login:", error);
        return res.status(500).json({
            "message" : "Internal server error",
            "success" : false
        });
    }
}

const varifyUser = async (req, res) => {
    const {token} = req.params;

    if(!token){
        return res.status(400).json({
            "message" : "invalid token",
            "success" : false
        })
    }

    const user = await User.findOne({
        verificationToken : token
    })

    if(!user){
        return res.status(400).json({
            "message" : "invalid token",
            "success" : false
        })
    }else {
        user.isVarified = true
    }

    user.verificationToken = null;
    await user.save();

    res.status(200).json({
        message : "verify user successfully"
    })
}

const getMe = async(req, res) => {
    try{
        const data = req.user;
        if(!data){
            return res.status(400).json({
                "message" : "user not found",
                "success" : false
            })
        }

        const user = await User.findById(req.user.id)
        if(!user) {
            return res.status(400).json({
                "message" : "user not found",
                "success" : false
            })
        }

        res.status(200).json({
            "message" : "user found",
            "success" : true,
            user : {
                id: user._id,
                name: user.name,
                email: user.email,
            }
        })
    }catch(error){
        res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

const logoutUser = async (req, res) => {
    try {
        const data = req.user;
        res.cookie("token", "", {
            expires : new Date(Date.now()),
            httpOnly: true,
            secure: false,
            sameSite: "none"
        })
        return res.status(200).json({
            "message" : "logout successful",
            "success" : true
        }) 
    } catch (error) {
        console.log("error while logout user : ", error)
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

const forgotPassword = async(req, res) => {
    const { email } = req.body;
    if(!email){
        return res.status(400).json({
            message: "all fields are required",
            success: false
        })
    }
    try {
        const user = await User.findOne({ email });
        if(!user){
            return res.status(404).json({
                message: "email is invalide",
                success: false
            })
        }

        const token = crypto.randomBytes(32).toString('hex')
        user.resetPasswordToken = token;
        user.resetPasswordExpiry = Date.now() + 30 * 60 * 1000;
        user.save();

        const transporter = nodemailer.createTransport({
            host: process.env.MAILTRAP_HOST,
            port: process.env.MAILTRAP_PORT,
            secure: false,
            auth: {
                user: process.env.MAILTRAP_USER,
                pass: process.env.MAILTRAP_PASSWORD
            }
        });
        
        const mailOptions = {
            from: process.env.MAILTRAP_USER,
            to: user.email,
            subject: "reset your password",
            text: `click on the link to reset your password : http://localhost:3000/api/v1/users/fergotpassword/${token}`
        }
        
        const tempmail = await transporter.sendMail(mailOptions)
        
        if(tempmail){
            return res.status(200).json({
                message : "Reset password email send successfully",
                success : true
            })
        } else{
            return res.status(400).json({
                message : "error while sending the mail",
                success : false
            })
        }
    } catch (error) {
        console.log("error while sending the mail : ", error)
        return res.status(400).json({
            message : "internal server error",
            success : false
        })
    }
}

const resetPassword = async(req, res) => {
    const {token} = req.params;
    if(!token){
        return res.status(400).json({
            message : "invalid email token",
            success : false,
        })
    }

    const {password, conformPassword} = req.body;
    if(!password && !conformPassword){
        return res.status(400).json({
            message : "all field are required",
            success : false,
        })
    }

    if (password.localeCompare(conformPassword) != 0){
        return res.status(400).json({
            message : "password and conform password are not same",
            success : false,
        })
    } 
    
    try{
        const user = await User.findOne({
            resetPasswordToken : token,
            resetPasswordExpire : { $gt: Date.now() }
        })

        if(!user){
            return res.status(400).json({
                message : "user not found",
                success : false,
            })
        }

        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpiry = null;
        user.save();
        return res.status(200).json({
            message : "password reset successfully",
            success : true,
        })
    } catch(error){
        return res.status(400).json({
            message : "internal server error",
            success : false,
        })
    }

}

export {
    registerUser,
    loginUser,
    varifyUser,
    getMe, 
    logoutUser,
    resetPassword,
    forgotPassword
}
