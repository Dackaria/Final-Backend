import cartsModel from "../models/carts.model.js";
import ticketsModel from "../models/tickets.model.js";
import { productService } from "../../repository/index.js";
import TicketDTO from "../../dto/ticket.dto.js";

class CartService {

    async #getCarts() {
        try {
            return await cartsModel.find({});

        } catch (error) {
            throw new Error(`No se pueden obtener los carritos\n ${error.message}`);
        }
    }

    async #checkCartAndProduct(cid, pid, userEmail) {
        //Chequeo si el carrito existe
        const cart = await this.getCartById(cid);
        if (cart.error) return { error: "Cart not found" };

        //Chequeo si el producto existe en el ecommerce
        const product = await productService.getProductById(pid);
        if (product.error) return { error: "Product not available" };

        if (userEmail === product[0].owner) {
            return {
                code: 401,
                error: `No puede agregar el producto con id ${pid} porque usted es dueño de ese producto`
            }
        };
    }

    async addCart() {
        try {
            //Creo el carrito
            const cart = await cartsModel.create({ products: [] });
            return { message: `Nuevo carrito agregado con id: ${cart._id}`, cart: cart };

        } catch (error) {
            throw new Error(`No se puede agregar el carrito\n ${error.message}`);
        }
    }

    async getCartById(cid) {
        try {
            const cart = await cartsModel.find({ "_id": cid })
            return cart.length === 0 ? { error: "Not found" } : cart;

        } catch (error) {
            throw new Error(`No se puede obtener el carrito con id ${cid}\n ${error.message}`);
        }
    }

    async addProductToCart(cid, pid, userEmail) {
        try {
            const checkResult = await this.#checkCartAndProduct(cid, pid, userEmail);
            if (checkResult) return checkResult;

            //Chequeo si el producto ya esta o no en el carrito
            const productExist = await cartsModel.find({
                "_id": cid, "products": { $elemMatch: { "product": pid } }
            })

            //Agrego cambios en el carrito
            let result;
            if (productExist.length === 0) {
                result = await cartsModel.findOneAndUpdate({ "_id": cid },
                    { $push: { products: { product: pid, quantity: 1 } } });
            } else {
                result = await cartsModel.updateOne({ "_id": cid, "products.product": pid },
                    { $inc: { "products.$.quantity": 1 } });
            }


            return result.acknowledged === false || result.modifiedCount === 0
                ? { error: `No se puede agregar el producto ${pid} al carrito ${cid}` }
                : { message: `Producto ${pid} agregado al carrito ${cid}` };


        } catch (error) {
            throw new Error(`No se puede agregar el producto al carrito\n ${error.message}`);
        }
    }

    async deleteProductInCart(cid, pid) {
        try {
            const result = await cartsModel.updateOne(
                { "_id": cid },
                { $pull: { products: { product: pid } } },
            )

            return result.modifiedCount === 0 ? { error: "Not found" } : { message: `Se eliminó el producto con id ${pid}` };

        } catch (error) {
            throw new Error(`No se puede eliminar el producto con id ${id}\n ${error.message}`);
        }
    }

    async deleteAllInCart(cid) {
        try {
            const result = await cartsModel.updateOne(
                { "_id": cid },
                { $set: { products: [] } },
            )

            return result.matchedCount === 0 ? { error: "Not found" } : { message: `Se eliminaron todos los productos del carrito ${cid}` };

        } catch (error) {
            throw new Error(`No se puede obtener el carrito con id ${id}\n ${error.message}`);
        }
    }

    async updateProductQuantityInCart(cid, pid, newQuantity) {
        try {
            const checkResult = await this.#checkCartAndProduct(cid, pid);
            if (checkResult) return checkResult;

            //Chequeo si el producto ya esta o no en el carrito
            const productExist = await cartsModel.find({
                "_id": cid, "products": { $elemMatch: { "product": pid } }
            })

            //Agrego cambios en el carrito
            let result;
            if (productExist.length === 0) {
                result = await cartsModel.findOneAndUpdate({ "_id": cid },
                    { $push: { products: { product: pid, quantity: newQuantity } } });
            } else {
                result = await cartsModel.updateOne({ "_id": cid, "products.product": pid },
                    { $set: { "products.$.quantity": newQuantity } });
            }

            return result.matchedCount === 0 ? { error: "Not found" } : { message: `Se actualizo la cantidad del producto ${pid}` };

        } catch (error) {
            throw new Error(`No se puede obtener el carrito con id ${cid}\n ${error.message}`);
        }
    }

    async updateCart(cid, newData) {
        try {
            const result = await cartsModel.updateOne(
                { "_id": cid },
                { $set: { products: newData } });

            return result.matchedCount === 0
                ? { error: "Not found" }
                : { message: `Se actualizó el carrito con id ${cid}` };

        } catch (error) {
            throw new Error(`No se puede actualizar el producto con id ${id}\n ${error.message}`);
        }
    }

    async buyCart(user) {
        console.log(user);
        try {
            const cart = (await this.getCartById(user.cart))[0].products;

            const { available, unavailable } = await this.#separateProducts(cart)

            for (const item of available) {
                const quantity = item.product.stock - item.quantity;
                await productService.updateProduct(item.product._id, { "stock": quantity });
            };

            const amount = await this.#getTotalAmountCart(available);

            const purchaser = user.email;

            const ticketDTO = new TicketDTO({ amount, purchaser });
            const ticket = await ticketsModel.create(ticketDTO);
            console.log(ticket);

            const updatedCart = await this.updateCart(user.cart, unavailable);
            console.log(updatedCart);

            if (unavailable.length === 0) {
                return {
                    message: "Compra exitosa! No tenes productos pendientes.",
                    ticket: ticket
                };
            }

            return {
                message: "Compra exitosa! Tenes productos pendientes en tu carrito debido a que no tenian stock.",
                productsUnavailable: unavailable
            };

        } catch (error) {
            throw new Error(`No se puede finalizar la compra del carrito con id ${cid}\n ${error.message}`);
        }
    }

    async #getTotalAmountCart(cart) {
        let total = 0;

        cart.forEach(item => {
            total += item.product.price * item.quantity;
        });

        return total;
    }

    async #separateProducts(cart) {
        const availableProducts = [];
        const unavailableProducts = [];

        cart.forEach(item => {
            if (item.quantity <= item.product.stock) {
                availableProducts.push(item);
            } else {
                unavailableProducts.push(item);
            }
        });

        return {
            available: availableProducts,
            unavailable: unavailableProducts
        };
    }
}

export default CartService;