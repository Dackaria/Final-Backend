import passport from "passport";

function authMdw(role) {
  return (req, res, next) => {
    // Verificar si el único rol es "PUBLIC"
    if (role.length === 1 && role[0] === "PUBLIC") {
      return next();
    }

    // Usar Passport para autenticar al usuario y verificar el rol
    passport.authenticate("jwt", { session: false }, (err, userJWT, info) => {
      console.log("🚀 ~ passport.authenticate ~ userJWT:", userJWT);
      
      if (err) {
        return next(err);
      }

      if (!userJWT) {
        return res
          .status(401)
          .send({ message: "Acceso denegado. Token inválido o expirado." });
      }

      if (role.includes(userJWT.user.role)) {
        req.user = userJWT;
        return next();

      } else {
        return res
          .status(403)
          .send({ message: "Acceso denegado. Rol no autorizado." });
      }
      
    })(req, res, next);
  };
}
export default authMdw;