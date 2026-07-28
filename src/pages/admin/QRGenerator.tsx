import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { QRCodeSVG } from 'qrcode.react';
import { databases, appwriteConfig } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Maximize2, Minimize2 } from 'lucide-react';

const formatFecha = (fechaStr: string) => {
  if (!fechaStr) return '';
  const parts = fechaStr.split('-');
  if (parts.length !== 3) return fechaStr;
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const formatted = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export default function QRGenerator() {
  const [activeQR, setActiveQR] = useState<any>(null);
  const [hasQRForToday, setHasQRForToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchActiveQR = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.qrDias,
        [
          Query.equal('fecha', today),
          Query.limit(10)
        ]
      );

      if (response.documents.length > 0) {
        setHasQRForToday(true);
        const active = response.documents.find(doc => doc.activo === true) || response.documents[0];
        setActiveQR(active);
      } else {
        setHasQRForToday(false);
        setActiveQR(null);
      }
    } catch (error) {
      console.error('Error fetching active QR:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveQR();
  }, []);

  const generateQR = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Doble verificación: listar si ya existe algún documento para hoy
      const existing = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.qrDias,
        [Query.equal('fecha', today), Query.limit(1)]
      );

      if (existing.documents.length > 0) {
        setErrorMsg('Ya se ha generado un código QR para el día de hoy. Solo se permite un QR por día.');
        setHasQRForToday(true);
        const active = existing.documents.find(doc => doc.activo === true) || existing.documents[0];
        setActiveQR(active);
        setIsLoading(false);
        return;
      }

      const newUuid = uuidv4();
      const now = new Date();
      
      const newQR = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.qrDias,
        ID.unique(),
        {
          uuidQR: newUuid,
          fecha: today,
          hora: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
          activo: true
        }
      );

      setActiveQR(newQR);
      setHasQRForToday(true);
      setIsFullscreen(true);
    } catch (error) {
      console.error('Error generating QR:', error);
      setErrorMsg('Error de conexión o fallo al crear el documento en la base de datos.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleActiveStatus = async () => {
    if (!activeQR) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const newStatus = !activeQR.activo;
      const updated = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.qrDias,
        activeQR.$id,
        {
          activo: newStatus
        }
      );
      setActiveQR(updated);
    } catch (error) {
      console.error('Error updating QR status:', error);
      setErrorMsg('Error al actualizar el estado del QR.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFullscreen && activeQR) {
    const scanUrl = `${window.location.origin}/scan/${activeQR.uuidQR}`;
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground p-4">
        <div className="absolute top-4 right-4">
          <Button variant="outline" size="icon" onClick={toggleFullscreen} title="Salir de pantalla completa">
            <Minimize2 className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="text-center mb-6 space-y-2 px-4">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Registro de Asistencia</h1>
          <p className="text-sm md:text-xl text-muted-foreground max-w-lg mx-auto">Escanea el código para registrarte hoy</p>
        </div>

        <div className="flex flex-col items-center gap-4 bg-white p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-[90%] sm:max-w-[400px]">
          <div className="w-full flex items-center justify-center bg-white">
            <QRCodeSVG value={scanUrl} style={{ width: '100%', height: 'auto', maxWidth: '300px' }} level="H" includeMargin />
          </div>
        </div>

        <div className="mt-6 text-center space-y-1">
          <p className="text-xl md:text-3xl font-medium">{formatFecha(activeQR.fecha)}</p>
          <p className="text-sm md:text-lg text-muted-foreground">Generado a las {activeQR.hora}</p>
        </div>
      </div>
    );
  }

  const scanUrl = activeQR ? `${window.location.origin}/scan/${activeQR.uuidQR}` : '';

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>QR del Día</CardTitle>
          <CardDescription>Genera un código QR único para que los alumnos registren su asistencia de hoy.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-8">
          {errorMsg && (
            <div className="w-full mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium text-center">
              {errorMsg}
            </div>
          )}

          {isLoading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-r-transparent"></div>
            </div>
          ) : activeQR ? (
            <div className="text-center space-y-6 flex flex-col items-center">
              <div className="flex flex-col items-center gap-3">
                <div className={`bg-white p-4 rounded-xl shadow-sm inline-block border ${!activeQR.activo ? 'opacity-40 grayscale' : ''}`}>
                  <QRCodeSVG value={scanUrl} size={200} level="H" />
                </div>
                {activeQR.activo ? (
                  <a
                    href={scanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#0047cc] hover:underline font-semibold break-all max-w-[280px]"
                  >
                    {scanUrl}
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground line-through break-all max-w-[280px]">
                    {scanUrl}
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${activeQR.activo ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <p className="font-semibold text-lg">
                    QR {activeQR.activo ? 'Activo' : 'Inactivo'} para hoy
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">{formatFecha(activeQR.fecha)} - {activeQR.hora}</p>
                <Button 
                  variant={activeQR.activo ? "destructive" : "default"} 
                  size="sm" 
                  onClick={toggleActiveStatus}
                  disabled={isLoading}
                >
                  {activeQR.activo ? 'Desactivar QR' : 'Activar QR'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No hay un QR activo generado para hoy.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t p-6">
          {!hasQRForToday ? (
            <Button onClick={generateQR} disabled={isLoading}>
              Generar QR
            </Button>
          ) : (
            <div className="text-xs text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
              Límite diario alcanzado (1 QR por día)
            </div>
          )}
          {activeQR && activeQR.activo && (
            <Button onClick={toggleFullscreen} className="gap-2">
              <Maximize2 className="h-4 w-4" />
              Pantalla Completa
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
