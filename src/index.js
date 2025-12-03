// -----------------------------------------------------------
// src/index.js
// Monta todo: 
// Express, Handlebars, Socket.io, rutas, conexión a Mongo y eventos WS.
// -----------------------------------------------------------

const express = require('express');
const { engine } = require('express-handlebars');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');
const { conectarDB } = require('./config/db.js');
const envs = require('./config/envs.js');  // variables de entorno
const initializePassport = require('./config/passportConfig.js');
const { attachUserToViews } = require('./utils/passwJwt.js');
const socketManager = require('./utils/socketManager.js'); // separado

// Routers (controllers/routers ya refactorizados abajo)
const productsRouter = require('./routes/productsRouter.js');
const cartsRouter = require('./routes/cartsRouter.js');
const sessionRoutes = require('./routes/sessionRoutes.js');
const userRouter = require('./routes/userRouter.js');      // tu usuario API 
const crudUsersRouter = require('./routes/crudUsersRouter.js') // crud usuarios
const viewsRouter = require('./routes/viewsRouter.js');
const ticketsRouter = require('./routes/ticketsRouter.js'); // nuevo

const app = express();
const server = http.createServer(app);

// === middlewares express ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// === handlebars ===
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// === passport ===
initializePassport();
app.use(require('passport').initialize());

// === attach user to views (reads JWT cookie) ===
app.use(attachUserToViews);

// === routes (API + views) ===
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/sessions', sessionRoutes);
app.use('/api/tickets', ticketsRouter);
app.use('/api/users', userRouter);
app.use('/crud/users', crudUsersRouter);
app.use('/', viewsRouter);

// === register handlebars helpers (mantener) ===
const Handlebars = require('handlebars');    // para poder hacer el helper is/if
Handlebars.registerHelper('isEqual', function(v1, v2) { return v1 === v2; });
Handlebars.registerHelper('ifEquals', function(a, b, options) { return (a == b) ? options.fn(this) : options.inverse(this); });

// === levantar server y socketManager ===
(async () => {
  await conectarDB(envs.mongo_db, envs.db_name);
  const io = require('socket.io')(server);

  // inicializa sockets en archivo separado (lo desacoplamos)
  socketManager(io);

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
    console.log(' ');
    console.log(` User current :   http://localhost:${envs.port}/api/sessions/current`);
    console.log(` Paginación :   http://localhost:${envs.port}/products?page=1&limit=10`);
    console.log(` Real Time  :   http://localhost:${envs.port}/realtimeproducts`);
  });
})();
