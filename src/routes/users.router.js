import { Router } from "express";
import passport from "passport";
import checkAuthJwt from "../middleware/auth-jwt.middleware.js";
import authMdw from "../middleware/auth.middleware.js"
import {
  logoutCtrl,
  loginCtrl,
  registerCtrl,
  changePswCtrl,
  currentCtrl,
  sendChangePswMailCtrl,
  changeRoleCtrl,
  getAllUsersCtrl,
  deleteOneUserCtrl,
  deleteOldUsersCtrl
} from "../controller/users.controller.js";

const router = Router();

// LOGOUT
router.get("/logout", logoutCtrl);

// LOGIN
router.post("/login", loginCtrl);

// REGISTER
router.post("/register", (req, res, next) => {
    console.log("Solicitud POST a /api/users/register recibida"); // Añade un log para verificar que la solicitud llega correctamente
    registerCtrl(req, res, next);
  });

// CHANGE PASSWORD
router.post("/changePsw", changePswCtrl);

// SEND CHANGE PASSWORD MAIL
router.post("/changePswMail", sendChangePswMailCtrl);

// CURRENT
router.get("/current", checkAuthJwt("jwt"), currentCtrl);

// GET ALL USERS
router.get("/", authMdw(["ADMIN"]), (req, res, next) => {
    console.log("Solicitud GET a /api/users recibida"); // Añade un log para verificar que la solicitud GET llega correctamente
    getAllUsersCtrl(req, res, next);
  });
  
// DELETE ONE USER
router.delete("/:email", authMdw(["ADMIN"]), deleteOneUserCtrl);

// DELETE OLD USERS
router.delete("/", authMdw(["ADMIN"]), deleteOldUsersCtrl);

// CHANGE ROLE
// router.post("/premium/:uid", changeRoleCtrl);
router.post("/:email", authMdw(["ADMIN"]), changeRoleCtrl);


export default router;