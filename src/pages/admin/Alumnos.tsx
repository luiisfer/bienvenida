import { useState, useEffect } from 'react';
import { databases, appwriteConfig } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function Alumnos() {
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAlumnos = async () => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.alumnos,
        [
          Query.orderDesc('fechaRegistro'),
          Query.limit(500)
        ]
      );
      setAlumnos(response.documents);
    } catch (error) {
      console.error('Error fetching alumnos', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumnos();
  }, []);

  const filteredAlumnos = alumnos.filter(a => 
    `${a.nombre} ${a.apellido}`.toLowerCase().includes(search.toLowerCase()) ||
    a.color.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Directorio de Alumnos</h2>
        <p className="text-muted-foreground">Todos los alumnos que se han registrado en el sistema.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar alumno..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="bg-muted px-4 py-2 rounded-full font-medium text-sm border">
          Total Registrados: {alumnos.length}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nombre Completo</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Color</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Fecha de Registro</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">UUID Permanente</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlumnos.map((alumno) => (
                  <tr key={alumno.$id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">
                      {alumno.nombre} {alumno.apellido}
                    </td>
                    <td className="p-4 align-middle">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                          ${alumno.color === 'Rojo' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                          ${alumno.color === 'Azul' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                          ${alumno.color === 'Verde' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                          ${alumno.color === 'Amarillo' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                          ${alumno.color === 'Naranja' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                        `}>
                          {alumno.color}
                        </span>
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {new Date(alumno.fechaRegistro).toLocaleDateString()}
                    </td>
                    <td className="p-4 align-middle text-muted-foreground font-mono text-xs">
                      {alumno.uuidAlumno}
                    </td>
                  </tr>
                ))}
                {!loading && filteredAlumnos.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      No hay alumnos registrados.
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
