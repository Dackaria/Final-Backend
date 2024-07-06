function authUserMdw(req, res, next) {
    if (req.user.user.cart != req.params.cid) {
        return res.status(403).json({
            status: 403,
            message: "Acceso denegado. Rol no autorizado.",
        });
    };
    next();
  }
export default authUserMdw;