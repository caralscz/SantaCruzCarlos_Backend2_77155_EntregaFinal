// -------------------------------------------------------------------------
// Middleware para las rutas protegidas
// src/middlewares/auth.js
// -------------------------------------------------------------------------

const { verifyToken } = require("../utils/passwJwt.js");

module.exports = function(req, res, next) {
  const token = req.cookies.authCookie;

  if (!token) {
    return res.status(401).json({ message: "No autenticado" });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ message: "Token inválido" });
  }

  req.user = decoded.user;
  next();
};
