// --------------------------------------------------------------------
// src/services/ticketService.js
// --------------------------------------------------------------------

const ticketDAO = require("../dao/ticketDAO");

class TicketService {
  async createTicket({ amount, purchaser }) {
    const code = `TCK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    return await ticketDAO.create({
      code,
      amount,
      purchaser
    });
  }

  async getTicket(id) {
    return await ticketDAO.getById(id);
  }
}

module.exports = new TicketService();