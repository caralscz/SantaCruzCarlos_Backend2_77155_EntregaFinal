// -----------------------------------------------------------
// src/dto/productDTO.js
// -----------------------------------------------------------

class ProductDTO {
  constructor(product) {
    this.id = product._id;
    this.title = product.title;
    this.description = product.description;
    this.code = product.code;
    this.price = product.price;
    this.stock = product.stock;
    this.category = product.category;
    this.thumbnails = product.thumbnails || [];
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;
  }
}
module.exports = ProductDTO;
