import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Smartphone, Maximize2, Minimize2 } from 'lucide-react';

export default function Config() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const resetUrl = `${window.location.origin}/reset`;

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground p-4">
        <div className="absolute top-4 right-4">
          <Button variant="outline" size="icon" onClick={toggleFullscreen} title="Salir de pantalla completa">
            <Minimize2 className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="text-center mb-6 space-y-2 px-4">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Restablecer Registro</h1>
          <p className="text-sm md:text-xl text-muted-foreground max-w-lg mx-auto">
            Escanea el código para borrar los datos guardados en este teléfono
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 bg-white p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-[90%] sm:max-w-[400px]">
          <div className="w-full flex items-center justify-center bg-white">
            <QRCodeSVG value={resetUrl} style={{ width: '100%', height: 'auto', maxWidth: '300px' }} level="H" includeMargin />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl p-4 md:p-0">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Configuración</h2>
        <p className="text-muted-foreground text-sm md:text-base">Herramientas y ajustes del sistema.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md border-zinc-100 flex flex-col justify-between">
          <div>
            <CardHeader>
              <div className="flex items-center gap-2 text-primary">
                <Smartphone className="w-5 h-5" />
                <CardTitle className="text-lg font-bold">QR para Restablecer Dispositivo</CardTitle>
              </div>
              <CardDescription className="text-sm">
                Haz que los alumnos escaneen este código si necesitan registrar un nombre diferente o limpiar los datos guardados en su teléfono.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4 py-2">
              <div className="bg-white p-4 rounded-2xl shadow-sm border">
                <QRCodeSVG value={resetUrl} size={150} level="H" includeMargin />
              </div>
              <div className="text-center space-y-1 w-full px-4">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Enlace de Restablecimiento</span>
                <a
                  href={resetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-primary hover:underline font-semibold truncate max-w-full"
                >
                  {resetUrl}
                </a>
              </div>
            </CardContent>
          </div>
          <CardFooter className="border-t p-4 mt-4 flex justify-end">
            <Button onClick={toggleFullscreen} variant="outline" className="gap-2 w-full sm:w-auto">
              <Maximize2 className="h-4 w-4" />
              Pantalla Completa
            </Button>
          </CardFooter>
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
              Para agilizar el registro diario, la aplicación guarda los datos de registro (nombre, apellido y equipo) en el navegador del teléfono.
            </p>
            <p>
              Si un usuario se registra con datos incorrectos, o si varias personas comparten el mismo teléfono para marcar asistencia, el dispositivo se quedará "bloqueado" con los datos del primer registro.
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
