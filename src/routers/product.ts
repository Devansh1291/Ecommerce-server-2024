import express from "express";
import { deleteProduct, getAllCategories, getAllProducts, getLatestProducts, getProduct, newProduct, updateProduct } from "../controllers/product.js";
import { singleUpload } from "../middlewares/multer.js";
import { adminOnly } from "../middlewares/auth.js";
import { getAdminProducts } from "../controllers/product.js";

const app=express.Router();
//to create new product- /api/v1/product/new
app.post("/new",adminOnly,singleUpload,newProduct);
//get all products with filter- /api/v1/product/all
app.get("/all",getAllProducts);
//to get last 10 product- /api/v1/product/latest
app.get("/latest",getLatestProducts);
//to get distinct categories- /api/v1/product/categories
app.get("/categories",getAllCategories);
//to get all products- /api/v1/product/new
app.get("/admin-products",getAdminProducts);

app.route("/:id")
.get(getProduct)
.put(adminOnly,singleUpload,updateProduct)
.delete(adminOnly,deleteProduct);




export default app;