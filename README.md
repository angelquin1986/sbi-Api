SBI API - Backend (Experience Southamerica)

Resumen
- Tipo: API REST backend para "Experience Southamerica" (SBI).
- Stack: Node.js + Express; base de datos MongoDB con Mongoose.
- Lenguajes: JavaScript (Node).

Qué hace
- Provee endpoints para: login, gestión de países, pasajeros, órdenes, contactos, búsquedas y subida/gestión de archivos/documentos.
- Rutas principales en /routes; modelos Mongoose en /models.

Archivos clave
- app.js: servidor Express, configuración CORS, body-parser (límite 50mb), conexión Mongo en 'mongodb://localhost:27017/bookingDB', carga de rutas y escucha en puerto 4000.
- package.json: dependencias (express, mongoose, body-parser, multer, express-fileupload, bcryptjs, nodemon). Script start: "nodemon app.js".
- /routes: app.js, login.js, country.js, passenger.js, seller.js, order.js, busqueda.js, contactos.js, upload.js, archivo.js, etc.
- /models: contact.js, country.js, document.js, file.js, order.js, passenger.js, sellers.js.
- /opciones: activos (imagenes/íconos) usados por la app.

Observaciones importantes
- La URI de Mongo está hardcodeada: mongodb://localhost:27017/bookingDB. Se recomienda usar una variable de entorno (MONGODB_URI).
- CORS restringe orígenes a experiencesouthamerica.travel.
- body-parser configurado con límite 50mb (acepta cargas grandes).
- package.json indica "main": "index.js" pero la app se arranca con app.js (start script).

Cómo ejecutar localmente
1. npm install
2. Configurar MongoDB local o establecer MONGODB_URI en el entorno (recomiendo usar un .env con dotenv).
3. npm start (arranca nodemon app.js)
4. Probar endpoints en http://localhost:4000

Siguientes mejoras sugeridas
- Extraer la URI de conexión a variable de entorno (.env) y usar dotenv.
- Añadir README (este archivo) — hecho.
- Añadir manejo de errores global y validaciones de entrada.
- Documentar endpoints principales y ejemplos (Postman/Insomnia).

Contacto
- Autor en package.json: Galavail Development

Notas
- Si se desea, puedo: 1) generar cambios para usar process.env.MONGODB_URI y añadir .env, 2) levantar el servidor aquí para pruebas, 3) crear documentación adicional con ejemplos de requests.
