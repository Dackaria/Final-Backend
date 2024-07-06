import { cartService } from "../repository/index.js";
import { HttpResponse } from "../middleware/error-handle.js";
const httpResponse = new HttpResponse();

// Crea un nuevo carrito
const addCartCtrl = async (req, res, next) => {
    try {
        const result = await cartService.addCart();
        if (result.error) return httpResponse.BadRequest(res, result.error);

        return httpResponse.OK(res, result.message);

    } catch (error) {
        req.logger.error(`${error.message}`);
        next(error);
    }
};

// Listar los productos que pertenezcan al carrito con el parámetro cid
const getCartByIdCtrl = async (req, res, next) => {
    try {
        req.logger.info(`Get cart with id ${req.params.cid}`);

        const result = await cartService.getCartById(req.params.cid);
        if (result.error) return httpResponse.NotFound(res, result.error);

        return res.send(result);

    } catch (error) {
        req.logger.error(`${error.message}`);
        next(error);
    }
};

// Agregar el producto al carrito seleccionado
const addProductToCartCtrl = async (req, res, next) => {
    try {
        const userEmail = req.session.user.email;
        const result = await cartService.addProductToCart(req.params.cid, req.params.pid, userEmail);
        if (result.code) return httpResponse.Unauthorized(res, result.error);
        if (result.error) return httpResponse.NotFound(res, result.error);

        return res.send(result);

    } catch (error) {
        req.logger.error(`${error.message}`);
        next(error);
    }
};

// Eliminar el producto seleccionado de un carrito determinado
const deleteProductInCartCtrl = async (req, res, next) => {
    try {
        const result = await cartService.deleteProductInCart(req.params.cid, req.params.pid);
        if (result.error) return httpResponse.NotFound(res, result.error);

        return httpResponse.OK(res, result.message);

    } catch (error) {
        req.logger.error(`${error.message}`);
        next(error);
    }
};

// Eliminar todos los productos del carrito seleccionado
const deleteAllInCartCtrl = async (req, res, next) => {
    try {
        const result = await cartService.deleteAllInCart(req.params.cid);
        if (result.error) return httpResponse.NotFound(res, result.error);

        return httpResponse.OK(res, result.message);

    } catch (error) {
        req.logger.error(`${error.message}`);
        next(error);
    }
};

// Actualizar solo la cantidad dada de ejemplares del producto
const updateProductQuantityInCartCtrl = async (req, res, next) => {
    try {
        const result = await cartService.updateProductQuantityInCart(req.params.cid, req.params.pid, req.body.quantity);
        if (result.error) return httpResponse.NotFound(res, result.error);

        return httpResponse.OK(res, result.message);

    } catch (error) {
        req.logger.error(`${error.message}`);
        next(error);
    }
};

// Actualizar carrito con arreglo de productos
const updateCartCtrl = async (req, res, next) => {
    try {
        req.logger.info(`Update cart - body: ${req.body}`);
        const result = await cartService.updateCart(req.params.cid, req.body);
        if (result.error) return httpResponse.NotFound(res, result.error);

        return httpResponse.OK(res, result.message);

    } catch (error) {
        req.logger.error(`${error.message}`);
        next(error);
    }
};

// Finalizar el proceso de compra del carrito
const buyCartCtrl = async (req, res, next) => {
    try {
        // const result = await cartService.buyCart(req.params.cid);
        const result = await cartService.buyCart(req.user.user);

        if (result.error) return httpResponse.NotFound(res, result.error);

        return httpResponse.OK(res, result.message);

    } catch (error) {
        req.logger.error(`${error.message}`);
        next(error);
    }
};

export {
    addCartCtrl,
    getCartByIdCtrl,
    addProductToCartCtrl,
    deleteProductInCartCtrl,
    deleteAllInCartCtrl,
    updateProductQuantityInCartCtrl,
    updateCartCtrl,
    buyCartCtrl
};