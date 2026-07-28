import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = 'asistencia_db';

async function listCollections() {
    try {
        console.log(`Obteniendo colecciones de la base de datos ${DATABASE_ID}...`);
        const list = await databases.listCollections(DATABASE_ID);
        console.log(`Colecciones encontradas (${list.total}):`);
        for (const col of list.collections) {
            console.log(`- ID: ${col.$id}, Nombre: ${col.name}`);
            
            // List attributes
            console.log('  Atributos:');
            col.attributes.forEach(attr => {
                console.log(`    * ${attr.key} (${attr.type}, required: ${attr.required})`);
            });
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

listCollections();
