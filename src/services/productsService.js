// -----------------------------------------------------------
// src/services/productsService.js
// -----------------------------------------------------------

const ProductsManager = require('../dao/productsManager.js'); // tu manager existente
const ProductDTO = require('../dto/productDTO.js');

class ProductsService {
  async list(limit, page, sort, query) {
    return await ProductsManager.getPag(limit, page, sort, query);
  }

  async getById(id) {
    const p = await ProductsManager.getById(id);
    if (!p) throw new Error('Producto no encontrado');
    return new ProductDTO(p);
  }

  async create(data) {
    const created = await ProductsManager.create(data);
    return new ProductDTO(created);
  }

  async update(id, data) {
    const updated = await ProductsManager.updateById(id, data);
    return new ProductDTO(updated);
  }

  async delete(id) {
    return await ProductsManager.deleteById(id);
  }
}

module.exports = new ProductsService();