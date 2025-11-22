// -----------------------------------------------------------
// src/index.js
// Monta todo: 
// Express, Handlebars, Socket.io, rutas, conexión a Mongo y eventos WS.
// -----------------------------------------------------------
// 
const express = require('express');
const { engine } = require('express-handlebars');
const jwt = require('jsonwebtoken');  // JWT para autenticar en Socket.io
const envs = require( "./config/envs.js");    // variables de entorno
const { attachUserToViews ,isAuthenticated} = require('./utils/passwJwt.js');

const sessionRoutes = require('./routes/sessionRoutes.js');
const session =require("express-session");
const cookieParser =require("cookie-parser");
// passport
const initializePassport =require("./config/passportConfig.js");
const passport =require("passport");
const app = express();

const Handlebars = require('handlebars');  // para poder hacer el helper if
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const { conectarDB } = require('./config/db.js');

// App + HTTP server + Socket.io
const server = http.createServer(app);
const io = new Server(server);

// Routers
const userRouter = require('./routes/userRouter.js');    // api/users 
const crudUsersRouter = require("./routes/crudUsersRouter.js");  // MVC del CRUD
const cartsRouter = require('./routes/cartsRouter.js');  
const viewsRouter = require('./routes/viewsRouter.js');
const productsRouterFactory = require('./routes/productsRouter.js');

// Middlewares  incorporados de Express
app.use(express.json());   // Formatea los cuerpos json de peticiones entrantes.
app.use(express.urlencoded({ extended: true }));  // Formatea query params de URLs para peticiones entrantes.

// Carpeta pública para archivos estáticos (css, js, imágenes, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// ============================================================
// passport 
// ============================================================
app.use(cookieParser());
initializePassport();
app.use(passport.initialize());

// Middleware para pasar datos del usuario a todas las vistas
app.use(attachUserToViews);
// ============================================================
// Rutas API (inyectamos io en productos para emitir en create/delete vía HTTP)
// ============================================================
app.use('/api/products', productsRouterFactory(io)); // Router de productos
app.use('/api/carts', cartsRouter);    // Router de carritos
app.use("/api/sessions", sessionRoutes);  // Router de sesiones (login, register)
app.use('/api/users', userRouter);     // Router de usuarios
app.use("/crud/users", crudUsersRouter);      // Router CRUD visual con  controlers separado MVC completo

// ============================================================
// Rutas, vistas.  Home
// ============================================================
app.use('/', viewsRouter); // sirve también para /:id

// Helper para handelbars para comparación de a === b
Handlebars.registerHelper('isEqual', function(value1, value2) {
  return value1 === value2;
});
Handlebars.registerHelper("ifEquals", function(a, b, options) {
  return (a == b) ? options.fn(this) : options.inverse(this);
});

// ============================================================
// Socket.io  con autenticación: 
// inicializa lista al conectar (la vista realtime se actualiza)
// ============================================================
const ProductsManager = require('./dao/productsManager.js');
const { pid } = require('process');
const { constants } = require('crypto');

// ============================================================
io.use((socket, next) => {
  // Obtener el token de las cookies
  const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.split('authCookie=')[1]?.split(';')[0];
  
  if (!token) {
    return next(new Error('tki No autenticado'));
  }

  try {
    const decoded = jwt.verify(token, envs.jwt_secret);
    socket.user = decoded.user; // Adjuntar usuario al socket
    next();
  } catch (error) {
    return next(new Error('tki Token inválido'));
  }
});

// ============================================================
io.on('connection', async (socket) => {
  console.log(`Real time. Usuario conectado: ${socket.user.email} (${socket.user.role})`); // **scz**

  try {
    const products = await ProductsManager.getAll();
    
    // aquí pido ordenar por code 
    products.sort((a, b) => b.code.localeCompare(a.code));

    socket.emit('products:init', products);
  } catch (e) {
    console.error('WS init error:', e.message);
  }

  // Crear por WS - sólo si es admin
  socket.on('product:create', async (payload) => {
    try {
      
      if (socket.user.role !== 'admin') {   //  VALIDA QUE SEA ADMIN
        return socket.emit('error:message', 'Solo los administradores pueden crear productos');
      }

      const created = await ProductsManager.create(payload);
      io.emit('product:created', created);
    } catch (e) {
      socket.emit('error:message', e.message);
    }
  });

  // Eliminar por WS - SOLO ADMIN
  socket.on('product:delete', async (id) => {
    try {
  
      if (socket.user.role !== 'admin') {   //  VALIDA QUE SEA ADMIN
        return socket.emit('error:message', 'Solo los administradores pueden eliminar productos');
      }

      const deleted = await ProductsManager.deleteById(id);
      io.emit('product:deleted', String(deleted._id));
    } catch (e) {
      socket.emit('error:message', e.message);
    }
  });

 socket.on('disconnect', () => {
    console.log(`Real time. Usuario desconectado: ${socket.user.email}`);
  }); 
});

// --------------------------------------------------- +
//                    Boot
// --------------------------------------------------- +
(async () => {
  console.log('✋ Esperame, me conecto y te aviso 👷‍♂️')
  console.log(' ')

  // Voy a conexión con Mongo usando Mongoose. En config/db.js
  //    Le paso (url, dbName) usando las constantes definidas en src/config/envs.js
  await conectarDB(envs.mongo_db, envs.db_name);
  
  // Levanto el servidor HTTP en el puerto 8080
  //    El puerto del listen, está definida en src/config/envs.js
  server.listen(envs.port, () => {
    console.log(' ')
    console.log('😊 Todo listo ')
    console.log(' ');
    console.log(` Home      :   http://localhost:${envs.port}/`);
    console.log(` CRUD Users:   http://localhost:${envs.port}/crud/Users`);
    console.log(' ');
    console.log(` API Products: http://localhost:${envs.port}/api/products`);
    console.log(` API Carts :   http://localhost:${envs.port}/api/carts`);
    console.log(` API Users :   http://localhost:${envs.port}/api/users`);
    console.log(` Paginación:   http://localhost:${envs.port}/products?page=1&limit=10`);
    console.log(` Real Time :   http://localhost:${envs.port}/realtimeproducts`);
  });
})();