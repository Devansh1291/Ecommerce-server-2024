import { TryCatch } from "../middlewares/error.js";
import { Request } from "express";
import {BaseQuery, NewProductRequestBody, SearchRequestQuery} from "../types/types.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/utility-class.js";
import {rm} from "fs";
import { myCache } from "../app.js";
import { InvalidateCache } from "../utils/features.js";

export const newProduct=TryCatch(
    async(req:Request<{},{},NewProductRequestBody>,
        res,
        next)=>{
            const {name,category,price,stock}=req.body;
            const photo=req.file;

            if(!photo) return next(new ErrorHandler("please add photo",401));

            if(!name || !category || !price || !stock ){

                rm(photo.path,()=>{
                    console.log("Deleted");//if baki ka data pura nhi hain toh photot ka kya krna

                });

                return next(new ErrorHandler("All fields are required",404));
            }

            const newproduct=await Product.create({
                name,
                category:category.toLowerCase(),
                price,
                stock,
                photo:photo.path    
            });
            InvalidateCache({product:true,admin:true});
            return res.status(200).json({
                success:true,
                message:"New Product is added successfully",
                newproduct
            })
})
//revalidate on New ,update, delete Product
export const getLatestProducts=TryCatch(async(req,res,next)=>{

    let products=[];

    if(myCache.has("latest-products")){
        products=JSON.parse(myCache.get("latest-products") as string)
    }
    else{
        products=await Product.find({}).sort({createdAt:-1}).limit(5);
        if(!products) return next(new ErrorHandler("No products available",401));
        myCache.set("latest-products",JSON.stringify(products));
    }
    return res.status(200).json({
        success:true,
        products,
        message:"latest Products successfully fetched"
    })
})
//revalidate on New ,update, delete Product
export const getAllCategories=TryCatch(async(req,res,next)=>{

    let products;
    if(myCache.has("categories")){
        products=JSON.parse(myCache.get("categories") as string);
    }
    else{
        products=await Product.distinct("category");
        myCache.set("categories",JSON.stringify(products));
    }
    return res.status(200).json({
        success:true,
        products,
        message:"All Category Products successfully fetched"
    })
})
//revalidate on New ,update, delete Product
export const getAdminProducts=TryCatch(async(req,res,next)=>{

    let products;
    
    if(myCache.has("all-products")){
        products=JSON.parse(myCache.get("all-products") as string);
    }
    else{
        products=await Product.find({});
        myCache.set("all-products",JSON.stringify(products));
    }

    return res.status(200).json({
        success:true,
        products,
        message:"All Products successfully fetched"
    })
});

export const getProduct=TryCatch(async(req,res,next)=>{

    const userId=req.params.id;
    let product;
    
    if(myCache.has(`product-${userId}`)){
        product=JSON.parse(myCache.get(`product-${userId}`) as string);
    }
    else{
        product=await Product.findById(userId);
        if(!product){
            return next(new ErrorHandler("Invalid product ID",404));
        }
        myCache.set(`product-${userId}`,JSON.stringify(product) as string);
    }

    return res.status(200).json({
        success:true,
        product,
        message:"Requested Product fetched successfully"
    });
});

export const updateProduct=TryCatch(async(req:Request<{id:string},{},NewProductRequestBody>,
    res,next)=>{
    const {id}=req.params;
    
    const {name,category,price,stock}=req.body;
    const photo=req.file;

    const product=await Product.findById(id);
    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }

    if(photo){
        rm(product?.photo!,()=>{
            console.log("previous Deleted");
        });

        product.photo=photo.path;
    }

    if(name){
        product.name=name;
    }
    if(price) product.price=price;
    if(stock) product.stock=stock;
    if(category) product.category=category;

    await product.save();

    InvalidateCache({product:true,productId:String(product._id),admin:true});

    return res.status(200).json({
        success:true,
        message:"Product updated successfully",
        product,
    })
})

export const deleteProduct=TryCatch(async(req,res,next)=>{

    const {id}:{id:string}=req.params;
    
    const product=await Product.findById(id);
    if(!product){
        return next(new ErrorHandler("Invalid product ID",404));
    }

    rm(product.photo!,()=>{
        console.log("Product photo Deleted");
    });

    await product.deleteOne({id});
    InvalidateCache({product:true,productId:String(id),admin:true});

    return res.status(200).json({
        success:true,
        product,
        message:"Product deleted successfully"
    });
});


export const getAllProducts=TryCatch(async(
    req:Request<{},{},{},SearchRequestQuery>,
    res,
    next)=>{
        const {search,sort,price,category}=req.query;

        const page=Number(req.query.page) || 1;

        const limit=Number(process.env.PRODUCT_PER_PAGE) || 8;
        const skip=(page-1)*limit;

        const baseQuery:BaseQuery={};

        if(search){
            baseQuery.name={
                $regex:search,//search for all patterns
                $options:"i"//option case insensitive
            };
        }

        if(price){
            baseQuery.price={
                $lte:Number(price)//less than equal to
            }
        }

        if(category){
            baseQuery.category=category;
        }  
         

        const productsPromise=Product.find(
            baseQuery
        )
        .sort(sort && {price:sort==="asc"?  1:-1})
        .limit(limit)
        .skip(skip);

        const [products,filteredOnlyProduct]=await Promise.all([
            productsPromise,
            Product.find(baseQuery)
        ])
        
        const totalPage=Math.ceil(filteredOnlyProduct.length/limit);
        return res.status(200).json({
            success:true,
            message:"search is successfull",
            products,
            totalPage,
        })


})

