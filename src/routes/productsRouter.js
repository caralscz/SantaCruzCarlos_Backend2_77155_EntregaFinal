// -----------------------------------------------------------
// src/routes/productsRouter.js
// REST completo para productos.  
// Además emite eventos de Socket.io al crear/eliminar (para 
// actualizar la vista realtime).
// -----------------------------------------------------------

const express = require('express');
const ProductsManager = require('../dao/productsManager');

module.exports = function(io) {
  const router = express.Router();

  // GET /api/products 
  // pagina, tiene limit, sort y query
  // si no se colocan parametros trae desde pag=1
  router.get('/', async (req, res) => {
    try {
    // Leo y establezco valores por defecto 
    let { 
      limit = 10,       // 10 productos x pag, es lo que pide la consigna
      page = 1,         // iniciar en pagina 1
      sort = "asc",     // puede ser "asc" o "des"    ver en homePaginando.handlebars
      query = "price"   // puede ser "price", "code" o "categ" ver en homePaginando.handlebars  
    } = req.query;
      
      let {docs: products, totalPages, hasPrevPage, hasNextPage, prevPage, nextPage } = 
          await ProductsManager.getPag(limit, page, sort, query);

      res.json(products, 
        totalPages, hasPrevPage, hasNextPage, prevPage, nextPage ,
        limit, page,  sort, query); 
    } catch (e) {
      console.log('productRouter: Error interno get Paginando')
      res.status(500).json({error: e.message} );
    }
  });

  // GET /api/products/:pid
  router.get('/:pid', async (req, res) => {
    try {
      const product = await ProductsManager.getById(req.params.pid);
      if (!product) return res.status(404).json({ error: 'productRouter.get: Producto no encontrado' });
      res.json(product);
    } catch (e) {
      res.status(400).json({ error: 'ID inválido' });
    }
  });

  // POST /api/products
  router.post('/', async (req, res) => {
    try {
      const newProduct = await ProductsManager.create(req.body);
      io.emit('product:created', newProduct); // Notificar a clientes realtime
      res.status(201).json(newProduct);
    } catch (e) {
      const status = /duplicat(e|o)|unique/i.test(e.message) ? 409 : 400;
      res.status(status).json({ error: e.message });
    }
  });

  // PUT /api/products/:pid
  router.put('/:pid', async (req, res) => {
    try {
      const updated = await ProductsManager.updateById(req.params.pid, req.body);
      res.json(updated);
    } catch (e) {
      const status = e.message.includes('productRouter: no encontrado') ? 404 : 400;
      res.status(status).json({ error: e.message });
    }
  });

  // DELETE /api/products/:pid
  router.delete('/:pid', async (req, res) => {
    try {
      const deleted = await ProductsManager.deleteById(req.params.pid);
      io.emit('product:deleted', String(deleted._id)); // Notificar a clientes realtime
      res.json({ message: 'productRouter. Producto eliminado', deleted });
    } catch (e) {
      const status = e.message.includes('no encontrado') ? 404 : 400;
      res.status(status).json({ error: e.message });
    }
  });

  return router;
};

