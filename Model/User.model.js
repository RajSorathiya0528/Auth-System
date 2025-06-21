import mongoose from "mongoose"
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name : String,
    email : String,
    password : String,
    isVarified : {
        type : Boolean,
        default : false
    },
    verificationToken : {
        type : String
    },
    varificationTokenExpire : {
        type : Date
    },
    resetPasswordToken : {
        type : String
    },
    resetPasswordExpiry : {
        type : Date
    }
},{
    timestamps : true
});

userSchema.pre("save", async function (next) {
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
})

const User = mongoose.model("User", userSchema)

export default User;