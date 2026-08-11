import { useState, useEffect } from 'react';
import { databases, appwriteConfig } from '@/lib/appwrite';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, QrCode, UserCheck, Palette } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Query } from 'appwrite';
import { getLocalDateString } from '@/lib/utils';

export default function Dashboard() {
  const [stats, setStats] = useState({
    alumnos: 0,
    asistenciasHoy: 0,
    qrActivos: 0,
    colores: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const today = getLocalDateString();

        // Fetch total alumnos
        const alumnosRes = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.collections.alumnos,
          [Query.limit(500)]
        );

        // Fetch asistencias hoy
        const asistenciasRes = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.collections.asistencias,
          [Query.equal('fecha', today), Query.limit(500)]
        );

        // Fetch QR activos hoy
        const qrsRes = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.collections.qrDias,
          [Query.equal('fecha', today), Query.equal('activo', true)]
        );

        // Calcular distribución de colores en asistencias de hoy
        const colorCount: Record<string, number> = {
          'Rojo': 0, 'Azul': 0, 'Verde': 0, 'Amarillo': 0, 'Naranja': 0
        };
        asistenciasRes.documents.forEach(a => {
          if (colorCount[a.color] !== undefined) {
            colorCount[a.color]++;
          }
        });

        const colorData = [
          { name: 'Rojo', cantidad: colorCount['Rojo'], fill: '#ef4444' },
          { name: 'Azul', cantidad: colorCount['Azul'], fill: '#3b82f6' },
          { name: 'Verde', cantidad: colorCount['Verde'], fill: '#22c55e' },
          { name: 'Amarillo', cantidad: colorCount['Amarillo'], fill: '#eab308' },
          { name: 'Naranja', cantidad: colorCount['Naranja'], fill: '#f97316' },
        ];

        setStats({
          alumnos: alumnosRes.total,
          asistenciasHoy: asistenciasRes.total,
          qrActivos: qrsRes.total,
          colores: colorData
        });
      } catch (error) {
        console.error('Error fetching stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Resumen de la actividad del sistema.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alumnos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.alumnos}</div>
            <p className="text-xs text-muted-foreground">Registrados en la plataforma</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistencias Hoy</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.asistenciasHoy}</div>
            <p className="text-xs text-muted-foreground">Alumnos presentes hoy</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QR Activo</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.qrActivos}</div>
            <p className="text-xs text-muted-foreground">Para el día de hoy</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipos (Colores)</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Colores estándar</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Asistencias por Equipo (Hoy)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.colores}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} allowDecimals={false} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="cantidad" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
