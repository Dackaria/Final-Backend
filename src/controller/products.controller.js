import { productService } from "../repository/index.js";
import { GOOGLE_EMAIL } from "../config/config.js";
import { transporter } from "../utils/email.js";
import { HttpResponse } from "../middleware/error-handle.js";

const httpResponse = new HttpResponse();

// INSERTION
const insertProductsCtrl = async (req, res, next) => {
    try {
        let result = await productService.insertProducts(productsData);
        return res.json({
            status: "success",
            message: "all the products were inserted successfully",
            products: result,
        });
    } catch (error) {
        req.logger.error(`${error.message}`);
        next(error);
    }
};

// GET products
const getProductsCtrl = async (req, res, next) => {
    try {
        req.logger.info(`GET products - req.query: ${JSON.stringify(req.query)}`);

        if ((req.query.limit && isNaN(req.query.limit)) || Number(req.query.limit) < 0) {
            req.logger.error("GET: Limit error");
            return httpResponse.BadRequest(res, "this limit is not valid");
        }
        if ((req.query.page && isNaN(req.query.page)) || Number(req.query.page) < 0) {
            req.logger.error("GET: Page error");
            return httpResponse.BadRequest(res, "this page is not valid");
        }

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const sort = req.query.sort === 'Ascendente' ? 1
            : req.query.sort === 'Descendente' ? -1
                : null;

        const query = req.query.query || null;

        let queryObj = {};
        if (query != undefined && query != 'null') {
            let queryArr = query.split(":");
            queryObj[queryArr[0]] = queryArr[1];
        }

        const result = await productService.getProducts(page, limit, queryObj, sort);

        return res.status(200).json({
            status: "success",
            ...result,
            prevLink: result.hasPrevPage ? `/api${result.prevLink}` : null,
            nextLink: result.hasNextPage ? `/api${result.nextLink}` : null
        });

    } catch (error) {
        req.logger.error(`${error.message}`);
        next(error);
    }
};

// GET product by id
const getProductByIdCtrl = async (req, res, next) => {
    try {
        req.logger.info(`Get product with id ${req.params.pid}`);

        const result = await productService.getProductById(req.params.pid);
        if (result.error) return httpResponse.NotFound(res, result.error);
        return res.send(result);

    } catch (error) {
        req.logger.error(`${error.message}`);
        next(error);
    }
};

// DELETE product by id
const deleteProductByIdCtrl = async (req, res, next) => {
    try {
        const pid = req.params.pid;
        req.logger.info(`Delete product with id ${pid}`);

        const userEmail = req.session.user.email;
        req.logger.info(`User email: ${userEmail}`);

        const product = await productService.getProductById(pid);
        if (product.error) return httpResponse.NotFound(res, product.error);
        const productOwner = product[0].owner;

        const message = {
            from: GOOGLE_EMAIL,
            to: productOwner,
            subject: `Se ha eliminado un producto del que sos dueño en el ecommerce`,
            html: `
            <div>
              <h1>Se ha eliminado su producto</h1>
              <p>
              Usted había creado un producto en el ecommerce.
              Le avisamos que se ha eliminado por parte del administrador.
    
              Saludos!
              </p>
            </div>
            `
        };

        if (userEmail === productOwner || userEmail === "adminCoder@coder.com") {
            const resultDelete = await productService.deleteProduct(pid);

            if (resultDelete.error) return httpResponse.NotFound(res, resultDelete.error);

            let resultEmail = await transporter.sendMail(message);

            if (resultEmail.rejected.length != 0) {
                req.logger.error(`El email no se pudo enviar`);
                return httpResponse.BadRequest(res, `El email no se pudo enviar`);
            }

            return httpResponse.OK(res, resultDelete.message);
        }
        return httpResponse.Unauthorized(res, `No puede eliminar el producto con id ${pid} porque no es dueño`);

    } catch (error) {
        req.logger.error(`${error.message}`);
        next(error);
    }
};

// POST product
const addProductCtrl = async (req, res, next) => {
    try {
        let newProduct;

        if (req.session.user.role === 'PREMIUM') {
            const userEmail = req.session.user.email;
            req.logger.info(`User email: ${userEmail}`);
            newProduct = { ...req.body, owner: userEmail };
        }
        else {
            newProduct = req.body;
        }
        const result = await productService.addProduct(newProduct);
        if (result.error) return httpResponse.BadRequest(res, result.error);

        return httpResponse.OK(res, result.message);

    } catch (error) {
        req.logger.error(`${error.message}`);
        if (error instanceof UniqueError) {
            return httpResponse.BadRequest(res, error.message);
        }
        next(error);
    }
};

// PUT product by id
const updateProductByIdCtrl = async (req, res, next) => {
    try {
        const pid = req.params.pid;
        req.logger.info(`Edit product with id ${pid}`);

        const userEmail = req.session.user.email;
        req.logger.info(`User email: ${userEmail}`);

        const product = await productService.getProductById(pid);
        if (product.error) return httpResponse.NotFound(res, product.error);

        if (userEmail === product[0].owner || userEmail === "adminCoder@coder.com") {
            const resultUpdate = await productService.updateProduct(pid, req.body);
            if (resultUpdate.error) return httpResponse.NotFound(res, resultUpdate.error);

            return httpResponse.OK(res, resultUpdate.message);
        }
        return httpResponse.Unauthorized(res, `No puede editar el producto con id ${pid} porque no es dueño`);

    } catch (error) {
        req.logger.error(`${error.message}`);
        next(error);
    }
};

export {
    insertProductsCtrl,
    getProductsCtrl,
    getProductByIdCtrl,
    deleteProductByIdCtrl,
    addProductCtrl,
    updateProductByIdCtrl,
};
