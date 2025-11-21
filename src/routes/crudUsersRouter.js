// --------------------------------------------------------------------
// Hacemos control de usuarios para acceder al CRUD
// src/routes/crudUsersRouter.js    // Rutas MVC del CRUD
// --------------------------------------------------------------------
const { Router } = require("express");
const usersController = require("../controllers/usersController.js");
const auth = require("../middlewares/auth.js");
const { adminOnly } = require("../middlewares/roles.js");

const router = Router();
// Solo ADMIN puede usar el CRUD visual

// GET /crud/users - Lista todos los usuarios y muestra formulario de "alta" de nuevo usuario y 
//                   botones de "baja" y "modificacion" en cada usuario listado
router.get("/", auth, adminOnly, usersController.renderCrudPage);

// POST /crud/users - Crea un nuevo usuario
router.post("/", auth, adminOnly, usersController.create);

// PUT /crud/users/:id - Actualiza un usuario existente
router.put("/:id", auth, adminOnly, usersController.update);

// DELETE /crud/users/:id - Elimina un usuario
router.delete("/:id", auth, adminOnly, usersController.delete);

module.exports = router;
