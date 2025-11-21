// -----------------------------------------------------------
// src/dao/cartsManager.js
// Crear carrito, obtener carrito, agregar producto (incrementa 
// cantidad si existe), eliminar carrito, eliminar producto del carrito.
// -----------------------------------------------------------

const  CartModel  = require('./models/cartsModel');
const  ProductModel  = require('./models/productsModel');
const TicketManager = require('./ticketManager'); // nuevo
const mongoose = require('mongoose');

class CartsManager {
  static async getAll() {
    return await CartModel.find().lean();
  }

  static async createCart() {
    const cart = await CartModel.create({ products: [] });
    return cart.toObject();
  }

  // traigo un solo carrito con populate 
  static async getCartById(id) {
    // populate para traer datos del producto
    return await CartModel.findById(id).populate('products.product').lean();
    // return await CartModel.findById(id).lean();
  }

  static async addProductToCart(cid, pid, quantity = 1) {
    // Buscamos si existe el carrito
    let cart = await CartModel.findById(cid);
    if (!cart) throw new Error('addProductToCart: Carrito no encontrado');

    // verificamos si el producto existe
    const exists = await ProductModel.exists({ _id: pid });
    if (!exists) throw new Error('addProductToCart. Producto no encontrado');

    // Miro si ya está en el carrito
    const item = cart.products.find(p => String(p.product) === String(pid));
    if (item) {
      item.quantity += Number(quantity);  // si lo encuentra , suma 1
    } else {
      cart.products.push({ product: pid, quantity: Number(quantity) });
    }

    await cart.save();
    //  return cart.toObject();  // aquí devolvemos sin populate
    // aqui devolvemos con populate
      cart = await CartModel.findById(cid)
             .populate('products.product')  // Expandimos el producto con populate
             .lean();

    return cart;

  }

  static async deleteCart(cid) {
    const deleted = await CartModel.findByIdAndDelete(cid).lean();
    if (!deleted) throw new Error('Carrito no encontrado');
    return deleted;
  }

  static async removeProductFromCart(cid, pid) {
    const cart = await CartModel.findById(cid);
    if (!cart) throw new Error('Carrito no encontrado');

    const before = cart.products.length;
    cart.products = cart.products.filter(p => String(p.product) !== String(pid));

    if (cart.products.length === before) {
      throw new Error('Producto no estaba en el carrito');
    }

    await cart.save();
    return cart.toObject();
  }

  /**
   * FINALIZA UNA COMPRA:
   * - Recorre los productos del carrito (cart.products debe estar poblado o se poblá acá)
   * - Para cada producto: si stock >= cantidad -> restar stock, agregar al purchased
   *   sino -> dejar en carrito residual.
   * - Actualiza los productos modificados (stock).
   * - Actualiza el carrito para dejar solo los residuales.
   * - Crea un ticket con amount total y purchaser (email).
   * - Devuelve { ticket, purchasedItems, remainingItems, cart: cartActualizado }
   */
  static async purchaseCart(cid, purchaserEmail) {
    // Validaciones básicas
    const session = await mongoose.startSession();
    try {
      // Usamos transacción simple para consistencia (si Mongo lo soporta en tu cluster)
      session.startTransaction();

      // Traigo el carrito con productos poblados
      let cart = await CartModel.findById(cid).populate('products.product').session(session);
      if (!cart) {
        await session.abortTransaction();
        throw new Error('purchaseCart: Carrito no encontrado');
      }

      if (!Array.isArray(cart.products) || cart.products.length === 0) {
        await session.abortTransaction();
        throw new Error('purchaseCart: Carrito vacío');
      }

      const purchased = [];   // items que sí se compraron
      const remaining = [];   // items que quedan por falta de stock
      let totalAmount = 0;

      // Recorremos
      for (const item of cart.products) {
        const prod = item.product;
        const qty = Number(item.quantity);

        // Si product fue borrado o no existe en DB (por seguridad), lo ignoramos y lo dejamos en remaining
        if (!prod) {
          remaining.push(item);
          continue;
        }

        // Refrescamos producto desde DB bajo la misma sesión para evitar datos stale
        const productFromDb = await ProductModel.findById(prod._id).session(session);
        if (!productFromDb) {
          // producto ya no existe -> no puede comprarse
          remaining.push(item);
          continue;
        }

        if (productFromDb.stock >= qty) {
          // Se puede comprar: restar stock y confirmar compra
          productFromDb.stock = productFromDb.stock - qty;
          await productFromDb.save({ session });

          purchased.push({
            product: productFromDb._id,
            title: productFromDb.title,
            code: productFromDb.code,
            price: productFromDb.price,
            quantity: qty,
            subtotal: productFromDb.price * qty
          });

          totalAmount += productFromDb.price * qty;
        } else {
          // No hay suficiente stock -> queda en remaining (no se toca stock)
          remaining.push({
            product: productFromDb._id,
            quantity: qty,
            availableStock: productFromDb.stock
          });
        }
      }

      // Actualizamos el carrito: dejar sólo los remaining (objectIds)
      cart.products = remaining.map(r => ({
        product: r.product,
        quantity: r.quantity
      }));
      await cart.save({ session });

      // Si no hay items comprados, no generar ticket (podés cambiar esta política).
      if (purchased.length === 0) {
        await session.commitTransaction();
        session.endSession();
        return { status: 'no_purchase', message: 'No hay productos con stock suficiente', purchased: [], remaining, cart: cart.toObject() };
      }

      // Creo ticket a través de TicketManager
      const ticket = await TicketManager.createTicket({
        amount: totalAmount,
        purchaser: purchaserEmail
      });

      await session.commitTransaction();
      session.endSession();

      // Retornar ticket y detalle
      return {
        status: 'ok',
        ticket,
        purchased,
        remaining,
        cart: cart.toObject()
      };

    } catch (err) {
      try { await session.abortTransaction(); } catch (e) {}
      session.endSession();
      throw err;
    }
  }
}

module.exports = CartsManager;