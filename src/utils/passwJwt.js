//
// -----------------------------------------------------------
// src/utils/passwJwt.js
// trata hash de passwords y JWT
// -----------------------------------------------------------
//
const { dirname, join } = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
const envs = require("../config/envs.js");    // variables de entorno

const createHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));

const isValidadPassword = (password, hash) =>
  bcrypt.compareSync(password, hash);
   
const generateToken = (user) =>
  jwt.sign({ user }, envs.jwt_secret, { expiresIn: "1h" });

const verifyToken = (token) => {
  try {
    return jwt.verify(token, envs.jwt_secret);
  } catch (error) {
    return null;
  }
};

// Middleware para pasar datos del usuario a todas las vistas
const attachUserToViews = (req, res, next) => {
  const token = req.cookies.authCookie;
  
  if (token) {
    try {
      const decoded = jwt.verify(token, envs.jwt_secret);
      res.locals.user = decoded.user; // Disponible en todas las vistas como {{user}}
      res.locals.isAuthenticated = true;
    
    } catch (error) {

      res.locals.user = null;
      res.locals.isAuthenticated = false;
    }
  } else {
    res.locals.user = null;
    res.locals.isAuthenticated = false;
  }
  
  next();
};

module.exports = {
  createHash,
  isValidadPassword,
  generateToken,
  verifyToken,
  attachUserToViews,
  join,
  __dirname
};