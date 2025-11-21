// -----------------------------------------------------------
// src/dao/models/productsModel.js
// code único, stock por defecto 0, status por defecto true, timestamps activados.
// -----------------------------------------------------------
const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2') 

const productSchema = new mongoose.Schema(
  {
    // NOTA: Mongoose usa automatico _id; yo había usado "id" y lo saqué
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    status: { type: Boolean, default: true },
    stock: { type: Number, default: 0 },
    category: { type: String, required: true },
    thumbnails: { type: [String], default: [] }
  },
  { timestamps: true, 
    versionKey: false,
    strict:true }      // no permitir nombres no definidos
);

// para la paginación
productSchema.plugin(paginate)   

// 'products' es el nombre de la collection
const ProductModel = mongoose.model('products', productSchema);
module.exports =  ProductModel;