// -----------------------------------------------------------
// src/routes/viewsRouter.js
// -----------------------------------------------------------

const express = require('express');
const ProductsManager = require('../dao/productsManager');
const CartsManager = require('../dao/cartsManager');
const router = express.Router();
const { verifyToken } = require('../utils/passwJwt.js');

// -----------------------------------------------------------
// login / register /recupero / Logout
// -----------------------------------------------------------

router.get('/login', async (req, res) => {
  try {
    res.render('login', { title: 'Login / Identificación' });
  } catch (e) {
    res.status(500).send('Error interno get login');
  }
});

// register / registro de usuario
router.get('/register', async (req, res) => {
  try {
    res.render('register', { title: 'Registro de Usuario' });
  } catch (e) {
    res.status(500).send('Error interno get register');
  }
});

// recupero / recupero de pass
router.get('/recupero', async (req, res) => {
  try {
    res.render('recupero', { title: 'Recuperar contraseña' });
  } catch (e) {
    res.status(500).send('Error interno get recupero');
  }
});

// logout / logout
router.get('/logout', async (req, res) => {
  try {
    res.render('logout', { title: 'Cerrar sesión' });
  } catch (e) {
    res.status(500).send('Error interno get logout');
  }
});

// -----------------------------------------------------------
// Users CRUD
// ----------------------------------------------------------- 

router.get('/crud/Users', async (req, res) => {
  try {
    res.render('crudUsers', { title: 'CRUD Usuarios' });
  } catch (e) {
    res.status(500).send('Error interno get crudUsers');
  }
});

// -----------------------------------------------------------  
// Home: renderiza lista estática (HTTP)
// -----------------------------------------------------------
router.get('/', async (req, res) => {

  // Si no hay usuario identificado, redirigimos al login
  if (!res.locals.user) {
    return res.redirect('/login');
  }
  
  try {
    const products = await ProductsManager.getAll();
    
    // Traemos sólo los _id de los carritos
    const carts = await CartsManager.getAll();
    const cartIds = carts.map(c => c._id.toString());

    res.render('home', { title: 'Productos', products , cartIds }); // el titulo 'Productos' es el nombre de la pestaña
  } catch (e) {
    res.status(500).send('Error interno get');
  }
});

// -----------------------------------------------------------
// products
// -----------------------------------------------------------

// page: renderiza lista estática Paginando (HTTP)
// Es la misma que Home pero con paginacion 
router.get('/products', async (req, res) => {
  try {
    /* const products = await ProductsManager.getPag(); */

    // Leo y establezco valores por defecto 
    let { 
      limit = 10,       // 10 productos x pag, es lo que pide la consigna
      page = 1,         // iniciar en pagina 1
      sort = "asc",     // puede ser "asc" o "des"    ver en homePaginando.handlebars
      query = "price"   // puede ser "code", "category" o "price" ver en homePaginando.handlebars  
    } = req.query;

    let {docs: products, totalPages, hasPrevPage, hasNextPage, prevPage, nextPage } = 
         await ProductsManager.getPag(limit, page, sort, query);
     
    res.render('homePaginando', { title: 'Paginando',      // el titulo 'Paginando' es el nombre de la pestaña
      products, 
      totalPages, hasPrevPage, hasNextPage, prevPage, nextPage ,
       limit, page, sort, query
    }); 
  } catch (e) {
    res.status(500).send('viewRouter: Error interno get Paginandoss');
  }
});

// Real-time: se llena y actualiza por WebSocket
router.get('/realtimeproducts', (_req, res) => {
  const token = _req.cookies.authCookie;  // **scz**

  res.render('realTimeProducts', { 
    title: 'Productos en Tiempo Real' ,
    token: token || null,    // Pasa el token a la vista
    user: res.locals.user,
    isAuthenticated: res.locals.isAuthenticated

  });

});

// Detalles. Renderiza un producto por _id  //*scz18
router.get('/:pid', async (req, res) => {
  try {
    const product = await ProductsManager.getById(req.params.pid);
    /* hace detalle de producto */
    res.render('detalleProducts', { title: '1Producto', product }); // el titulo 'Producto' es el nombre de la pestaña
  } catch (e) {
    res.status(500).send(`Error producto no encontrado:${req.params.pid}`);
  }
});  //*scz18

// -----------------------------------------------------------
// carts 
// -----------------------------------------------------------

// GET lee lista de id de carritos
router.get('/carts/:cid', async (req, res) => {
 try {
    const cid= req.params.cid;
    
    // Traemos sólo los _id de los carritos
    const cartsAll = await CartsManager.getAll();
    const cartIds = cartsAll.map(c => c._id.toString());
    
    // lee el carrito con populate para mostrarlo 
    const carts = await CartsManager.getCartById(cid);

    // Renderiza la vista en "verProdCart" con el carrito 
    res.render('verProdCart', { title: 'Carrito', carts, cartIds });
 
  } catch (e) {
    const code = /no encontrado|no estaba/i.test(e.message) ? 404 : 400;
    res.status(code).json({ error: e.message });
  }
});  //*fin get

// POST agrega producto al carrito y luego mostrar carrito
router.post('/carts/:cid/product/:pid', async (req, res) => {
  try {
    const qty = Number(req.body.quantity ?? 1); // /* Si no pone una cantidad, asume 1 */
    const cart = await CartsManager.addProductToCart(req.params.cid, req.params.pid, qty);

    // Renderiza la vista en "altaProdCart.handlebars" con el carrito actualizado
    res.render('altaProdCart', { title: 'Carrito', cart });
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});  //*scz19


// DELETE /carts/:cid/product/:pid (quitar producto del carrito)
router.delete('/carts/:cid/product/:pid', async (req, res) => {
  try {
    const cid= req.params.cid;

    // borro el producto del carrito solicitado
    const cart = await CartsManager.removeProductFromCart(cid, req.params.pid);
    
    // Traemos sólo los _id de los carritos
    const cartsAll = await CartsManager.getAll();
    const cartIds = cartsAll.map(c => c._id.toString());
    
    // lee el carrito con populate para mostrarlo actualizado
    const carts = await CartsManager.getCartById(cid);

    // Renderiza la vista en "verProdCart" con el carrito actualizado 
    //   y permite seguir viendo otros carritos 
    res.render('verProdCart', { title: 'Carrito', carts, cartIds  });
 
  } catch (e) {
    const code = /no encontrado|no estaba/i.test(e.message) ? 404 : 400;
    res.status(code).json({ error: e.message });
  }
});

module.exports = router;