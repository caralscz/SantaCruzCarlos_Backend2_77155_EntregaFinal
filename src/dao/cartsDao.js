// -----------------------------------------------
// src/dao/cartsDao.js
// -----------------------------------------------

const cartModel = require("./models/cartsModel.js");

class CartsDAO {
  // Crear carrito vacío
  async createEmptyCart() {
    return await cartModel.create({ products: [] });
  }

  async getById(id) {
    return await cartModel.findById(id).populate('products.product');
  }

  async addProductToCart(cartId, productId, quantity = 1) {
    const cart = await cartModel.findById(cartId);
    if (!cart) throw new Error('Carrito no encontrado');

    const existingProduct = cart.products.find(
      p => p.product.toString() === productId
    );

    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    return await cart.save();
  }

  async deleteCart(id) {
    return await cartModel.findByIdAndDelete(id);
  }
}

module.exports = new CartsDAO();