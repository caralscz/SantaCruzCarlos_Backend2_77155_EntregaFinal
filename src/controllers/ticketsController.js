// -----------------------------------------------------------
// src/controllers/ticketsController.js
// -----------------------------------------------------------

const ticketService = require('../services/ticketService.js');

class TicketsController {
  async getById(req, res) {
    try {
      const ticket = await ticketService.getTicketById(req.params.tid);
      if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });
      res.json(ticket);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
}

module.exports = new TicketsController();
