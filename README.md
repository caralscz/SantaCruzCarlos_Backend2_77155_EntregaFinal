
# E-commerce con Autenticación, Autorización y generación de ticket

## Objetivo

  El e-commerce existente del curso anterior, fué desarrollado como una API RESTful con Node.js, Express, Handlebars y Socket.io para la gestión de productos y carritos de compra en tiempo real, con persistencia en sistema de archivos mongoDB.

  Sobre esa base, se debe implementar un sistema de "login" de usuario con encriptación de contraseñas y que trabaje con JWT (JSON Web Tokens)

  Se debe hacer un CRUD de usuarios

## Entrega final
- Curso: Backend II: DISEÑO Y ARQUITECTURA BACKEND 
- Comisión 77155 del 23/sept/2025 al 11/nov/2025 los Martes de 19:00 a 21:00h
- Alumno:  Carlos Alfredo santa Cruz
- Profesor: Daniel Riverol -  Adjunto o Tutor: Andrés Rubio 

---

## Requisitos
- Implementar un CRUD de usuarios, junto con un sistema de Autenticación y Autorización.
  El crud se implementó sobre http://localhost:8080/crud/Users 

- Modelo de Usuario: 
  Crear un modelo User que contenga los siguientes campos:
      first_name: String      
      last_name: String
      email: String (debe ser único)      
      age: Number      
      password: String (en formato hash)      
      cart: Id con referencia a Carts      
      role: String (valor por defecto: 'user')

- Encriptación de Contraseña:
  Utilizar el paquete bcrypt para encriptar la contraseña del usuario mediante el método hashSync.

- Sistema de Login:
  Implementar un sistema de login del usuario que trabaje con JWT (JSON Web Tokens).

-  Sistema de Login y Generación de Token JWT: Que el sistema de login permita a los usuarios autenticarse y generar un token JWT válido.
  Que los usuarios pueden iniciar sesión de manera exitosa y se les asigna un token JWT.
  Que el token JWT sea válido y pueda utilizarse para realizar acciones protegidas en la aplicación.

- Agregar a la vista de productos un mensaje de bienvenida con los datos del usuario
  Agregar un usuario que en el login tenga como correo adminCoder@coder.com, y la contraseña adminCod3r123, el cual será "admin"
  Todos los usuarios que no sean admin deberán contar con un rol “usuario”.
  Implementar botón de “logout” para destruir la sesión

- El index de la aplicacion es "src/index.js"

  El CRUD  de usuarios (/crud/users) se define en "src/routes/crudUsersRouter.js"
  
  Ubicación del archivo "src/dao/models/userModel.js"

---


## Estructura del Proyecto

```
Comision77155entregaFinal/
+- src/ 
¦  +- app.js                    # main: Servidor principal
¦  +- config/                   # archivos de configuración
¦  ¦  +- envs.js                # aquí definimos variables de entorno
¦  ¦  +- db.js                  # Conexión a Mongo usando Mongoose
¦  ¦  +- passportConfig.js      # Passport , Estrategia JWT, Serialización de usuario
¦  +- dao/                       
¦  ¦  +- productsManager.js     # Clases estáticas con métodos CRUD. Plantilla
¦  ¦  ¦                         #     u “objeto constructor” de "products"
¦  ¦  +- cartsManager.js        # idem para "carts"
¦  ¦  +- ticketDAO.js         
¦  ¦  +- ticketManager.js     
¦  ¦  +- userDao.js           
¦  ¦  +- models/                # 
¦  ¦     +- productsModel.js    # productSchema
¦  ¦     +- cartsModel.js       # cartProductSchema
¦  ¦     +- ticketModel.js
¦  ¦     +- userModel.js        # userCollection, esquema de Usuarios
¦  +- dto/
¦  ¦     +- UserDTO.js
¦  +- middlewares
¦  ¦     +-auth.js 
¦  ¦     +-roles.js
¦  +- controllers
¦  ¦  +- cartController.js
¦  ¦  +- usersController.js
¦  +- public/                    
¦  ¦  +- imgShop/               # imagenes refernciadas desde mongoDB
¦  ¦  +- img/                   # imagenes otras
¦  ¦  +- css/                   # 
¦  ¦     +- styles.css          # hoja de estilos
¦  +- routes/ 
¦  ¦  +- productsRouter.js      # Rutas de productos. REST completo para products
¦  ¦  +- cartsRouter.js         # Rutas de carritos. REST completo para carts
¦  ¦  +- viewsRouter.js         # Rutas para las vistas de handlebars 
¦  ¦  +- crudUsersRouter.js     # Rutas CRUD visual para users (usa Handlebars)
¦  ¦  +- sessionRoutes.js       #
¦  ¦  +- userRouter.js          # Rutas REST completo para usuarios
¦  +- services
¦  ¦  +- cartService.js  
¦  ¦  +- ticketService.js
¦  ¦  +- usersService.js 
¦  +- utils/
¦  ¦  +- passwJwt.js            # trata hash de passwords y JWT
¦  +- views/                     
¦     +- layouts/               # 
¦     ¦  +- main.handlebars     # Vistas (Handlebars)
¦     +- home.handlebars        # Home pag . Lista la totalidad de los productos
¦     +- realTimeProducts.handlebars # Crear/Eliminar productos usando WebSocket
¦                                    # Se actualiza en vivo en todos los clientes
¦     +- altaProdCart.handlebars     # Detalle de un carrito luego del alta de un producto
¦     +- crudUsers.handlebars
¦     +- login.handlebars
¦     +- profile.handlebars
¦     +- recupero.handlebars
¦     +- register.handlebars
¦     +- detalleProducts.handlebars  # Vista en detalle de un producto
¦     +- homePaginando.handlebars    # Home pag con paginación
¦     +- verProdCart.handlebars      # Vista en detalle de un carrito 
¦
+- .env                         # variables de entorno  (constantes)
+- .env_copy                    # copia del .env 
+- package.json    
+- package-lock.json    
+- README.md                    #


```

---

##  Endpoints de la API

### user (`/api/users`)

  - GET /api/users         -lista los usuarios
  - GET /api/users/:uid    -lista un usuario
  - POST /api/users         -crea un usuario
  - PUT  api/users/:uid     -Actualizar un usuario
  - DELETE api/users/:uid   -elimina un usuario

### (`/crud/users`)
  - GET  /crud/users        -lista los usuarios (handlebars), solo "admin"
  - POST /crud/users        -crea un usuario -ingresar: email,password,first_name,last_name,age,role
  - PUT  /crud/users/:id    -Actualiza un usuario existente 
  - DELETE /crud/users/:id  -Elimina un usuario

### (`/api/sessions`)
  - POST /api/sessions/login    -debe ingresarse email y password
  - POST /api/sessions/logout   
  - GET  /api/sessions/current  -muestra todos los atributos del usuario autenticado
  - POST /api/sessions/recupero  -recupera la password
  - POST /api/sessions/register  -crear usuario

### Productos (`/api/products`)

  - GET /api/products - Lee todos los productos (con  paginado, limit, sort y query)
  - GET /api/products/:pid - Obtener producto por ID
  - POST /api/products - Crear nuevo producto    (** io.emit)
  - PUT /api/products/:pid  - Update products
  - DELETE /api/products/:pid - Elimina un producto específico.  (** io.emit)

**Ejemplos:**
```bash
  GET http://localhost:8080/api/products/
  GET http://localhost:8080/api/products/68b61ae76a94ba2857c4cba4
```

### Carrito (Carts) (`/api/carts`)
  - GET  /api/carts       - Obtener todos los carritos
  - GET  /api/carts/:cid  - Obtener carrito por ID
  - POST /api/carts       - Crear nuevo carrito
  - POST /api/carts/:cid/product/:pid - Agregar producto al carrito
  - DELETE /api/carts/:cid/product/:pid    Elimina un producto específico del carrito.
  - DELETE /api/carts/:cid    Eliminar ese carrito

---

### Librerias utilizadas  📦 📚

- [Express](https://expressjs.com/): Express es un marco de aplicación web Node.js que proporciona un conjunto de características para aplicaciones web y móviles.
- [Express.handlebars](https://handlebarsjs.com/) Motor de plantillas para Express.js que permite generar HTML dinámico.
- [Node.js](https://nodejs.org/es): Node.js® es un entorno de ejecución de JavaScript que permite a los desarrolladores crear servidores, aplicaciones web, herramientas de línea de comandos y scripts.
- [handlebash](https://handlebarsjs.com/) Handlebars es un lenguaje de plantillas sencillo que se usa principalmente para generar HTML, pero también puede crear otros formatos de texto. Las plantillas de Handlebars constan de texto normal intercalado con expresiones Handlebars.
- [Socket.io](https://socket.io/) IO es una biblioteca para el control de eventos de aplicaciones web en tiempo real. Permite la comunicación bidireccional en tiempo real entre clientes web y servidores. ? Consta de dos componentes: un cliente y un servidor.
- [mongoDB / mongoose](https://www.mongodb.com/es/products/platform/cloud) MongoDB Atlas es una base de datos cloud totalmente gestionada, construida sobre el modelo de documentos
- [bcrypt](https://www.npmjs.com/package/bcrypt):Bcrypt es una función de hash de contraseñas y derivación de claves basada en el cifrado Blowfish
- [cookie-parser](https://www.npmjs.com/package/cookie-parser):cookieParser es un middleware de Express.js que se utiliza para analizar y manejar las cookies que se envían desde el cliente hasta el servidor
- [express-session](https://expressjs.com/es/):Express es un minimalista y flexible framework de aplicaciones web de Node.js 
- [jsonwebtoken](https://www.jwt.io/) / (https://www.npmjs.com/package/jsonwebtoken): es un estándar para la autenticación y el intercambio de información definido por RFC7519. Es posible almacenar objetos JSON de forma segura y compacta. Este token es un código Base64 y se puede firmar con un par de claves secretas o privadas/públicas.
- [passport](https://www.passportjs.org/): proporciona una interfaz consistente y modular que le permite conectar cualquier estrategia que necesite y configurarla con algunas opciones
- [session-file-store](https://www.npmjs.com/package/session-file-store):  Session file store is a provision for storing session data in the session file


---
## Instalación  ⚙️

1. Clona el repositorio o crea los archivos del proyecto

2. Instala las dependencias:
```bash
npm install 
```

3. Ejecuta el servidor:
```bash
# npm start
```

5. Luego podrá acceder a la aplicación desde cualquier navegador en **localhost** desde

- 🚀 Home [http://localhost:8080](http://localhost:8080)
- 🧑🏽‍🦰 CRUD Users (vistas):   [http://localhost:8080/crud/Users](http://localhost:8080/crud/Users)
- 📦 [http://localhost:8080/api/products](http://localhost:8080/api/products)
- 🛒 [http://localhost:8080/api/carts](http://localhost:8080/api/carts)
- 🧑🏽‍🦰 [http://localhost:8080/api/users](http://localhost:8080/api/users)
- ⚡ Real Time [http://localhost:8080/realtimeproducts](http://localhost:8080/realtimeproducts)

---

# Repositorio GitHub: SantaCruzCarlos_Backend2_77155_EntregaFinal