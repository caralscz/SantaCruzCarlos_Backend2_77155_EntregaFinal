// ------------------------------------------------------------
// src/dao/userDao.js
// Acceso a la BD para usuarios (DAO) - 
// ------------------------------------------------------------

const userModel = require("./models/userModel.js");

class UserDAO {

  async getAll() {
    return await userModel.find().lean();
  }

  async getByEmail(email) {
    return await userModel.findOne({ email });
  }

  async getById(id) {
    return await userModel.findById(id);
  }

  async createUser(data) {
    return await userModel.create(data);
  }

  async update(id, data) {
    return await userModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await userModel.findByIdAndDelete(id);
  }

}

module.exports = new UserDAO();
