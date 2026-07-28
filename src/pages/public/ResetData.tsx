import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResetData() {
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  const [alumnoNombre, setAlumnoNombre] = useState<string | null>(() => {
    const data = localStorage.getItem('alumno_data');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        return `${parsed.nombre} ${parsed.apellido}`;
      } catch (e) {
        return 'Usuario Guardado';
      }
    }
    return null;
  });

  const handleClear = () => {
    localStorage.removeItem('alumno_data');
    setAlumnoNombre(null);
    setStatus('success');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <AnimatePresence mode="wait">
        {status === 'idle' ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md"
          >
            <Card className="shadow-xl border-zinc-100">
              <CardHeader className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl font-bold tracking-tight">Restablecer Registro</CardTitle>
                <CardDescription>
                  Elimina los datos del alumno guardados en este dispositivo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                {alumnoNombre ? (
                  <div className="bg-zinc-100/80 rounded-2xl p-4 border border-zinc-200/50">
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Alumno Detectado</p>
                    <p className="text-lg font-semibold text-zinc-800 mt-1">{alumnoNombre}</p>
                  </div>
                ) : (
                  <div className="bg-zinc-100/50 rounded-2xl p-4 border border-dashed border-zinc-200 text-zinc-400">
                    <p className="text-sm">No hay datos de ningún alumno guardados en este dispositivo.</p>
                  </div>
                )}
                <p className="text-sm text-zinc-500">
                  Al limpiar los datos, el dispositivo ya no recordará el nombre al escanear un código QR, permitiéndote registrar a un alumno diferente.
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 pt-2">
                <Button 
                  onClick={handleClear} 
                  disabled={!alumnoNombre} 
                  className="w-full gap-2 py-6 text-sm font-semibold rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  <Trash2 className="w-4 h-4" />
                  Limpiar Datos de Registro
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md"
          >
            <Card className="shadow-xl border-zinc-100">
              <CardHeader className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 animate-bounce" />
                </div>
                <CardTitle className="text-xl font-bold tracking-tight">¡Datos Limpiados!</CardTitle>
                <CardDescription>
                  Se han eliminado correctamente todos los datos locales.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center text-sm text-zinc-500">
                El almacenamiento local (LocalStorage) se ha vaciado. Ahora puedes escanear un código QR de asistencia para registrar un nuevo alumno.
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => setStatus('idle')} 
                  variant="outline" 
                  className="w-full gap-2 py-6 text-sm font-semibold rounded-xl"
                >
                  <RotateCcw className="w-4 h-4" />
                  Volver a Empezar
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
