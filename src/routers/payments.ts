import express from "express";
import { applyDiscount, createPaymentIntent, deleteCoupon, getAllCoupon, newCoupon } from "../controllers/payment.js";
import { adminOnly } from "../middlewares/auth.js";

const app=express.Router();

app.post("/create",createPaymentIntent)

app.post("/coupon/new",adminOnly,newCoupon);

app.get("/discount",applyDiscount);
app.get("/coupon/all",adminOnly,getAllCoupon);
app.delete("/coupon/:id",adminOnly,deleteCoupon);

export default app;