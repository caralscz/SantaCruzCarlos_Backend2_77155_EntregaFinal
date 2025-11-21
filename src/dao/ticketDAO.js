// ------------------------------------------------------------
// src/dao/ticketDao.js
// ------------------------------------------------------------

const TicketModel = require("./models/ticketModel");

class TicketDAO {
  async create(data) {
    return await TicketModel.create(data);
  }

  async getById(id) {
    return await TicketModel.findById(id).lean();
  }
}

module.exports = new TicketDAO();
