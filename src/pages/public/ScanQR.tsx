import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { databases, appwriteConfig } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

type Estado = 'verificando' | 'formulario' | 'registrando' | 'exito' | 'duplicado' | 'error';

export default function ScanQR() {
  const { uuidQR } = useParams();
  const [estado, setEstado] = useState<Estado>('verificando');
  const [mensaje, setMensaje] = useState('');
  
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {
    verificarQR();
  }, []);

  const verificarQR = async () => {
    try {
      // 1. Verificar si el QR existe y está activo
      const today = new Date().toISOString().split('T')[0];
      const qrRes = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.qrDias,
        [
          Query.equal('uuidQR', uuidQR || ''),
          Query.equal('fecha', today),
          Query.equal('activo', true)
        ]
      );

      if (qrRes.documents.length === 0) {
        setEstado('error');
        setMensaje('El código QR no es válido o ha expirado.');
        return;
      }

      // 2. Verificar LocalStorage
      const localData = localStorage.getItem('alumno_data');
      if (!localData) {
        setEstado('formulario');
      } else {
        // Proceder a registrar asistencia
        const alumno = JSON.parse(localData);
        registrarAsistencia(alumno);
      }
    } catch (error) {
      console.error(error);
      setEstado('error');
      setMensaje('Error al conectar con el servidor.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !apellido || !color) return;

    setEstado('registrando');
    
    try {
      const newUuid = uuidv4();
      const alumnoData = {
        uuidAlumno: newUuid,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        color,
      };

      // Guardar alumno en DB
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.alumnos,
        ID.unique(),
        {
          ...alumnoData,
          fechaRegistro: new Date().toISOString()
        }
      );

      // Guardar en LocalStorage
      localStorage.setItem('alumno_data', JSON.stringify(alumnoData));

      // Registrar asistencia
      await registrarAsistencia(alumnoData);
    } catch (error) {
      console.error('Error al registrar alumno', error);
      setEstado('error');
      setMensaje('No se pudo completar el registro del alumno.');
    }
  };

  const registrarAsistencia = async (alumno: any) => {
    setEstado('registrando');
    try {
      const now = new Date();
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.asistencias,
        ID.unique(),
        {
          uuidAlumno: alumno.uuidAlumno,
          uuidQR: uuidQR,
          nombre: alumno.nombre,
          apellido: alumno.apellido,
          color: alumno.color,
          fecha: now.toISOString().split('T')[0],
          hora: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
          timestamp: now.toISOString()
        }
      );
      setEstado('exito');
    } catch (error: any) {
      if (error.code === 409) {
        // Documento ya existe (por el índice único uuidAlumno + uuidQR)
        setEstado('duplicado');
      } else {
        console.error('Error registrando asistencia', error);
        setEstado('error');
        setMensaje('Ocurrió un error al registrar tu asistencia.');
      }
    }
  };

  if (estado === 'verificando' || estado === 'registrando') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/40 p-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-medium">
            {estado === 'verificando' ? 'Verificando código QR...' : 'Registrando asistencia...'}
          </p>
        </div>
      </div>
    );
  }

  if (estado === 'formulario') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card className="shadow-lg border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="text-2xl">Bienvenido</CardTitle>
              <CardDescription>
                Parece que es tu primera vez aquí. Registra tus datos para guardar tu asistencia. 
                Solo tendrás que hacer esto una vez.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleFormSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" required value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Juan" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input id="apellido" required value={apellido} onChange={e => setApellido(e.target.value)} placeholder="Ej. Pérez" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-zinc-700">Color / Equipo</Label>
                  <div className="grid grid-cols-5 gap-1 mt-2 w-full">
                    {['Rojo', 'Azul', 'Verde', 'Amarillo', 'Naranja'].map((c) => {
                      const isSelected = color === c;
                      return (
                        <button
                          type="button"
                          key={c}
                          onClick={() => setColor(c)}
                          className={`py-3 px-0.5 rounded-xl border text-[10px] sm:text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm text-center flex flex-col sm:flex-row items-center justify-center gap-1
                            ${c === 'Rojo' ? (isSelected ? 'bg-red-600 text-white border-transparent ring-2 ring-red-600/30' : 'bg-red-50/70 text-red-700 border-red-200 hover:bg-red-100/70') : ''}
                            ${c === 'Azul' ? (isSelected ? 'bg-blue-600 text-white border-transparent ring-2 ring-blue-600/30' : 'bg-blue-50/70 text-blue-700 border-blue-200 hover:bg-blue-100/70') : ''}
                            ${c === 'Verde' ? (isSelected ? 'bg-green-600 text-white border-transparent ring-2 ring-green-600/30' : 'bg-green-50/70 text-green-700 border-green-200 hover:bg-green-100/70') : ''}
                            ${c === 'Amarillo' ? (isSelected ? 'bg-yellow-500 text-white border-transparent ring-2 ring-yellow-500/30' : 'bg-yellow-50/70 text-yellow-800 border-yellow-200 hover:bg-yellow-100/70') : ''}
                            ${c === 'Naranja' ? (isSelected ? 'bg-orange-600 text-white border-transparent ring-2 ring-orange-600/30' : 'bg-orange-50/70 text-orange-700 border-orange-200 hover:bg-orange-100/70') : ''}
                          `}
                        >
                          <span className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full shrink-0 transition-transform duration-200 ${isSelected ? 'scale-110' : ''}
                            ${c === 'Rojo' ? (isSelected ? 'bg-white' : 'bg-red-500') : ''}
                            ${c === 'Azul' ? (isSelected ? 'bg-white' : 'bg-blue-500') : ''}
                            ${c === 'Verde' ? (isSelected ? 'bg-white' : 'bg-green-500') : ''}
                            ${c === 'Amarillo' ? (isSelected ? 'bg-white' : 'bg-yellow-500') : ''}
                            ${c === 'Naranja' ? (isSelected ? 'bg-white' : 'bg-orange-500') : ''}
                          `} />
                          <span className="truncate">{c}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={!nombre || !apellido || !color}>
                  Guardar y Registrar
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm text-center space-y-6 bg-white p-8 rounded-3xl shadow-xl">
        {estado === 'exito' && (
          <>
            <div className="mx-auto w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">¡Asistencia Registrada!</h1>
            <p className="text-gray-500">
              Tu asistencia de hoy ha sido guardada correctamente a las {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}.
            </p>
            {localStorage.getItem('alumno_data') && (() => {
              const alumno = JSON.parse(localStorage.getItem('alumno_data')!);
              return (
                <div className={`rounded-2xl p-5 mt-6 border text-center flex flex-col items-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all
                  ${alumno.color === 'Rojo' ? 'bg-red-50/50 border-red-100' : ''}
                  ${alumno.color === 'Azul' ? 'bg-blue-50/50 border-blue-100' : ''}
                  ${alumno.color === 'Verde' ? 'bg-green-50/50 border-green-100' : ''}
                  ${alumno.color === 'Amarillo' ? 'bg-yellow-50/20 border-yellow-100' : ''}
                  ${alumno.color === 'Naranja' ? 'bg-orange-50/50 border-orange-100' : ''}
                `}>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Alumno Registrado</span>
                  
                  <h3 className={`text-xl font-bold tracking-tight
                    ${alumno.color === 'Rojo' ? 'text-red-950' : ''}
                    ${alumno.color === 'Azul' ? 'text-blue-950' : ''}
                    ${alumno.color === 'Verde' ? 'text-green-950' : ''}
                    ${alumno.color === 'Amarillo' ? 'text-yellow-950' : ''}
                    ${alumno.color === 'Naranja' ? 'text-orange-950' : ''}
                  `}>
                    {alumno.nombre} {alumno.apellido}
                  </h3>

                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mt-1 border
                    ${alumno.color === 'Rojo' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                    ${alumno.color === 'Azul' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                    ${alumno.color === 'Verde' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                    ${alumno.color === 'Amarillo' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                    ${alumno.color === 'Naranja' ? 'bg-orange-100 text-orange-800 border-orange-200' : ''}
                  `}>
                    <span className={`h-1.5 w-1.5 rounded-full
                      ${alumno.color === 'Rojo' ? 'bg-red-500' : ''}
                      ${alumno.color === 'Azul' ? 'bg-blue-500' : ''}
                      ${alumno.color === 'Verde' ? 'bg-green-500' : ''}
                      ${alumno.color === 'Amarillo' ? 'bg-yellow-500' : ''}
                      ${alumno.color === 'Naranja' ? 'bg-orange-500' : ''}
                    `} />
                    Equipo {alumno.color}
                  </span>
                </div>
              );
            })()}
          </>
        )}

        {estado === 'duplicado' && (
          <>
            <div className="mx-auto w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Ya estás registrado</h1>
            <p className="text-gray-500 text-sm">
              Tu asistencia para este QR ya había sido registrada anteriormente. ¡Buen día!
            </p>
            {localStorage.getItem('alumno_data') && (() => {
              const alumno = JSON.parse(localStorage.getItem('alumno_data')!);
              return (
                <div className={`rounded-2xl p-5 mt-6 border text-center flex flex-col items-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all
                  ${alumno.color === 'Rojo' ? 'bg-red-50/50 border-red-100' : ''}
                  ${alumno.color === 'Azul' ? 'bg-blue-50/50 border-blue-100' : ''}
                  ${alumno.color === 'Verde' ? 'bg-green-50/50 border-green-100' : ''}
                  ${alumno.color === 'Amarillo' ? 'bg-yellow-50/20 border-yellow-100' : ''}
                  ${alumno.color === 'Naranja' ? 'bg-orange-50/50 border-orange-100' : ''}
                `}>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Detalles del Alumno</span>
                  
                  <h3 className={`text-xl font-bold tracking-tight
                    ${alumno.color === 'Rojo' ? 'text-red-950' : ''}
                    ${alumno.color === 'Azul' ? 'text-blue-950' : ''}
                    ${alumno.color === 'Verde' ? 'text-green-950' : ''}
                    ${alumno.color === 'Amarillo' ? 'text-yellow-950' : ''}
                    ${alumno.color === 'Naranja' ? 'text-orange-950' : ''}
                  `}>
                    {alumno.nombre} {alumno.apellido}
                  </h3>

                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mt-1 border
                    ${alumno.color === 'Rojo' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                    ${alumno.color === 'Azul' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                    ${alumno.color === 'Verde' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                    ${alumno.color === 'Amarillo' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                    ${alumno.color === 'Naranja' ? 'bg-orange-100 text-orange-800 border-orange-200' : ''}
                  `}>
                    <span className={`h-1.5 w-1.5 rounded-full
                      ${alumno.color === 'Rojo' ? 'bg-red-500' : ''}
                      ${alumno.color === 'Azul' ? 'bg-blue-500' : ''}
                      ${alumno.color === 'Verde' ? 'bg-green-500' : ''}
                      ${alumno.color === 'Amarillo' ? 'bg-yellow-500' : ''}
                      ${alumno.color === 'Naranja' ? 'bg-orange-500' : ''}
                    `} />
                    Equipo {alumno.color}
                  </span>
                </div>
              );
            })()}
          </>
        )}

        {estado === 'error' && (
          <>
            <div className="mx-auto w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Hubo un problema</h1>
            <p className="text-gray-500">{mensaje}</p>
          </>
        )}
      </motion.div>
    </div>
  );
}
