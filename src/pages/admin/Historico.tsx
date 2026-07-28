import { useState, useEffect } from 'react';
import { databases, appwriteConfig } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Card } from '@/components/ui/card';
import { Calendar, ChevronDown, ChevronUp, Users, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatFechaLarga = (fechaStr: string) => {
  if (!fechaStr) return '';
  const parts = fechaStr.split('-');
  if (parts.length !== 3) return fechaStr;
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const formatted = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const TEAMS = [
  { name: 'Rojo', textClass: 'text-red-600 dark:text-red-400', bgClass: 'bg-red-50 dark:bg-red-950/20', borderClass: 'border-red-100 dark:border-red-900/30', badgeClass: 'bg-red-500 text-white' },
  { name: 'Azul', textClass: 'text-blue-600 dark:text-blue-400', bgClass: 'bg-blue-50 dark:bg-blue-950/20', borderClass: 'border-blue-100 dark:border-blue-900/30', badgeClass: 'bg-blue-500 text-white' },
  { name: 'Verde', textClass: 'text-green-600 dark:text-green-400', bgClass: 'bg-green-50 dark:bg-green-950/20', borderClass: 'border-green-100 dark:border-green-900/30', badgeClass: 'bg-green-500 text-white' },
  { name: 'Amarillo', textClass: 'text-yellow-600 dark:text-yellow-400', bgClass: 'bg-yellow-50 dark:bg-yellow-950/20', borderClass: 'border-yellow-100 dark:border-yellow-900/30', badgeClass: 'bg-yellow-500 text-neutral-900' },
  { name: 'Naranja', textClass: 'text-orange-600 dark:text-orange-400', bgClass: 'bg-orange-50 dark:bg-orange-950/20', borderClass: 'border-orange-100 dark:border-orange-900/30', badgeClass: 'bg-orange-500 text-white' }
];

interface DiaHistorico {
  fecha: string;
  total: number;
  colores: Record<string, number>;
  alumnos: any[];
}

export default function Historico() {
  const [historico, setHistorico] = useState<DiaHistorico[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const fetchHistorico = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.asistencias,
        [
          Query.limit(5000),
          Query.orderDesc('timestamp')
        ]
      );

      // Agrupar por fecha
      const grouped = response.documents.reduce((acc: Record<string, DiaHistorico>, curr: any) => {
        const date = curr.fecha;
        if (!acc[date]) {
          acc[date] = {
            fecha: date,
            total: 0,
            colores: { Rojo: 0, Azul: 0, Verde: 0, Amarillo: 0, Naranja: 0 },
            alumnos: []
          };
        }
        acc[date].total += 1;
        if (acc[date].colores[curr.color] !== undefined) {
          acc[date].colores[curr.color] += 1;
        }
        acc[date].alumnos.push(curr);
        return acc;
      }, {});

      // Convertir a lista y ordenar por fecha descendente
      const sorted = Object.values(grouped).sort((a, b) => b.fecha.localeCompare(a.fecha));
      setHistorico(sorted);
    } catch (error) {
      console.error('Error fetching historico', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorico();
  }, []);

  const toggleExpand = (fecha: string) => {
    setExpandedDate(expandedDate === fecha ? null : fecha);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Histórico de Asistencias</h2>
        <p className="text-muted-foreground text-sm md:text-base">
          Consulta los días anteriores y el desglose de asistencias por cada equipo.
        </p>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-r-transparent"></div>
        </div>
      ) : historico.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No hay registros históricos en el sistema.
        </Card>
      ) : (
        <div className="space-y-4">
          {historico.map((dia) => {
            const isExpanded = expandedDate === dia.fecha;
            return (
              <Card key={dia.fecha} className="shadow-sm border border-zinc-100 overflow-hidden">
                {/* Accordion Header */}
                <div
                  onClick={() => toggleExpand(dia.fecha)}
                  className="flex flex-col md:flex-row md:items-center justify-between p-5 cursor-pointer bg-white hover:bg-zinc-50/50 transition-colors gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-800 text-sm md:text-base leading-tight">
                        {formatFechaLarga(dia.fecha)}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {dia.fecha}
                      </p>
                    </div>
                  </div>

                  {/* Resumen por color y total */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex flex-wrap items-center gap-1.5 border-r border-zinc-100 pr-4">
                      {TEAMS.map((team) => {
                        const count = dia.colores[team.name] || 0;
                        return (
                          <span
                            key={team.name}
                            className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold ${team.badgeClass}`}
                          >
                            {team.name[0]}: {count}
                          </span>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 bg-zinc-100 px-3 py-1.5 rounded-xl">
                      <Users className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Total: {dia.total}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-zinc-400 hidden md:block" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-zinc-400 hidden md:block" />
                    )}
                  </div>
                </div>

                {/* Accordion Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-zinc-100 bg-zinc-50/50"
                    >
                      <div className="p-5 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {TEAMS.map((team) => {
                          const alumnosTeam = dia.alumnos.filter(a => a.color === team.name);
                          return (
                            <Card key={team.name} className={`shadow-sm border ${team.borderClass} ${team.bgClass} flex flex-col justify-between overflow-hidden`}>
                              <div className="p-3 bg-white/70 border-b border-zinc-100 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <Trophy className={`w-4 h-4 ${team.textClass}`} />
                                  <span className={`text-xs font-bold ${team.textClass}`}>
                                    Equipo {team.name}
                                  </span>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${team.badgeClass}`}>
                                  {alumnosTeam.length}
                                </span>
                              </div>
                              <div className="p-0 max-h-[200px] overflow-auto">
                                <table className="w-full text-xs">
                                  <tbody className="divide-y divide-zinc-100/30">
                                    {alumnosTeam.map((al) => (
                                      <tr key={al.$id} className="hover:bg-white/20 transition-colors">
                                        <td className="px-3 py-2 font-semibold text-zinc-700">
                                          {al.nombre} {al.apellido}
                                        </td>
                                        <td className="px-3 py-2 text-right text-zinc-400">
                                          {al.hora}
                                        </td>
                                      </tr>
                                    ))}
                                    {alumnosTeam.length === 0 && (
                                      <tr>
                                        <td className="px-3 py-4 text-center text-zinc-400 text-[10px] italic">
                                          Sin asistencias
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
