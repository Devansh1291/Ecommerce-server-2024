import express from "express"
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middlewares/error.js";
import NodeCache from "node-cache";
import {config} from "dotenv";
import morgan from "morgan";
import Stripe from "stripe";
import cors from "cors";

//importing routes
import userRoute from "./routers/user.js";
import productRoute from './routers/product.js'
import orderRoute from './routers/order.js'
import paymentRoute from './routers/payments.js'
import dashboardRoute from './routers/stats.js'


config({
    path:'./.env',
})
console.log("port...",process.env.PORT);
const port=process.env.PORT || 4000

const mongoURI=process.env.MONGO_URI || "";

const stripeKey=process.env.STRIPE_KEY || "";

console.log("stripeKey...",stripeKey);

connectDB(mongoURI);

export const stripe=new Stripe(stripeKey);

export const myCache=new NodeCache();

const app=express();

//importing middlewares
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

app.use("/api/v1/user",userRoute);
app.use("/api/v1/product",productRoute);
app.use("/api/v1/order",orderRoute);
app.use("/api/v1/payment",paymentRoute);
app.use("/api/v1/dashboard",dashboardRoute);

app.use("/uploads",express.static("uploads"));
app.use(errorMiddleware);

app.listen(port,()=>{
    console.log(`Server is working on http://localhost:${port}`);
})

