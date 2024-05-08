import express from "express";
import { getAllUsers, newUser ,getUser ,deleteUser } from "../controllers/user.js";
import { adminOnly } from "../middlewares/auth.js";

const app=express.Router();

//api/v1/user/new

app.post("/new",newUser);
app.get("/all",adminOnly,getAllUsers);
app.get("/:id",adminOnly,getUser);
app.delete("/:id",adminOnly,deleteUser);
export default app;

