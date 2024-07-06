import ProductRepository from "./products.repository.js";
import CartRepository from "./carts.repository.js";
import UserRepository from "./users.repository.js";
import MessageRepository from "./messages.repository.js";

import ProductService from "../daos/mongoDB/products.service.js"
import CartService from "../daos/mongoDB/carts.service.js";
import UserService from "../daos/mongoDB/users.service.js";
import MessageService from "../daos/mongoDB/messages.service.js";

export const productService = new ProductRepository(new ProductService());
export const cartService = new CartRepository(new CartService());
export const userService = new UserRepository(new UserService());
export const messageService = new MessageRepository(new MessageService());