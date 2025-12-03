// -----------------------------------------------------------
// src/routes/cartsRouter.js 
// -----------------------------------------------------------

const express = require('express');
const CartsManager = require('../dao/cartsManager');
const router = express.Router();
const cartController = require("../controllers/cartController");
const auth = require("../middlewares/auth.js");

// Compra carrito → genera ticket
// POST /api/carts/:cid/purchase
// router.post("/:cid/purchase", auth, cartController.purchase);
router.post('/:cid/purchase', auth, cartController.purchase.bind(cartController));


// Ver ticket
router.get("/tickets/:tid", auth, cartController.getTicketById);

// POST /api/carts (crear un carrito vacío)
router.post('/', async (req, res) => {
  try {
    const cart = await CartsManager.createCart();
    res.status(201).json(cart);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/carts/ (listar todos los productos de un carrito)
router.get('/', async (req, res) => {
  try {
    const carts = await CartsManager.getAll();
    res.json(carts);
  } catch (e) {
    res.status(400).json({ error: 'Error en Get all' });
  }
});


// GET /api/carts/:cid (listar los productos de un carrito)
router.get('/:cid', async (req, res) => {
  try {
    const cart = await CartsManager.getCartById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(cart.products);
  } catch (e) {
    res.status(400).json({ error: 'ID inválido' });
  }
});

// POST /api/carts/:cid/product/:pid (agregar/incrementar)
// Para esta funcion, en Postman se puede especificar: 
// http://localhost:8080/api/carts/:cid/product/:pid y luego tildar "Body" y "x-www-form-urlencoded"
//                    de esta manera se podrá especificar en "key" quantity y 
//                    en "value" la cantidad que queremos superior a 1
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const qty = Number(req.body.quantity ?? 1);
    const cart = await CartsManager.addProductToCart(req.params.cid, req.params.pid, qty);
    res.status(201).json(cart);
  } catch (e) {
    const code = /no encontrado/i.test(e.message) ? 404 : 400;
    res.status(code).json({ error: e.message });
  }
});

// DELETE /api/carts/:cid (eliminar carrito)
router.delete('/:cid', async (req, res) => {
  try {
    const deleted = await CartsManager.deleteCart(req.params.cid);
    res.json({ message: 'Carrito eliminado', deleted });
  } catch (e) {
    const code = /no encontrado/i.test(e.message) ? 404 : 400;
    res.status(code).json({ error: e.message });
  }
});

// DELETE /api/carts/:cid/product/:pid (quitar producto del carrito)
router.delete('/:cid/product/:pid', async (req, res) => {
  try {
    const cart = await CartsManager.removeProductFromCart(req.params.cid, req.params.pid);
    res.json(cart);
  } catch (e) {
    const code = /no encontrado|no estaba/i.test(e.message) ? 404 : 400;
    res.status(code).json({ error: e.message });
  }
});

module.exports = router;
