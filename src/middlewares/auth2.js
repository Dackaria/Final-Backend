module.exports = (req, res, next) => {
  if (req.cookies.coderCookie) {
    console.log("Ya estas logueado");
    return res.redirect("/");
  }
  next();
};
