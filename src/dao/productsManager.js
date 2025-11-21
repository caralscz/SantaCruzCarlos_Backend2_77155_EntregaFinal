// -----------------------------------------------------------
// src/dao/productsManager.js
// Clase estática con métodos CRUD. Devuelve datos “lean” cuando conviene.
// Con .lean(), Mongoose devuelve un objeto plano de JavaScript, sin la sobrecarga de los métodos de Mongoose
// -----------------------------------------------------------

// const { ProductModel } = require('./models/productsModel'); 
const  ProductModel  = require('./models/productsModel'); 

class ProductsManager {
  static async getAll() {
    return await ProductModel.find().lean();
  }

  /* defino leer con paginado, ordenado Y establezco valores de default */
  static async getPag(limit=10, page=1, sort="asc", query="price") {
    
    // Convertimos los valores leidos a lo que entiende Mogoose para leer */
    // Convierte el string 'asc' en 1 ; o 'desc' en -1
    const sortOrden = sort === "asc" ? 1 : -1;

    // el campo query="price", "code" o "category"
    const sortQuery = query ;

    // Crea un objeto para el ordenamiento, usando el nombre del campo como clave
    const sortOptions = { [sortQuery]: sortOrden }; // podrían ser varios campos 

    return await ProductModel.paginate({},{
      limit, 
      page, 
      sort: sortOptions, // ordenar por el campo solicitado
      lean:true });

  }

  static async getById(id) {
    return await ProductModel.findById(id).lean();
  }

  static async create(data) {
    // Validar campos obligatorios
    // --------------------------- +
    const required = ['title', 'description', 'code', 'price', 'category'];
    for (const f of required) {
      if (data[f] == null || data[f] === '') {
        throw new Error(`Campo obligatorio faltante: ${f}`);
      }
    }

    // Verificar que el code sea único
    // ------------------------------- +
    const exists = await ProductModel.findOne({ code: data.code }).lean();
    if (exists) {
      throw new Error(`*Error en Crear producto* El código "${data.code}" ya está en uso`);
    }

    // Normalizar thumbnails
    // --------------------------- +
    if (data.thumbnails && !Array.isArray(data.thumbnails)) {
      data.thumbnails = [data.thumbnails];
    }

    const doc = await ProductModel.create({
      title: data.title,
      description: data.description,
      code: data.code,
      price: Number(data.price),
      status: data.status ?? true,
      stock: Number(data.stock ?? 0),
      category: data.category,
      thumbnails: data.thumbnails || []
    });
    return doc.toObject();
  }

  static async updateById(id, update) {
    if ('_id' in update) delete update._id;
    if ('id' in update) delete update.id;
    if (update.thumbnails && !Array.isArray(update.thumbnails)) {
      update.thumbnails = [update.thumbnails];
    }

    const doc = await ProductModel.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();
    if (!doc) throw new Error('Producto no encontrado');
    return doc;
  }

  static async deleteById(id) {
    const deleted = await ProductModel.findByIdAndDelete(id).lean();
    if (!deleted) throw new Error('Producto no encontrado');
    return deleted;
  }
}

module.exports = ProductsManager;