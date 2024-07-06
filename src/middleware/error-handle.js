import { StatusCodes } from "http-status-codes";

export const DictionaryErrors = {
  ROUTING_ERROR: `ROUTING_ERROR`, 
  INVALID_TYPES_ERROR: `INVALID_TYPES_ERROR`,
  CONTROLLER_ERROR: `CONTROLLER_ERROR`,
  SERVICE_ERROR: `SERVICE_ERROR`,
  DATABASE_ERROR: `DATABASE_ERROR`,
  INVALID_PARAMS_ERROR: `INVALID_PARAMS_ERROR`,
  INTERNAL_SERVER_ERROR: `INTERNAL_SERVER_ERROR`,
};

export class HttpResponse {
  OK(res, message, data) {
    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: message,
      data,
    });
  } //200

  NotFound(res, message, data) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: StatusCodes.NOT_FOUND,
      message: message,
      data,
    });
  } //404

  Unauthorized(res, message, data) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusCodes.UNAUTHORIZED,
      message: message,
      data,
    });
  } //401

  Forbbiden(res, message, data) {
    return res.status(StatusCodes.FORBIDDEN).json({
      status: StatusCodes.FORBIDDEN,
      message: message,
      data,
    });
  } //403

  BadRequest(res, message, data) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      message: message,
      data,
    });
  } //400

  Error(res, message, data, codeError) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: message,
      data,
      codeError,
    });
  } //500
}