import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Smartphone } from 'lucide-react';

export default function Config() {
  const resetUrl = `${window.location.origin}/reset`;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
        <p className="text-muted-foreground">Herramientas y ajustes del sistema.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md border-zinc-100">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <Smartphone className="w-5 h-5" />
              <CardTitle className="text-lg font-bold">QR para Restablecer Dispositivo</CardTitle>
            </div>
            <CardDescription className="text-sm">
              Haz que los alumnos escaneen este código si necesitan registrar un nombre diferente o limpiar los datos guardados en su teléfono.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 py-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm border">
              <QRCodeSVG value={resetUrl} size={180} level="H" includeMargin />
            </div>
            <div className="text-center space-y-1">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Enlace de Restablecimiento</span>
              <a
                href={resetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-primary hover:underline font-semibold"
              >
                {resetUrl}
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-zinc-100 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2 text-amber-600">
              <RefreshCw className="w-5 h-5" />
              <CardTitle className="text-lg font-bold">¿Cómo funciona?</CardTitle>
            </div>
            <CardDescription className="text-sm">
              Información sobre el almacenamiento local (LocalStorage) en los dispositivos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-zinc-600">
            <p>
              Para agilizar el registro diario, la aplicación guarda los datos del alumno (nombre, apellido y equipo) en el navegador del teléfono.
            </p>
            <p>
              Si un alumno se registra con datos incorrectos, o si varios alumnos comparten el mismo teléfono para marcar asistencia, el dispositivo se quedará "bloqueado" con los datos del primer registro.
            </p>
            <p className="font-semibold text-zinc-800">
              Al escanear el código QR de esta página con el teléfono afectado, todos los datos locales se borrarán inmediatamente, permitiendo un nuevo registro.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
