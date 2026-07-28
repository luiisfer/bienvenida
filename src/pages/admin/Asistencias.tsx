import { useState, useEffect } from 'react';
import { databases, realtime, appwriteConfig } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatFecha = (fechaStr: string) => {
  if (!fechaStr) return '';
  const parts = fechaStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return fechaStr;
};

export default function Asistencias() {
  const [asistencias, setAsistencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAsistencias = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.asistencias,
        [
          Query.equal('fecha', today),
          Query.orderDesc('timestamp'),
          Query.limit(100)
        ]
      );
      setAsistencias(response.documents);
    } catch (error) {
      console.error('Error fetching asistencias', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsistencias();

    // Subscribe to realtime updates
    const channel = `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.collections.asistencias}.documents`;
    const unsubscribe = realtime.subscribe(channel, (response) => {
      // Check if it's a create event
      if (response.events.includes('databases.*.collections.*.documents.*.create')) {
        const newDoc: any = response.payload;
        const today = new Date().toISOString().split('T')[0];
        if (newDoc.fecha === today) {
          setAsistencias((prev) => [newDoc, ...prev]);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const filteredAsistencias = asistencias.filter(a => 
    `${a.nombre} ${a.apellido}`.toLowerCase().includes(search.toLowerCase()) ||
    a.color.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Asistencias de Hoy</h2>
        <p className="text-muted-foreground">Registro en tiempo real de los alumnos que han escaneado el QR.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre o color..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-full font-medium text-sm border border-primary/20">
          Total: {asistencias.length}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Alumno</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Color</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Fecha</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Hora</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">UUID</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredAsistencias.map((asistencia) => (
                    <motion.tr 
                      key={asistencia.$id}
                      initial={{ opacity: 0, y: -10, backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
                      animate={{ opacity: 1, y: 0, backgroundColor: 'transparent' }}
                      transition={{ duration: 0.5 }}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <td className="p-4 align-middle font-medium">
                        {asistencia.nombre} {asistencia.apellido}
                      </td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                          ${asistencia.color === 'Rojo' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                          ${asistencia.color === 'Azul' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                          ${asistencia.color === 'Verde' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                          ${asistencia.color === 'Amarillo' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                          ${asistencia.color === 'Naranja' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                        `}>
                          {asistencia.color}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">{formatFecha(asistencia.fecha)}</td>
                      <td className="p-4 align-middle text-muted-foreground">{asistencia.hora}</td>
                      <td className="p-4 align-middle text-muted-foreground font-mono text-xs truncate max-w-[150px]" title={asistencia.uuidAlumno}>
                        {asistencia.uuidAlumno.split('-')[0]}...
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {!loading && filteredAsistencias.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No hay asistencias registradas aún.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-r-transparent"></div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
