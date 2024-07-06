import productsModel from "../models/products.model.js";
import { UniqueError } from "../../handle.error/uniqueError.js"

class ProductService {

    #checkOptionalProductData(product) {
        const isBool = x => typeof x === "boolean";
        const isString = x => typeof x === "string";
        const isStringsArray = arr => arr.every(isString);

        if (product.status === null) {
            product.status = true;
        }

        if (!product.thumbnails) {
            product.thumbnails = ["sin imagen"];
        }

        if (!isBool(product.status)) {
            return { valid: false, error: "El estado debe ser un booleano." };
        }

        if (!isStringsArray(product.thumbnails)) {
            return { valid: false, error: "Los thumbnails deben ser un array de strings." };
        }

        return { valid: true };
    }

    #checkRequiredProductData(errors) {
        let errorMessage = 'Producto no agregado. Datos erróneos: ';

        for (let field in errors) {
            switch (field) {
                case 'title':
                    errorMessage += 'El titulo es requerido y debe ser un String.';
                    break;
                case 'description':
                    errorMessage += 'La descripción es requerida y debe ser un String.';
                    break;
                case 'price':
                    errorMessage += 'El precio es requerido y debe ser un número.';
                    break;
                case 'code':
                    errorMessage += 'El código es requerido y debe ser un String.';
                    break;
                case 'stock':
                    errorMessage += 'El stock es requerido y debe ser un número.';
                    break;
                case 'category':
                    errorMessage += 'La categoría es requerida y debe ser un String.';
                    break;
                default:
                    errorMessage += `${field}: ${errors[field].message}. `;
            }
        }
        return errorMessage;
    }

    async insertProducts(productsData) {
        try {
            let result = await productsModel.insertMany(productsData);
            return result;
        } catch (error) {
            throw new Error(`No se pueden insertar los productos\n ${error.message}`);
        }
    }

    async addProduct(product) {
        try {
            console.log("🚀 ~ ProductServiceDao ~ addProduct ~ product:", product);

            //Chequeo que los datos sean de tipo correcto
            const validationResult = this.#checkOptionalProductData(product);
            if (!validationResult.valid) {
                console.log({
                    error: `Producto no agregado. Datos erróneos: ${validationResult.error}
                    Lista de propiedades requeridas:
                    - title: String
                    - description: String
                    - price: Number
                    - code: String
                    - stock: Number
                    - category: String
                    Lista de propiedades opcionales:
                    - status: Bool
                    - thumbnails: Array de strings`
                });
                return { error: `Producto no agregado. Datos erróneos: ${validationResult.error}` };
            }

            //Agrego el producto
            await productsModel.create(product);
            return { message: "Producto agregado!" };

        } catch (error) {
            //Chequeo si el error es por codigo repetido 
            if (error.name === 'MongoServerError' && error.code === 11000) {
                throw new UniqueError('Producto invalido. El codigo ya existe')
            }
            if (error.name === 'ValidationError') {
                const errors = error.errors;
                const errorMessage = this.#checkRequiredProductData(errors);
                throw new UniqueError(errorMessage.trim());
            }
            throw new Error(`No se puede agregar el producto\n ${error.message}`);
        }
    }

    async getAllProducts() {
        try {
            return await productsModel.find({}).lean();
        } catch (error) {
            throw new Error(`No se pueden obtener los productos\n ${error.message}`);
        }
    }

    async getProducts(page, limit, query, sort) {
        try {
            const options = { page: page, limit: limit };

            let link = `/products?limit=${limit}`;

            if (sort) {
                options.sort = { price: sort };
                link = `${link}&sort=${sort}`
            }

            if (query && Object.keys(query).length != 0) {
                link = `${link}&query=${query}`
            }

            const result = await productsModel.paginate(query, options);

            return {
                payload: result.docs,
                totalPages: result.totalPages,
                prevPage: result.prevPage,
                nextPage: result.nextPage,
                page: result.page,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage,
                prevLink: result.hasPrevPage ? `${link}&page=${result.prevPage}` : null,
                nextLink: result.hasNextPage ? `${link}&page=${result.nextPage}` : null
            }


        } catch (error) {
            throw new Error(`No se pueden obtener los productos\n ${error.message}`);
        }
    }

    async getProductById(pid) {
        try {
            const product = await productsModel.find({ "_id": pid });
            return product.length === 0 ? { error: "Not found" } : product;

        } catch (error) {
            throw new Error(`No se puede obtener el producto con id ${pid}\n ${error.message}`);
        }
    }

    async updateProduct(pid, newData) {
        try {
            const result = await productsModel.updateOne({ "_id": pid }, { $set: newData });
            console.log("ProductServiceDao ~ updateProduct ~ result:", result);

            return result.matchedCount === 0
                ? { error: `No se puede actualizar el producto con id ${pid} porque no existe` }
                : { message: `Se actualizó el producto con id ${pid}` };

        } catch (error) {
            throw new Error(`No se puede actualizar el producto con id ${pid}\n ${error.message}`);
        }
    }

    async deleteProduct(pid) {
        console.log( pid);
        try {
            const result = await productsModel.deleteOne({ "_id": pid });
            console.log(result)

            return result.deletedCount === 0 ? { error: "Not found" } : { message: `Se eliminó el producto con id ${pid}` };

        } catch (error) {
            throw new Error(`No se puede eliminar el producto con id ${pid}\n ${error.message}`);
        }
    }
}

export default ProductService;