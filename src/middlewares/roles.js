// -------------------------------------------------- +
//  Middleware de roles
//  src/middlewares/roles.js
// -------------------------------------------------- +

module.exports.adminOnly = function (req, res, next) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "No autenticado..." });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ status: "error", message: "Solo administradores" });
  }
  next();
};

module.exports.userOnly = function (req, res, next) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "No autenticado-" });
  }
  if (req.user.role !== "user") {
    return res.status(403).json({ status: "error", message: "Solo usuarios estándar" });
  }
  next();
};

module.exports.adminOrUser = function (req, res, next) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "No autenticado" });
  }
  if (req.user.role !== "user" && req.user.role !== "admin") {
    return res.status(403).json({ status: "error", message: "Acceso restringido" });
  }
  next();
};
