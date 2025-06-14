import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';


// Para solicitar input en consola
import promptSync from 'prompt-sync';
const prompt = promptSync();
const ENV_PATH = path.resolve(__dirname, '..', '.env');
dotenv.config();

function ensureAdminSecret() {
  const existingVars = {
    ADMIN_SECRET: process.env.ADMIN_SECRET,
    VALID_USERNAME: process.env.VALID_USERNAME,
    VALID_PASSWORD: process.env.VALID_PASSWORD,
  };

  if (existingVars.ADMIN_SECRET && existingVars.VALID_USERNAME && existingVars.VALID_PASSWORD) {
    console.log('Todas las variables necesarias están cargadas desde .env');
    return;
  }

  const newLines: string[] = [];

  if (!existingVars.ADMIN_SECRET) {
    const input = prompt('Ingresa una contraseña secreta para el admin: ').trim();
    if (!input) {
      console.error('No se ingresó ningún valor para ADMIN_SECRET. Abortando.');
      process.exit(1);
    }
    newLines.push(`ADMIN_SECRET=${input}`);
  }

  if (!existingVars.VALID_USERNAME) {
    const input = prompt('Ingresa el nombre de usuario válido: ').trim();
    if (!input) {
      console.error(' No se ingresó ningún valor para VALID_USERNAME. Abortando.');
      process.exit(1);
    }
    newLines.push(`VALID_USERNAME=${input}`);
  }

  if (!existingVars.VALID_PASSWORD) {
    const input = prompt('Ingresa la contraseña válida para el usuario: ').trim();
    if (!input) {
      console.error('No se ingresó ningún valor para VALID_PASSWORD. Abortando.');
      process.exit(1);
    }
    newLines.push(`VALID_PASSWORD=${input}`);
  }

  if (newLines.length > 0) {
    fs.appendFileSync(ENV_PATH, '\n' + newLines.join('\n') + '\n');
    console.log('Se guardaron las variables en el archivo .env');
  }
}
// Llama la verificación
ensureAdminSecret();


const authRouter = require('./auth').default; // Importa las rutas de autenticación

const app = express();
app.use(express.json());

// Monta las rutas de login/logout bajo /auth
app.use('/auth', authRouter);



// Inicia el servidor en el puerto 3000
const PORT = process.env.PORT || 3090;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
