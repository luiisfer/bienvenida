import { Client, Users, ID } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const users = new Users(client);

// Obtener email y password de argumentos, o usar por defecto
const email = process.argv[2] || 'admin@asistencia.com';
const password = process.argv[3] || 'Asistencia2026!';
const name = process.argv[4] || 'Administrador';

async function createUser() {
    try {
        console.log(`Intentando crear usuario: ${email}...`);
        
        const user = await users.create(
            ID.unique(),
            email,
            undefined, // Teléfono (opcional)
            password,
            name
        );
        
        console.log('\n¡Usuario creado con éxito!');
        console.log('---------------------------');
        console.log(`ID:       ${user.$id}`);
        console.log(`Nombre:   ${user.name}`);
        console.log(`Email:    ${user.email}`);
        console.log(`Password: ${password}`);
        console.log('---------------------------');
    } catch (error) {
        console.error('Error al crear el usuario:', error.message);
        if (error.code === 401) {
            console.error('\n[ERROR] Tu APPWRITE_API_KEY no tiene permisos para gestionar usuarios.');
            console.error('Por favor, asegúrate de que la API Key en tu consola de Appwrite tenga el scope de "users.write" y "users.read".');
        }
    }
}

createUser();
