// -----------------------------------------------------------
// src/routes/sessionRoutes.js
// -----------------------------------------------------------

const { Router } =require( "express");
const { createHash, isValidadPassword } =require( "../utils/passwJwt.js");
const userModel = require("../dao/models/userModel.js");
const passport = require("passport");
const userService = require("../services/usersService.js");
const { generateToken, verifyToken } = require("../utils/passwJwt.js");
const UserDTO = require("../dto/UserDTO.js");
const auth = require("../middlewares/auth.js");
const { adminOnly } = require("../middlewares/roles.js");

const router = Router();
// Notas: también debo definir las rutas en index.js (generico) y en viewsRouter.js (vistas)
// ----------------------------------------------------------- 
// rutas post  -  POST /api/session/register
// ----------------------------------------------------------- 
router.post("/register", async (req, res) => {
  try {
    const result = await userService.createUser(req.body);

    if (result.error) {
      return res.status(400).json({ status: "error", message: result.error });
    }

    return res.status(201).json({
      status: "success",
      message: "Usuario creado correctamente"
    });

  } catch (error) {
    return res.status(500).json({ message: "Error interno", error: error.message });
  }
});

// -----------------------------------------------------------
// rutas post  - POST /api/session/login
// -----------------------------------------------------------

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await userService.loginUser(email, password);
    if (result.error) {
      return res.status(401).json({ status: "error", message: result.error });
    }

    const user = result.user;

    // Crear token
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name
    });

    // Enviar cookie segura
    res.cookie("authCookie", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000
    });

    // No hago un render con el resultado, solo respondo con mensaje JSON
    return res.json({
      status: "success",
      message: "Login exitoso"  // ,redirectTo: "/api/session/current"
    });

  } catch (error) {
    return res.status(500).json({ message: "Error interno", error: error.message });
  }
});

// -----------------------------------------------------------
// GET /api/session/current
// Devuelve solo DTO del usuario actual
// ----------------------------------------------------------- 
router.get("/current", auth, adminOnly, async (req, res) => {
  const token = req.cookies.authCookie;

  if (!token) {
    return res.status(401).json({ status: "error", message: "No autenticado" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ status: "error", message: "Token inválido" });
  }

  const user = await userService.getCurrentUser(decoded.user.id);

  // Generar DTO
  const dto = new UserDTO(user);

  return res.json({
    status: "success",
    user: dto
  });
});


// -----------------------------------------------------------
// recupero de pass  (update de la password)
// -----------------------------------------------------------
router.post("/recupero", async (req, res) => {
  const { email, password } = req.body;
  try {
    // validamos si recibimos todos los campos
    const userFound = await userModel.findOne({ email });

    if (!userFound) {
      return res.status(401).json({ message: "El usuario NO existe."});
    }

    const password_hash = createHash(password);
    userFound.password = password_hash;
    await userFound.save();
    res.redirect("/login");
  } catch (error) {
    // agregar respuesta
  }
});

// -----------------------------------------------------------
// logout
// -----------------------------------------------------------
router.post("/logout", (req, res) => {
  try {
    // Limpiar la cookie de autenticación
    res.clearCookie("authCookie", { httpOnly: true, path: '/' });
    return res.redirect('/login'); // redirige directamente al login    
    
  } catch (error) {
    console.error("Error en logout:", error);
    return res.status(500).json({ 
      status: "error",
      message: "Error al cerrar sesión",
      error: error.message 
    });
  }
});


module.exports = router;
