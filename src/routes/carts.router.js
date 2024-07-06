import  { Router } from "express";
import {
    addCartCtrl,
    getCartByIdCtrl,
    addProductToCartCtrl,
    deleteProductInCartCtrl,
    deleteAllInCartCtrl,
    updateProductQuantityInCartCtrl,
    updateCartCtrl,
    buyCartCtrl
} from "../controller/carts.controller.js"
import authMdw from "../middleware/auth.middleware.js"
import authUserMdw from "../middleware/auth-user.middleware.js";
import idErrors from "../middleware/id.middleware.js"; 

const router = Router();

// POST /api/carts/
router.post(`/`, authMdw(["USER","PREMIUM"]), authUserMdw, addCartCtrl);

// GET /api/carts/:cid
router.get(`/:cid`, authMdw(["USER","PREMIUM"]), authUserMdw, idErrors, getCartByIdCtrl);

// POST /api/carts/:cid/product/:pid
router.post(`/:cid/product/:pid`, authMdw(["USER","PREMIUM"]), authUserMdw, idErrors, addProductToCartCtrl);

// DELETE /api/carts/:cid/product/:pid
router.delete(`/:cid/product/:pid`, authMdw(["USER","PREMIUM"]), authUserMdw, idErrors, deleteProductInCartCtrl);

// DELETE /api/carts/:cid
router.delete(`/:cid`, authMdw(["USER","PREMIUM"]), authUserMdw, idErrors, deleteAllInCartCtrl);

// PUT /api/carts/:cid/product/:pid
router.put(`/:cid/product/:pid`, authMdw(["USER","PREMIUM"]), authUserMdw, idErrors, updateProductQuantityInCartCtrl);

// PUT /api/carts/:cid
router.put(`/:cid`, authMdw(["USER","PREMIUM"]), authUserMdw, idErrors, updateCartCtrl);

// POST /api/carts/:cid/purchase
router.post(`/:cid/purchase`, authMdw(["USER","PREMIUM"]), authUserMdw, idErrors, buyCartCtrl);

export default router;