import React, { useEffect, useState } from 'react';
import { Search, UserCheck, UserX, Eye } from 'lucide-react';
import { getApiErrorMessage } from '@/lib/api-error';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  active: boolean;
  createdAt: string;
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // 🔹 Cargar usuarios desde backend
 const fetchUsers = async () => {
  try {
    setLoading(true);

    const res = await adminService.getUsers(page, 10, search);

    setUsers(res.content);
    setTotalPages(res.totalPages);

  } catch (error) {
    toast.error(getApiErrorMessage(error, 'Error al cargar usuarios'));
  } finally {
    setLoading(false);
  }
};

  // 🔹 Ejecutar cuando cambia página o búsqueda
  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  // 🔹 Búsqueda (backend)
  const handleSearch = (value: string) => {
  setSearch(value);
  setPage(0); // reinicia página
};

  // 🔹 Toggle activo/inactivo
  const toggleActive = async (userId: string) => {
  try {
    await adminService.toggleUserActive(userId);

    //  ACTUALIZACIÓN OPTIMISTA (INSTANTÁNEA)
    setUsers(prev =>
      prev.map(u =>
        u.id === userId ? { ...u, active: !u.active } : u
      )
    );

    toast.success('Estado actualizado');

  } catch (error) {
    toast.error(getApiErrorMessage(error, 'Error al actualizar'));
  }
};
  return (
    <div>
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar..."
            className="rounded-lg border border-border bg-secondary py-2 pl-9 pr-4 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full">
          <thead className="bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Rol</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Registro</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-6">
                  Cargando...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6">
                  No hay usuarios
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-t border-border hover:bg-secondary/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.role === 'ADMIN'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-secondary text-muted-foreground'
                    }`}>
                      {user.role}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.active
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        user.active ? 'bg-green-400' : 'bg-destructive'
                      }`} />
                      {user.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(user.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        {user.active ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </button>

                      <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      <div className="mt-4 flex justify-between items-center">
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 bg-secondary rounded disabled:opacity-50"
        >
          Anterior
        </button>

        <span className="text-sm">
          Página {page + 1} de {totalPages}
        </span>

        <button
          disabled={page + 1 >= totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 bg-secondary rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default AdminUsersPage;
