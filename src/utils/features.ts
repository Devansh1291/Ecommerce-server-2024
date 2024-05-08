import mongoose from "mongoose";
import { InvalidateCacheProps, OrderItemType } from "../types/types.js";
import { myCache } from "../app.js";
import { Product } from "../models/product.js";
import ErrorHandler from "./utility-class.js";
import { Order } from "../models/order.js";

export const connectDB=(uri:string)=>{
    mongoose.connect(uri,{
        dbName:"Ecommerce_24"
        // useNewUrlParser(true)
        // useUnifiedTopology(true)

    }).then(c=>console.log("Db successfully connected"))
    .catch(e=>console.log(e.message))
}

export const InvalidateCache=({product,order,admin,userId,orderId,productId}:InvalidateCacheProps)=>{
    if(product){
        const productKeys:string[]=[
            "latest-products",
            "categories",
            "all-products",
            
        ];
        if(typeof productId == "string"){
            productKeys.push(`product-${productId}`);
        }
        else if(typeof productId == "object"){
            productId.forEach((i)=>productKeys.push(`product-${productId}`));
        }
        myCache.del(productKeys);
    }
    if(order){
        const orderKeys:string[]=[
            "all-orders",
            `my-orders-${userId}`,
            `order-${orderId}`
        ]

        myCache.del(orderKeys);
    }
    if(admin){
        myCache.del([
            "admin-stats",
            "admin-pie-charts",
            "admin-bar-charts",
            "admin-line-charts"
        ])
    }
}

export const reduceStock=async(orderItems:OrderItemType[])=>{

    for(let i=0;i<orderItems.length;i++){
        const order=orderItems[i];
        const product=await Product.findById(order.productId);
        if(!product){
            throw new ErrorHandler("Product not found",404);
        }
        product.stock-=order.quantity;
        await product.save();
    }
}

export const calculatePercentage = (thisMonth: number, lastMonth: number) => {
    if (lastMonth === 0) return thisMonth * 100;
    const percent = (thisMonth / lastMonth) * 100;
    return Number(percent.toFixed(0));  
  };

export const getInventories=async(
    {categories,productsCount}:{categories:string[],productsCount:number}
)=>{
    const categoriesCountPromise=categories.map((category)=>
        Product.countDocuments({category})
    )

    const categoriesCount=await Promise.all(categoriesCountPromise);

    const categoryCount:Record<string,number>[]=[];

    categories.forEach((category,i)=>{
            const key=category;
            categoryCount.push({
                [key]:Math.round((categoriesCount[i]/productsCount)*100)
            });
        }
    );

    return categoryCount;
}

export interface MyDocument extends Document {
    createdAt: Date;
    discount: number;

}

type FuncProps = {
    length: number;
    docArr: MyDocument[];
    today: Date;
    property?: "discount" | "total";
};
  
export const getChartData = ({
    length,
    docArr,
    today,
    property,
  }: FuncProps) => {
    const data: number[] = new Array(length).fill(0);
  
    docArr.forEach((i) => {
      const creationDate = i.createdAt;
      const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;
  
      if (monthDiff < length) {
        if (property) {
          data[length - monthDiff - 1] += i.discount!;
        } else {
          data[length - monthDiff - 1] += 1;
        }
      }
    });
  
    return data;
  };