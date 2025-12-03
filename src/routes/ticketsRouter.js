// -----------------------------------------------------------
// src/routes/ticketsRouter.js
// -----------------------------------------------------------

const express = require('express');
const router = express.Router();
const ticketsController = require('../controllers/ticketsController.js');
const auth = require('../middlewares/auth.js');

router.get('/:tid', auth, ticketsController.getById.bind(ticketsController));

module.exports = router;