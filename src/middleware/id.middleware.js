import mongoose from "mongoose";
import { HttpResponse } from "../middleware/error-handle.js";
const httpResponse = new HttpResponse();

//Funcion para chequear errores en id's
function idErrors(req, res, next) {
    if (req.params.pid && !mongoose.Types.ObjectId.isValid(req.params.pid)) {
        req.logger.error("Product id error");
        return httpResponse.BadRequest(res, "Product id is not valid");
    }
    if (req.params.cid && !mongoose.Types.ObjectId.isValid(req.params.cid)) {
        req.logger.error("Cart id error");
        return httpResponse.BadRequest(res, "Cart id is not valid");
    }
    next();
};
export default idErrors;