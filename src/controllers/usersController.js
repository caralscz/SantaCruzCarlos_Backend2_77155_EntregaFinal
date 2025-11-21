// --------------------------------------------------------------------
// Controlador del CRUD Users
// src/controllers/usersController.js
// --------------------------------------------------------------------

const usersService = require("../services/usersService.js");

class UsersController {

  // Vista principal del CRUD
  async renderCrudPage(req, res) {
    try {
      const users = await usersService.getAllUsers();
      res.render("crudUsers", { title: "CRUD Usuarios", users });
    } catch (err) {
      res.status(500).send(`Error al obtener usuarios: ${err.message}`);
    }
  }

  // Crear usuario
  async create(req, res) {
    try {
      const result = await usersService.createUser(req.body);

      if (result.error) {
        return res.status(400).json({ status: "error", message: result.error });
      }

      res.redirect("/crud/users");
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  // Actualizar
  async update(req, res) {
    try {
      const updated = await usersService.updateUser(req.params.id, req.body);
      res.json({ status: "success", updated });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  // Eliminar
  async delete(req, res) {
    try {
      await usersService.deleteUser(req.params.id);
      res.json({ status: "success", message: "Usuario eliminado" });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }
}

module.exports = new UsersController();
