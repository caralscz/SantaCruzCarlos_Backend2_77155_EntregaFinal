// -----------------------------------------------------------
// src/utils/socketManager.js
// -----------------------------------------------------------

const jwt = require('jsonwebtoken');
const envs = require('../config/envs.js');
const ProductsManager = require('../dao/productsManager.js');

module.exports = function(io) {

  // middleware de autenticacion para sockets: toma cookie authCookie
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
               || socket.handshake.headers?.cookie?.split('authCookie=')[1]?.split(';')[0];
    if (!token) return next(new Error('No autenticado'));

    try {
      const decoded = jwt.verify(token, envs.jwt_secret);
      socket.user = decoded.user;
      return next();
    } catch (err) {
      return next(new Error('Token inválido'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`WS: conectado ${socket.user?.email || 'anonimo'}`);

    // init: emit current products
    try {
      const products = await ProductsManager.getAll();
      products.sort((a,b) => b.code.localeCompare(a.code));
      socket.emit('products:init', products);
    } catch (e) {
      socket.emit('error:message', 'No se pudieron cargar productos');
    }

    // crear producto (solo admin)
    socket.on('product:create', async (payload) => {
      try {
        if (!socket.user || socket.user.role !== 'admin') {
          return socket.emit('error:message', 'Solo admin puede crear');
        }
        const created = await ProductsManager.create(payload);
        io.emit('product:created', created);
      } catch (e) {
        socket.emit('error:message', e.message);
      }
    });

    // eliminar producto
    socket.on('product:delete', async (id) => {
      try {
        if (!socket.user || socket.user.role !== 'admin') {
          return socket.emit('error:message', 'Solo admin puede borrar');
        }
        const deleted = await ProductsManager.deleteById(id);
        io.emit('product:deleted', String(deleted._id));
      } catch (e) {
        socket.emit('error:message', e.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`WS: desconectado ${socket.user?.email || 'anonimo'}`);
    });
  });
};