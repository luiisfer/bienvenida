import { Client, Databases, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY); // Necesitas crear un API Key en Appwrite con permisos de Database

const databases = new Databases(client);

const DATABASE_ID = 'asistencia_db';

async function setup() {
    try {
        console.log('Creando base de datos...');
        try {
            await databases.create(DATABASE_ID, 'Asistencia DB');
            console.log('Base de datos creada exitosamente.');
        } catch (e) {
            if (e.code === 409) {
                console.log('La base de datos ya existe.');
            } else {
                throw e;
            }
        }

        console.log('\n--- Creando colecciones ---');

        // 1. Colección: alumnos
        const ALUMNOS_COLLECTION = 'alumnos';
        try {
            await databases.createCollection(
                DATABASE_ID, 
                ALUMNOS_COLLECTION, 
                'Alumnos',
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.any()),
                    Permission.update(Role.any()),
                    Permission.delete(Role.any())
                ]
            );
            console.log(`Colección ${ALUMNOS_COLLECTION} creada.`);
            
            await databases.createStringAttribute(DATABASE_ID, ALUMNOS_COLLECTION, 'uuidAlumno', 100, true);
            await databases.createStringAttribute(DATABASE_ID, ALUMNOS_COLLECTION, 'nombre', 100, true);
            await databases.createStringAttribute(DATABASE_ID, ALUMNOS_COLLECTION, 'apellido', 100, true);
            await databases.createStringAttribute(DATABASE_ID, ALUMNOS_COLLECTION, 'color', 50, true);
            await databases.createDatetimeAttribute(DATABASE_ID, ALUMNOS_COLLECTION, 'fechaRegistro', true);

            // Indice
            await new Promise(resolve => setTimeout(resolve, 2000));
            await databases.createIndex(DATABASE_ID, ALUMNOS_COLLECTION, 'idx_uuidAlumno', 'unique', ['uuidAlumno']);
            console.log(`Atributos de ${ALUMNOS_COLLECTION} creados.`);
        } catch (e) {
            console.log(`Error o ya existe la colección ${ALUMNOS_COLLECTION}:`, e.message);
        }

        // 2. Colección: qr_dias
        const QR_COLLECTION = 'qr_dias';
        try {
            await databases.createCollection(
                DATABASE_ID, 
                QR_COLLECTION, 
                'QR Dias',
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users())
                ]
            );
            console.log(`Colección ${QR_COLLECTION} creada.`);
            
            await databases.createStringAttribute(DATABASE_ID, QR_COLLECTION, 'uuidQR', 100, true);
            await databases.createStringAttribute(DATABASE_ID, QR_COLLECTION, 'fecha', 50, true);
            await databases.createStringAttribute(DATABASE_ID, QR_COLLECTION, 'hora', 50, true);
            await databases.createBooleanAttribute(DATABASE_ID, QR_COLLECTION, 'activo', true, true);

            await new Promise(resolve => setTimeout(resolve, 2000));
            await databases.createIndex(DATABASE_ID, QR_COLLECTION, 'idx_uuidQR', 'unique', ['uuidQR']);
            console.log(`Atributos de ${QR_COLLECTION} creados.`);
        } catch (e) {
            console.log(`Error o ya existe la colección ${QR_COLLECTION}:`, e.message);
        }

        // 3. Colección: asistencias
        const ASISTENCIAS_COLLECTION = 'asistencias';
        try {
            await databases.createCollection(
                DATABASE_ID, 
                ASISTENCIAS_COLLECTION, 
                'Asistencias',
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.any()),
                    Permission.update(Role.any())
                ]
            );
            console.log(`Colección ${ASISTENCIAS_COLLECTION} creada.`);
            
            await databases.createStringAttribute(DATABASE_ID, ASISTENCIAS_COLLECTION, 'uuidAlumno', 100, true);
            await databases.createStringAttribute(DATABASE_ID, ASISTENCIAS_COLLECTION, 'uuidQR', 100, true);
            await databases.createStringAttribute(DATABASE_ID, ASISTENCIAS_COLLECTION, 'nombre', 100, true);
            await databases.createStringAttribute(DATABASE_ID, ASISTENCIAS_COLLECTION, 'apellido', 100, true);
            await databases.createStringAttribute(DATABASE_ID, ASISTENCIAS_COLLECTION, 'color', 50, true);
            await databases.createStringAttribute(DATABASE_ID, ASISTENCIAS_COLLECTION, 'fecha', 50, true);
            await databases.createStringAttribute(DATABASE_ID, ASISTENCIAS_COLLECTION, 'hora', 50, true);
            await databases.createDatetimeAttribute(DATABASE_ID, ASISTENCIAS_COLLECTION, 'timestamp', true);

            await new Promise(resolve => setTimeout(resolve, 3000)); // Esperar que los atributos se creen
            await databases.createIndex(DATABASE_ID, ASISTENCIAS_COLLECTION, 'idx_asistencia_unica', 'unique', ['uuidAlumno', 'uuidQR']);
            console.log(`Atributos de ${ASISTENCIAS_COLLECTION} creados.`);
        } catch (e) {
            console.log(`Error o ya existe la colección ${ASISTENCIAS_COLLECTION}:`, e.message);
        }

        console.log('\n¡Configuración completada!');
        console.log('Recuerda configurar el DATABASE_ID en tus variables de entorno si usas otro:');
        console.log(`VITE_APPWRITE_DATABASE_ID=${DATABASE_ID}`);

    } catch (error) {
        console.error('Error general durante el setup:', error);
    }
}

setup();
