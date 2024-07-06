import jwt from "jsonwebtoken";
import { generateJWT, SECRET_JWT } from "../utils/jwt.js";
import { userService } from "../repository/index.js";
import { transporter } from "../utils/email.js";
import { TIME_EXPIRE_JWT_SESSION, TIME_EXPIRE_JWT_CHANGE_PSW, GOOGLE_EMAIL } from "../config/config.js"
import { HttpResponse } from "../middleware/error-handle.js";
import { cartService } from "../repository/index.js"; 
const httpResponse = new HttpResponse();

// LOGOUT
const logoutCtrl = async (req, res) => {
  req.session.destroy((err) => {
    if (!err) {
      req.logger.info("Se cerró la sesión...")
      return res.redirect("/login")
    };
    req.logger.error(`logout error: ${err.message}`);
    return res.send({ message: `logout error`, body: err });
  });
};

// LOGIN
const loginCtrl = async (req, res, next) => {
  try {
    req.logger.info(`BODY LOGIN: ${JSON.stringify(req.body)}`);
    const { email, password } = req.body;

    const session = req.session;
    req.logger.info(`Session: ${JSON.stringify(session)}`);

    const foundUser = await userService.getUser(email, password);
    if (foundUser.error) {
      return res.status(foundUser.code).json({
        status: foundUser.code,
        message: foundUser.error,
      });
    };

    if (foundUser.email != "adminCoder@coder.com") {
      foundUser.last_connection = new Date();
      await foundUser.save();
    }

    const user = {
      first_name: foundUser.first_name,
      last_name: foundUser.last_name,
      email: foundUser.email,
      role: foundUser.role,
      cart: foundUser.cart
    }

    // Con session
    req.session.user = user;

    // Con jwt
    const token = await generateJWT(user, TIME_EXPIRE_JWT_SESSION);
    req.logger.info(`Token: ${token}`);

    if(user.email === "adminCoder@coder.com"){
      return res
      .cookie("cookieToken", token, {
        maxAge: 30 * 60 * 1000,
        httpOnly: true
      })
      .redirect("/justAdmin");
    }

    return res
      .cookie("cookieToken", token, {
        maxAge: 30 * 60 * 1000,
        httpOnly: true
      })
      .redirect("/products");
  } catch (error) {
    req.logger.error(`${error.message}`);
    next(error);
  }
};

// REGISTER
const registerCtrl = async (req, res, next) => {
  try {
    req.logger.info(`BODY REGISTER: ${JSON.stringify(req.body)}`);
    const { first_name, last_name, email, password, rol } = req.body;

    console.log("Datos del usuario:", { first_name, last_name, email, rol });

    // Determinar si es administrador
    const isAdmin = rol === 'ADMIN';

    // Si no es administrador, crear carrito
    let cartId = null;
    if (!isAdmin) {
      const cartResult = await cartService.addCart();
      if (cartResult.error) {
        req.logger.error("Error creating cart: " + cartResult.error);
        return res.status(500).json({
          status: 500,
          message: "Error creating cart",
        });
      }
      if (!cartResult.cart || !cartResult.cart._id) {
        req.logger.error("Cart creation failed, no cartId returned");
        return res.status(500).json({
          status: 500,
          message: "Cart creation failed",
        });
      }
      cartId = cartResult.cart._id;
    }

    const newUser = {
      first_name,
      last_name,
      email,
      password,
      rol,
      cart: cartId
    };

    const result = await userService.addUser(newUser);

    console.log("Resultado de addUser:", result); // Verifica el resultado de addUser

    if (result.error) {
      console.log("Error al agregar usuario:", result.error); // Añade un log si hay un error al agregar el usuario
      return res.status(500).json({
        status: 500,
        message: result.error,
      });
    }

    // session del usuario
    // guardo info no sensible
    req.session.user = { first_name, last_name, email };
    return res.redirect("/login");

  } catch (error) {
    console.log("Error en registerCtrl:", error.message); // Agrega un log para capturar cualquier error inesperado
    req.logger.error(`${error.message}`);
    next(error);
  }
};

// CHANGE PASSWORD
const changePswCtrl = async (req, res, next) => {
  try {
    const { token } = req.query;
    req.logger.info(`Token: ${token}`);
    if (!token) {
      req.logger.error('Token not provided');
      return res.status(400).send('Token not provided');
    }

    const { new_password } = req.body;


    // Validar token
    let email;
    try {
      const decoded = jwt.verify(token, SECRET_JWT);
      email = decoded.user.email;
      req.logger.info(`Email from token: ${email}`);
    } catch (error) {
      req.logger.error(`Token error: ${error.message}`);
      return res.redirect('/changePswMail'); // Redirige si token es invalido o expiro
    }

    //Cambio de contraseña
    const foundUser = await userService.changePassword(email, new_password);
    if (foundUser.error) {
      return res.status(foundUser.code).json({
        status: foundUser.code,
        message: foundUser.error,
      });
    };

    return res.send({ ok: true, message: 'Password changed successfully' });

  } catch (error) {
    req.logger.error(`${error.message}`);
    next(error);
  }
};

// SEND CHANGE PASSWORD MAIL
const sendChangePswMailCtrl = async (req, res, next) => {
  try {
    const emailReceiver = req.body.email;
    req.logger.info(`email receiver: ${emailReceiver}`)

    const foundUser = await userService.checkUser(emailReceiver);
    if (foundUser.error) {
      req.logger.error(`${foundUser.error}`);
      return httpResponse.BadRequest(res, `${foundUser.error}`);
    };

    //Genero el token para expirar en 1 hora
    const token = await generateJWT(foundUser, TIME_EXPIRE_JWT_CHANGE_PSW);

    const changePswLink = `http://localhost:8080/changePsw?token=${token}`;

    let resultEmail = await transporter.sendMail({
      from: GOOGLE_EMAIL,
      to: emailReceiver,
      subject: `PRUEBA01 Restablecer la contraseña de ${emailReceiver}`,
      html: `
      <div>
        <h1>Restablecer la contraseña</h1>
        Usted se registró en el ecommerce con el email: ${emailReceiver}.
        Si desea restablecer su contraseña por favor haga click en el siguiente botón:
        <a href="${changePswLink}">
          <button type="button">Restablecer contraseña</button>
        </a>
      </div>
      `
    });
    if (resultEmail.rejected.length != 0) {
      req.logger.error(`El email no se pudo enviar`);
      return httpResponse.BadRequest(res, `El email no se pudo enviar`);
    };

    return res.send({ ok: true, message: `El email fue enviado a ${emailReceiver}` });

  } catch (error) {
    req.logger.error(`${error.message}`);
    next(error);
  }
};

// CHANGE ROLE
const changeRoleCtrl = async (req, res, next) => {
  try {
    const email = req.params.email;
    req.logger.info(`Email usuario: ${email}`);
    const role = req.body.role;
    req.logger.info(`Rol usuario: ${role}`);
    if (role != "USER" && role != "PREMIUM") return httpResponse.BadRequest(res, "rol no permitido");

    //Cambio de rol
    const foundUser = await userService.changeRole(email, role);
    if (foundUser.error) {
      return res.status(foundUser.code).json({
        status: foundUser.code,
        message: foundUser.error,
      });
    };

    return res.send({ ok: true, message: foundUser.message });

  } catch (error) {
    req.logger.error(`${error.message}`);
    next(error);
  }
}


// CURRENT
const currentCtrl = async (req, res) => {
  req.logger.info(`VALIDANDO REQ
    User: ${JSON.stringify(req.user)}
    Cookies: ${JSON.stringify(req.cookies)}`);
  return res.json({ message: `jwt en las cookies` });
};

// GET ALL
const getAllUsersCtrl = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    return httpResponse.OK(res, "Se obtienen todos los usuarios", users);

  } catch (error) {
    req.logger.error(`${error.message}`);
    next(error);
  }
};

// DELETE USER BY ID
const deleteOneUserCtrl = async (req, res) => {
  try {
    const email = req.params.email;
    req.logger.info(`email user to delete: ${email}`)

    const foundUser = await userService.deleteUser(email);
    if (foundUser.error) {
      req.logger.error(`${foundUser.error}`);
      return httpResponse.BadRequest(res, `${foundUser.error}`);
    };

    return httpResponse.OK(res, foundUser.message);

  } catch (error) {
    req.logger.error(`${error.message}`);
    next(error);
  }
};

// DELETE USER BY ID
const deleteOldUsersCtrl = async (req, res) => {
  try {
    const result = await userService.deleteOldUsers();

    const deletedUsers = result.data;

    for (const emailReceiver of deletedUsers) {
      let resultEmail = await transporter.sendMail({
        from: GOOGLE_EMAIL,
        to: emailReceiver,
        subject: `Se ha eliminado su cuenta en el ecommerce`,
        html: `
        <div>
          <h1>Se ha eliminado su cuenta</h1>
          Usted se registró en el ecommerce con el email: ${emailReceiver}.
          Se ha eliminado su cuenta por inactividad.

          Esperamos que vuelva pronto!.
        </div>
        `
      });
      if (resultEmail.rejected.length != 0) {
        req.logger.error(`El email no se pudo enviar`);
        return httpResponse.BadRequest(res, `El email no se pudo enviar`);
      };
      
    };


    return httpResponse.OK(res, result.message, result.data);

  } catch (error) {
    req.logger.error(`${error.message}`);
    next(error);
  }
};



export {
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
};