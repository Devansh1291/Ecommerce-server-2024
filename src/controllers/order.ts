import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { NewOrderRequestBody } from "../types/types.js";
import { Request } from "express";
import { InvalidateCache, reduceStock } from "../utils/features.js";
import ErrorHandler from "../utils/utility-class.js";
import { myCache } from "../app.js";
import { stringify } from "qs";

export const newOrder=TryCatch(
    async(req:Request<{},{},NewOrderRequestBody>,res,next)=>{
       
        const {
            shippingInfo,
            orderItems,
            user,
            subtotal,
            tax,
            shippingCharges,
            discount,
            total,
        }=req.body;

        if(!shippingInfo || !orderItems || !user || !subtotal || !tax 
            || !total) return next(new ErrorHandler("All Fields are required",404));

        await Order.create({
            shippingInfo,
            orderItems,
            user,
            subtotal,
            tax,
            shippingCharges,
            discount,
            total,
        });

        reduceStock(orderItems);
        InvalidateCache({product:true,order:true,admin:true,userId:user});

        return res.status(200).json({
            success:true,
            message:"Order placed successfully",
        });

});

export const myOrders=TryCatch(async(req,res,next)=>{
    
    const {id:userId}=req.query;
    
    let orders=[];
    if(myCache.has(`my-orders-${userId}`)) orders=JSON.parse(myCache.get(`my-orders-${userId}`) as string);
    else{
        orders=await Order.find({user:String(userId)});
        console.log("order...",orders);
        myCache.set(`my-orders-${userId}`,JSON.stringify(orders));
    }

    return res.status(200).json({
        success:true,
        message:"Order placed successfully",
        orders
    });

});

export const allOrders=TryCatch(async(req,res,next)=>{
    
    const key="all-orders"

    let orders=[];

    if(myCache.has(key)) orders=JSON.parse(myCache.get(key) as string);

    else{
        orders=await Order.find({}).populate("user");
        myCache.set(key,JSON.stringify(orders));
    }

    return res.status(200).json({
        success:true,
        message:"All order fetched successfully",
        orders
    });

});

export const getSingleOrder=TryCatch(async(req,res,next)=>{
 
    const {id}:{id:string}=req.params;
    const key=`order-${id}`;

    let order;

    if(myCache.has(key)) order=JSON.parse(myCache.get(key) as string);
    else{
        order=await Order.findById(id).populate("user","name");
        if(!order) return next(new ErrorHandler("Order not found",404));
        myCache.set(key,JSON.stringify(order));
    }

    return res.status(200).json({
        success:true,
        message:"Order fetched successfully",
        order,
    });

});

export const processOrder=TryCatch(async(req,res,next)=>{
    const {id}=req.params;
    const order=await Order.findById(id);
    if(!order){
        return next(new ErrorHandler("Order not found",404));
    }

    switch(order.status){
        case "Processing":
            order.status="Shipped";
            break;
        case "Shipped":
            order.status="Delivered";
            break;
        default:
            order.status="Delivered";
            break;
    }

    await order.save();

    InvalidateCache({
        product:false,
        order:true,
        admin:true,
        userId:order.user,
        orderId:id,
        productId:order.orderItems?.map((i)=>String(i.productId))
    });

    return res.status(200).json({
        success:true,
        message:"Order processed successfully",
        order,
    })
});

export const deleteOrder=TryCatch(async(req,res,next)=>{
    const {id}=req.params;
    const order=await Order.findById(id);
    if(!order){
        return next(new ErrorHandler("Order not found",404));
    }



    await order.deleteOne();

    InvalidateCache({
        product:false,
        order:true,
        admin:true,
        userId:order.user,
        orderId:id,
        productId:order.orderItems?.map((i)=>String(i.productId))
    });

    return res.status(200).json({
        success:true,
        message:"Order deleted successfully"    ,
    })
});