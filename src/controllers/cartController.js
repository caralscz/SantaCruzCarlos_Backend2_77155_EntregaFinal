// --------------------------------------------------------------------
// src/controllers/cartController.js
// --------------------------------------------------------------------

const cartService = require("../services/cartService");
const ticketService = require("../services/ticketService");

class CartController {

  // POST /api/carts/:cid/purchase
  async purchase(req, res) {
    try {
      const cid = req.params.cid;

      // Tomar purchaser desde JWT cookie (Passport lo deposita en req.user)
      const purchaserEmail = req.user.email;

      const result = await cartService.purchase(cid, purchaserEmail);

      res.status(200).json({
        status: "success",
        ticket: result.ticket,
        productsNotProcessed: result.productsNotProcessed
      });

    } catch (error) {
      res.status(500).json({ status: "error", error: error.message });
    }
  }


  // GET /api/tickets/:tid
  async getTicketById(req, res) {
    try {
      const tid = req.params.tid;
      const ticket = await ticketService.getTicket(tid);

      if (!ticket) {
        return res.status(404).json({ status: "error", message: "Ticket no encontrado" });
      }

      res.json(ticket);

    } catch (err) {
      res.status(500).json({ status: "error", error: err.message });
    }
  }
}

module.exports = new CartController();