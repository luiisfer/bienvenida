import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResetDevice() {
  useEffect(() => {
    // Eliminar los datos del alumno del almacenamiento local
    localStorage.removeItem('alumno_data');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm text-center space-y-6"
      >
        <Card className="shadow-xl border-zinc-100 bg-white p-6 rounded-3xl">
          <CardHeader className="space-y-4">
            <div className="mx-auto w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900">
                ¡Dispositivo Restablecido!
              </CardTitle>
              <CardDescription className="text-sm text-zinc-500">
                Se han borrado los datos de registro guardados en este teléfono.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-zinc-600 text-sm leading-relaxed">
              Ya puedes registrar una nueva asistencia escaneando el código QR del día con un nuevo nombre.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 font-medium bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-400" />
              <span>Listo para nuevos escaneos</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
