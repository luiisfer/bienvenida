import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function list() {
    try {
        console.log('Obteniendo bases de datos...');
        const list = await databases.list();
        console.log(`Bases de datos encontradas (${list.total}):`);
        list.databases.forEach(db => {
            console.log(`- ID: ${db.$id}, Nombre: ${db.name}`);
        });
    } catch (e) {
        console.error('Error:', e.message);
    }
}

list();
