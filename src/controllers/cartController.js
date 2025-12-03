// --------------------------------------------------------------------
// src/controllers/cartController.js
// --------------------------------------------------------------------

const CartsManager = require('../dao/cartsManager.js');
const cartService = require("../services/cartService");
const ticketService = require("../services/ticketService");


class cartController {

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


  async purchase(req, res) {
    try {
      const cid = req.params.cid;

      const purchaserEmail = req.user?.email;
      if (!purchaserEmail) return res.status(401).json({ error: 'No autenticado' });

      const result = await CartsManager.purchaseCart(cid, purchaserEmail);

      if (result.status === 'no_purchase') {
        return res.status(200).json({ status: 'no_purchase', message: result.message, purchased: result.purchased, remaining: result.remaining, cart: result.cart });
      }

      return res.status(201).json({ status: 'ok', ticket: result.ticket, purchased: result.purchased, remaining: result.remaining, cart: result.cart });

    } catch (e) {
      console.error('cc.js purchase errores:', e);
      const code = /no encontrado|No autenticado|Carrito/.test(e.message) ? 404 : 400;
      res.status(code).json({ error: e.message });
    }
  }
}

module.exports = new cartController();