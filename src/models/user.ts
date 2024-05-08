import mongoose from "mongoose";
import validator from 'validator';

interface IUser extends Document{
    _id:string,
    name:string,
    email:string,
    photo:string,
    role:"admin" | "user",
    gender:"male" | "female",
    dob:Date,
    createdAt:Date,
    updatedAt:Date,
    //virtual Attribute
    age:number,
}

const userSchema=new mongoose.Schema(

    {
        _id:{
            type:String,
            required:[true,"Please enter ID"]
        },
        name:{
            type:String,
            required:[true,"Please enter name"]
        },
        email:{
            type:String,
            unique:[true,"Email already existed"],
            required:[true,"Please enter email"],
            validate:validator.default.isEmail,
        },
        photo:{
            type:String,
            required:[true,"Please add photo"]
        },
        role:{
            type:String,
            enum:["admin","user"],
            default:"user"
        },
        gender:{
            type:String,
            enum:["male","female"],
            required:[true,"Please enter gender"]
        },
        dob:{
            type:Date,
            required:[true,"Please enter Date Of Birth"]
        }
    },
    {
        timestamps:true,
    }

);


userSchema.virtual("age").get(function(this: { dob: Date }) {
    // Get today's date
    const today = new Date();

    const dob = this.dob;


    let age = today.getFullYear() - dob.getFullYear();

    
    if (
        today.getMonth() < dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
    ) {
        age--;
    }

    return age;
});




export const User=mongoose.model<IUser>("User",userSchema); 