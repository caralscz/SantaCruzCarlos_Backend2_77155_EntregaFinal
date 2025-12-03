// -----------------------------------------------------------
// src/routes/productsRouter.js
// socketManager se encarga de emitir eventos WS cuando haga falta (creación/eliminación). 
// En socketManager ya se emiten. 
// -----------------------------------------------------------

const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController.js');
const auth = require('../middlewares/auth.js');
const { adminOnly } = require('../middlewares/roles.js');

// GET paginado
router.get('/', productsController.list.bind(productsController));

// GET :pid
router.get('/:pid', productsController.getById.bind(productsController));

// POST (admin)
router.post('/', auth, adminOnly, productsController.create.bind(productsController));

// PUT
router.put('/:pid', auth, adminOnly, productsController.update.bind(productsController));

// DELETE
router.delete('/:pid', auth, adminOnly, productsController.delete.bind(productsController));

module.exports = router;

