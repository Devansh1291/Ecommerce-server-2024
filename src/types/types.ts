import { NextFunction, Request, Response } from "express";


export interface NewUserRequestBody{
    name:string,
    email:string,
    photo:string,
    gender:string,
    _id:string,
    dob:Date,
}

export interface NewProductRequestBody{
    name:string,
    price:number,
    stock:number,
    category:string,

}

export type ControllerType=(
    req:Request<any>,
    res:Response,
    next:NextFunction,
)=>Promise<void | Response<any,Record<string,any>>>;


export type SearchRequestQuery={
    search?:string,
    price?:string,
    category?:string,
    sort?:string,
    page?:string
};

export interface BaseQuery{
    name?:{
        $regex:string;//search for all patterns
        $options:string;//option case insensitive
    };
    price?:{
        $lte:number
    };
    category?:string
}

export type InvalidateCacheProps={
    product?:boolean,
    order?:boolean,
    admin?:boolean,
    userId?:string,
    orderId?:string,
    productId?:string | string[],
}

export type OrderItemType={
    name:string,
    photo:string,
    price:string,
    quantity:number,
    productId:string,
}

export type ShippingInfoType={
    address:string,
    state:string,
    city:string,
    country:string,
    pincode:number,

}

export interface NewOrderRequestBody{
    shippingInfo:ShippingInfoType;
    user:string,
    subtotal:number,
    tax:number,
    shippingCharges:number,
    discount:number,
    total:number,
    orderItems:OrderItemType[],
}