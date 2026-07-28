import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = 'asistencia_db';

async function createIndexes() {
    console.log('--- Creando Índices Faltantes ---');

    // 1. Alumnos
    const alumnosIndexes = [
        { key: 'idx_uuidAlumno', type: 'unique', attributes: ['uuidAlumno'] },
        { key: 'idx_fechaRegistro', type: 'key', attributes: ['fechaRegistro'] }
    ];

    for (const idx of alumnosIndexes) {
        try {
            console.log(`Intentando crear índice '${idx.key}' en colección 'alumnos'...`);
            await databases.createIndex(DATABASE_ID, 'alumnos', idx.key, idx.type, idx.attributes);
            console.log(`Índice '${idx.key}' creado con éxito.`);
        } catch (e) {
            if (e.code === 409) {
                console.log(`El índice '${idx.key}' ya existe.`);
            } else {
                console.error(`Error al crear índice '${idx.key}':`, e.message);
            }
        }
    }

    // 2. QR Días
    const qrIndexes = [
        { key: 'idx_uuidQR', type: 'unique', attributes: ['uuidQR'] },
        { key: 'idx_fecha', type: 'key', attributes: ['fecha'] },
        { key: 'idx_activo', type: 'key', attributes: ['activo'] }
    ];

    for (const idx of qrIndexes) {
        try {
            console.log(`Intentando crear índice '${idx.key}' en colección 'qr_dias'...`);
            await databases.createIndex(DATABASE_ID, 'qr_dias', idx.key, idx.type, idx.attributes);
            console.log(`Índice '${idx.key}' creado con éxito.`);
        } catch (e) {
            if (e.code === 409) {
                console.log(`El índice '${idx.key}' ya existe.`);
            } else {
                console.error(`Error al crear índice '${idx.key}':`, e.message);
            }
        }
    }

    // 3. Asistencias
    const asistenciasIndexes = [
        { key: 'idx_asistencia_unica', type: 'unique', attributes: ['uuidAlumno', 'uuidQR'] },
        { key: 'idx_fecha', type: 'key', attributes: ['fecha'] },
        { key: 'idx_timestamp', type: 'key', attributes: ['timestamp'] }
    ];

    for (const idx of asistenciasIndexes) {
        try {
            console.log(`Intentando crear índice '${idx.key}' en colección 'asistencias'...`);
            await databases.createIndex(DATABASE_ID, 'asistencias', idx.key, idx.type, idx.attributes);
            console.log(`Índice '${idx.key}' creado con éxito.`);
        } catch (e) {
            if (e.code === 409) {
                console.log(`El índice '${idx.key}' ya existe.`);
            } else {
                console.error(`Error al crear índice '${idx.key}':`, e.message);
            }
        }
    }

    console.log('\n--- Proceso finalizado ---');
}

createIndexes();
