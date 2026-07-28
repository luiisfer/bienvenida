import { useState, useEffect } from 'react';
import { databases, realtime, appwriteConfig } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Users, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatFecha = (fechaStr: string) => {
  if (!fechaStr) return '';
  const parts = fechaStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return fechaStr;
};

const TEAMS = [
  { name: 'Rojo', textClass: 'text-red-600 dark:text-red-400', bgClass: 'bg-red-50 dark:bg-red-950/20', borderClass: 'border-red-100 dark:border-red-900/30', badgeClass: 'bg-red-500 text-white' },
  { name: 'Azul', textClass: 'text-blue-600 dark:text-blue-400', bgClass: 'bg-blue-50 dark:bg-blue-950/20', borderClass: 'border-blue-100 dark:border-blue-900/30', badgeClass: 'bg-blue-500 text-white' },
  { name: 'Verde', textClass: 'text-green-600 dark:text-green-400', bgClass: 'bg-green-50 dark:bg-green-950/20', borderClass: 'border-green-100 dark:border-green-900/30', badgeClass: 'bg-green-500 text-white' },
  { name: 'Amarillo', textClass: 'text-yellow-600 dark:text-yellow-400', bgClass: 'bg-yellow-50 dark:bg-yellow-950/20', borderClass: 'border-yellow-100 dark:border-yellow-900/30', badgeClass: 'bg-yellow-500 text-neutral-900' },
  { name: 'Naranja', textClass: 'text-orange-600 dark:text-orange-400', bgClass: 'bg-orange-50 dark:bg-orange-950/20', borderClass: 'border-orange-100 dark:border-orange-900/30', badgeClass: 'bg-orange-500 text-white' }
];

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

  const getFilteredAsistenciasByColor = (colorName: string) => {
    return asistencias.filter(a => 
      a.color === colorName &&
      (`${a.nombre} ${a.apellido}`.toLowerCase().includes(search.toLowerCase()))
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Asistencias de Hoy</h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Registro en tiempo real por cada color.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-primary/10 text-primary px-4 py-2 rounded-2xl font-bold text-sm border border-primary/20 self-start md:self-auto">
          <Users className="w-4 h-4" />
          <span>Total General: {asistencias.length}</span>
        </div>
      </div>

      <div className="relative max-w-md w-full">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por nombre..."
          className="pl-9 py-5 rounded-xl shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid de Tablas por Color */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {TEAMS.map((team) => {
          const teamAsistencias = getFilteredAsistenciasByColor(team.name);
          return (
            <Card key={team.name} className={`shadow-md border ${team.borderClass} ${team.bgClass} flex flex-col justify-between overflow-hidden`}>
              <div>
                <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-zinc-100/50 bg-white/50 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <Trophy className={`w-5 h-5 ${team.textClass}`} />
                    <CardTitle className={`text-lg font-bold ${team.textClass}`}>
                      Equipo {team.name}
                    </CardTitle>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${team.badgeClass} shadow-sm`}>
                    Asistencias: {teamAsistencias.length}
                  </span>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="w-full overflow-auto max-h-[300px]">
                    <table className="w-full text-sm">
                      <thead className="bg-white/30 sticky top-0 border-b border-zinc-100">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-zinc-500 text-xs uppercase tracking-wider">Nombre</th>
                          <th className="px-4 py-3 text-left font-semibold text-zinc-500 text-xs uppercase tracking-wider">Fecha</th>
                          <th className="px-4 py-3 text-left font-semibold text-zinc-500 text-xs uppercase tracking-wider">Hora</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100/50">
                        <AnimatePresence>
                          {teamAsistencias.map((asistencia) => (
                            <motion.tr
                              key={asistencia.$id}
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className="hover:bg-white/40 transition-colors"
                            >
                              <td className="px-4 py-3 font-semibold text-zinc-800">
                                {asistencia.nombre} {asistencia.apellido}
                              </td>
                              <td className="px-4 py-3 text-zinc-500 font-medium">
                                {formatFecha(asistencia.fecha)}
                              </td>
                              <td className="px-4 py-3 text-zinc-500 font-medium">
                                {asistencia.hora}
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                        {!loading && teamAsistencias.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-4 py-8 text-center text-zinc-400 text-xs italic">
                              Sin asistencias registradas
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
