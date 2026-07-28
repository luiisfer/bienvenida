import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = 'asistencia_db';
const COLLECTION_ID = 'qr_dias';

async function addAttribute() {
    try {
        console.log(`Creando atributo boolean 'activo' (required: true) en la colección '${COLLECTION_ID}'...`);
        await databases.createBooleanAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            'activo',
            true // required
        );
        console.log(`¡Atributo 'activo' creado con éxito!`);
    } catch (e) {
        console.error('Error:', e.message);
    }
}

addAttribute();
