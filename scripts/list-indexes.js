import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = 'asistencia_db';

async function listIndexes() {
    try {
        const collections = ['alumnos', 'qr_dias', 'asistencias'];
        for (const col of collections) {
            console.log(`\nColección: ${col}`);
            const res = await databases.getCollection(DATABASE_ID, col);
            console.log('Indexes:');
            res.indexes.forEach(idx => {
                console.log(`- ID: ${idx.key}, Tipo: ${idx.type}, Atributos: ${idx.attributes.join(', ')}`);
            });
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

listIndexes();
