import { stripe } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/coupon.js";
import ErrorHandler from "../utils/utility-class.js";


export const createPaymentIntent = TryCatch(async (req, res, next) => {
    const { amount, description,name,address:{state,city,country} } = req.body;

    if (!amount) return next(new ErrorHandler("Please Enter the amount", 404));

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Number(amount) * 100,
        currency: "inr",
        description: description || "Payment for goods/services", 
        shipping:{
            name:name,
            address:{
                state:state,
                city:city,
                country:country,   
            }
        }
    });

    return res.status(200).json({
        success: true,
        message: "Payment Intent created",
        clientSecret: paymentIntent.client_secret,
    });
});


export const newCoupon=TryCatch(async(req,res,next)=>{

    const {coupon,amount}=req.body;

    if(!coupon || !amount) return next(new ErrorHandler("All fields required",404))
    await Coupon.create({ code: coupon, amount});

    return res.status(200).json({
        success:true,
        message:`coupon ${coupon} successfully created`,
    })
})

export const applyDiscount=TryCatch(async(req,res,next)=>{

    const {coupon}=req.query;
    
    const discount=await Coupon.find({ code:String(coupon) })
    if(!coupon) return next(new ErrorHandler("Invalid coupon code",404))
    
    return res.status(200).json({
        success:true,
        message:`Coupon applyed successfully`,
        discount,
    })
})


export const getAllCoupon=TryCatch(async(req,res,next)=>{

    const coupons=await Coupon.find({})
    
    return res.status(200).json({
        success:true,
        message:`Coupon applyed successfully`,
        coupons,
    })
})

export const deleteCoupon=TryCatch(async(req,res,next)=>{

    const {id}=req.params;
    const coupon=await Coupon.findById(id);
    if(!coupon) return next(new ErrorHandler("Invalid Id",400));

    await coupon.deleteOne();       
    
    return res.status(200).json({
        success:true,
        message:`Coupon ${coupon?.code} deleted successfully`,
        
    })
})