
// -----------------------------------------------------------
// src/config/passportConfig.js
// -----------------------------------------------------------

const passport = require("passport");
const local = require("passport-local");
const userModel = require("../dao/models/userModel.js");
const cartsDao  = require("../dao/cartsDao.js");
const { createHash } = require("../utils/passwJwt.js");
const jwt = require("passport-jwt");
const envs = require( "../config/envs.js");    // variables de entorno

// Estrategias
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;
const LocalStrategy = local.Strategy;

// -----------------------------------------------------------
// Función auxiliar: extrae token de la cookie "authCookie"
// -----------------------------------------------------------
const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["authCookie"];
  }
  return token;
};

// -----------------------------------------------------------
// Inicialización de Passport
// -----------------------------------------------------------
const initializePassport = () => {
  passport.use(
    "register",
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: "email",
      },
      async (req, username, password, done) => {
        const { first_name, last_name, email, age, role } = req.body;
        try {
          // Verificar si el usuario ya existe
          const userFound = await userModel.findOne({ email: username });
          if (userFound) {
            console.log("Usuario existente en la db");
            return done(null, false);   // null : no hay error, false: no hay mensaje para mostrar 
          }

          // CREAR CARRITO VACÍO
          const newCart = await cartsDao.createEmptyCart();
          // console.log('🛒 Carrito vacío creado:', newCart._id);

          // CREAR USUARIO CON CARRITO ASIGNADO          
          const newUser = {
            first_name,
            last_name,
            email,
            age: age || 18,
            role: role || 'user',
            password: createHash(password),
            cart: newCart._id    // ASIGNAMOS CARRITO
          };
          const user = await userModel.create(newUser);
          // console.log('Usuario creado con Passport:', user.email, 'Carrito:', user.cart);

          return done(null, user);       // null : no hay error, user: en el mensaje para mostrar 
        } catch (error) {
          console.error('❌ Error al crear usuario con Passport:', error);
          return done(`Error al crear el usuario ${error.message}`, false);    // hay error, false: no hay mensaje para mostrar 
        }
      }
    )
  );

// -----------------------------------------------------------
// Estrategia JWT: Autenticación por token =====
// -----------------------------------------------------------

  passport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: envs.jwt_secret,   
      },
      async (jwt_payload, done) => {
        try {
          return done(null, jwt_payload);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

// -----------------------------------------------------------
// Serialización / Deserialización  de usuario
// -----------------------------------------------------------
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await userModel.findById(id);
    done(null, user);
  });
};

module.exports = initializePassport;