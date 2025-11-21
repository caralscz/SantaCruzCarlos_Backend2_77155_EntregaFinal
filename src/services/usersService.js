// --------------------------------------------------------------------
// Lógica de negocio independiente del router
// Servicio para CRUD Users
// src/services/usersService.js
// --------------------------------------------------------------------

const userDao = require("../dao/userDao.js");
const { createHash , isValidadPassword } = require("../utils/passwJwt.js");

class usersService {

  async getAllUsers() {
    return await userDao.getAll(); // Lo agregamos al DAO
  }

  async createUser(data) {   
    const exists = await userDao.getByEmail(data.email);
    if (exists) return { error: "El correo ya existe" };

    data.password = createHash(data.password);
    const newUser = await userDao.createUser(data);
    return { user: newUser };     // **scz** es como hacer return await userDao.createUser(data);
  }

  async updateUser(id, data) {
    return await userDao.update(id, data);
  }

  async deleteUser(id) {
    return await userDao.delete(id);
  }

   async loginUser(email, password) {
    const user = await userDao.getByEmail(email);
    if (!user) return { error: "Usuario no encontrado" };

    const valid = isValidadPassword(password, user.password);
    if (!valid) return { error: "Credenciales inválidas" };

    return { user };
  }

  async getCurrentUser(id) {
    return await userDao.getById(id);
  }

}

module.exports = new usersService();
