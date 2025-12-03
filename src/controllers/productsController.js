// -----------------------------------------------------------
// src/controllers/productsController.js
// -----------------------------------------------------------

const productsService = require('../services/productsService.js');

class ProductsController {
  async list(req, res) {
    try {
      let { limit = 10, page = 1, sort = 'asc', query = 'price' } = req.query;
      const result = await productsService.list(limit, page, sort, query);
      // devolvemos la página (docs) y metadatos
      res.json({
        products: result.docs,
        totalPages: result.totalPages,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevPage: result.prevPage,
        nextPage: result.nextPage
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  async getById(req, res) {
    try {
      const dto = await productsService.getById(req.params.pid);
      res.json(dto);
    } catch (e) {
      res.status(404).json({ error: e.message });
    }
  }

  async create(req, res) {
    try {
      const dto = await productsService.create(req.body);
      // notificar via socket (si quieres) desde router o socketManager
      res.status(201).json(dto);
    } catch (e) {
      const status = /duplicate|unique/i.test(e.message) ? 409 : 400;
      res.status(status).json({ error: e.message });
    }
  }

  async update(req, res) {
    try {
      const dto = await productsService.update(req.params.pid, req.body);
      res.json(dto);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await productsService.delete(req.params.pid);
      res.json({ message: 'Producto eliminado', deleted });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
}

module.exports = new ProductsController();