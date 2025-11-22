// --------------------------------------------------------------------
// Lógica de negocio independiente del router
// Servicio para CRUD Users
// src/services/usersService.js
// --------------------------------------------------------------------

const userDao = require("../dao/userDao.js");
const cartsDao = require("../dao/cartsDao.js"); 
const { createHash , isValidadPassword } = require("../utils/passwJwt.js");

class usersService {

  async getAllUsers() {
    return await userDao.getAll(); // Lo agregamos al DAO
  }

  async createUser(data) {   
    
    try {
        // Verificar si el usuario ya existe
        const exists = await userDao.getByEmail(data.email);
        if (exists) return { error: "El correo ya existe" };

        // CREAR CARRITO VACÍO PRIMERO
          const newCart = await cartsDao.createEmptyCart();
          // console.log('Carrito vacío creado:', newCart._id);

        // HASHEAR PASSWORD
          data.password = createHash(data.password);

        // ASIGNAR EL ID DEL CARRITO AL USUARIO
          data.cart = newCart._id;

        // CREAR USUARIO CON EL CARRITO ASIGNADO
        const newUser = await userDao.createUser(data);
        // console.log('Usuario creado:', newUser.email, 'con carrito:', newUser.cart);
        return { user: newUser };     // **scz** es como hacer return await userDao.createUser(data);
    } catch (error) {
      console.error('❌ Error en createUser:', error);
      return { error: "Error al crear el usuario: " + error.message };
    }
  }

  async updateUser(id, data) {
    return await userDao.update(id, data);
  }

  async deleteUser(id) {
    try {
      // Eliminar también el carrito asociado
      const user = await userDao.getById(id);
      if (user && user.cart) {
        await cartsDao.deleteCart(user.cart);
        // console.log('Carrito eliminado:', user.cart);
      }
      const deletedUser = await userDao.delete(id);
      // console.log(' Usuario eliminado:', deletedUser.email);
      return deletedUser;

    } catch (error) {
      console.error('❌ Error al eliminar usuario:', error);
      throw error;
    }
    }

   async loginUser(email, password) {
    const user = await userDao.getByEmail(email);
    if (!user) return { error: "Credenciales inválidas" };  /* Usuario no encontrado */

    const valid = isValidadPassword(password, user.password);
    if (!valid) return { error: "Credenciales inválidas" };

    return { user };
  }

  async getCurrentUser(id) {
    return await userDao.getById(id);
  }

}

module.exports = new usersService();
