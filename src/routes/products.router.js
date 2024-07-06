import  { Router } from "express";
import {
    insertProductsCtrl, 
    getProductsCtrl,
    getProductByIdCtrl,
    deleteProductByIdCtrl,
    addProductCtrl,
    updateProductByIdCtrl,
} from "../controller/products.controller.js"
import authMdw from "../middleware/auth.middleware.js"
import idErrors from "../middleware/id.middleware.js";
import upload from "../config/multer.config.js";

const router = Router();

// GET /api/products/insertion
router.get(`/insertion`, authMdw(["ADMIN"]), insertProductsCtrl);

// GET /api/products/
// /api/products/?page=2&limit=5
// /api/products/?sort=asc
// /api/products/?query={categoria:Mochilas}
router.get(`/`, authMdw(["PUBLIC"]), getProductsCtrl);

// GET /api/products/:pid
router.get(`/:pid`, authMdw(["PUBLIC"]), idErrors, getProductByIdCtrl);

// DELETE /api/products/:pid
router.delete(`/:pid`, authMdw(["ADMIN","PREMIUM"]), idErrors, deleteProductByIdCtrl);

// POST /api/products/
router.post(`/`, authMdw(["ADMIN","PREMIUM"]), addProductCtrl);

// PUT /api/products/:pid
router.put(`/:pid`, authMdw(["ADMIN","PREMIUM"]), idErrors, updateProductByIdCtrl);

export default router;