const fs = require('fs');
const path = require('path');

// Función simple para crear un PNG válido (header básico + datos dummy para que sea un archivo válido)
// En realidad, para no complicarnos con binarios sin librerías, 
// vamos a copiar el archivo qr-pago.png (que sabemos es una imagen válida) 
// renombrándolo temporalmente para que el navegador lo detecte como icono válido
// O MEJOR: Usaremos un base64 de un icono 1x1 pixel expandido o un icono real descargado si pudiéramos.
// Dado que no tengo canvas, usaré el qr-pago.png como placeholder TEMPORALMENTE 
// para validar si es el formato de imagen lo que falla.
// El usuario podrá cambiarlo luego.

const source = path.join(process.cwd(), 'public', 'qr-pago.png');
const dest192 = path.join(process.cwd(), 'public', 'icon-192x192.png');
const dest512 = path.join(process.cwd(), 'public', 'icon-512x512.png');

fs.copyFileSync(source, dest192);
fs.copyFileSync(source, dest512);

console.log('Iconos PNG temporales generados');
