import mongoose from "mongoose";


const couponSchema=new mongoose.Schema({
    
    code:{
        type:String,
        required:[true,"please enter coupon code"],
        unique:true,
        trim:true,
    },
    amount:{
        type:Number,
        required:[true,"Please enter the discount amount"],
    }
    

});


export const Coupon=mongoose.model("Coupon",couponSchema);