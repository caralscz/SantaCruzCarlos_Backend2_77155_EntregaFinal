//
// -----------------------------------------------------------
// src/config/envs.js
//
// Aquí definimos las variables de entorno, o sea, 
//  constantes que no se publicarán en github 
//
// ----------------------------------------------------------- 
//

module.exports = {
  // # usado en index.js cuando hacemos el listen del servidor
  port: process.env.PORT || 8080,   // default: escuchar en 8080

  // # usado en index.js 
  mongo_db: process.env.MONGO_DB || "mongodb+srv://sczcaral_dbCoder:coderdb01@cluster0.7yscrme.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",

  // # usado en index.js
  db_name: process.env.DB_NAME || "dbSczComision76495",

  // # usado en passportConfig.js  y passwJwt
  jwt_secret: process.env.JWT_SECRET || "anitalavalatina" , 
};
