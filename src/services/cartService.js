// --------------------------------------------------------------------
// src/services/cartService.js
// --------------------------------------------------------------------

const CartModel = require("../dao/models/cartsModel");
const ProductModel = require("../dao/models/productsModel");
const ticketService = require("./ticketService");

class CartService {

  async purchase(cid, purchaserEmail) {

    let cart = await CartModel.findById(cid).populate("products.product");

    if (!cart) throw new Error("Carrito no encontrado");

    let total = 0;
    let noStockItems = [];

    for (const item of cart.products) {

      if (item.product.stock >= item.quantity) {

        total += item.product.price * item.quantity;

        item.product.stock -= item.quantity;
        await item.product.save();

      } else {
        noStockItems.push(item);
      }
    }

    // Dejar solo los que NO tenían stock
    cart.products = noStockItems;
    await cart.save();

    // Crear ticket
    const ticket = await ticketService.createTicket({
      amount: total,
      purchaser: purchaserEmail
    });

    return {
      ticket,
      productsNotProcessed: noStockItems
    };
  }
}

module.exports = new CartService();
