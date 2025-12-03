// -----------------------------------------------------------
// src/services/ticketService.js
// -----------------------------------------------------------

const TicketManager = require('../dao/ticketManager.js');

class TicketService {
  async createTicket(payload) {
    return await TicketManager.createTicket(payload);
  }
  async getTicketById(id) {
    return await TicketManager.getById(id);
  }
}

module.exports = new TicketService();

src/controllers/ticketsController.js
const ticketService = require('../services/ticketService.js');
