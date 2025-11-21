// -----------------------------------------------------------
// src/dao/ticketManager.js
// -----------------------------------------------------------

const TicketModel = require('./models/ticketModel');

class TicketManager {

  // Crea un código único (intenta hasta que no exista)
  static async _generateUniqueCode(length = 8) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const makeCode = () => {
      let s = '';
      for (let i = 0; i < length; i++) {
        s += alphabet[Math.floor(Math.random() * alphabet.length)];
      }
      return s;
    };

    let tries = 0;
    while (tries < 10) { // límite de intentos
      const code = makeCode();
      const exists = await TicketModel.exists({ code });
      if (!exists) return code;
      tries++;
    }

    // Si por alguna razón colisionan muchas veces, usar timestamp
    return `${Date.now()}`;
  }

  static async createTicket({ amount, purchaser }) {
    const code = await this._generateUniqueCode(8);
    const ticket = await TicketModel.create({
      code,
      purchase_datetime: new Date(),
      amount,
      purchaser
    });
    return ticket.toObject();
  }

  static async getById(id) {
    return await TicketModel.findById(id).lean();
  }

  static async getAll() {
    return await TicketModel.find().lean();
  }
}

module.exports = TicketManager;