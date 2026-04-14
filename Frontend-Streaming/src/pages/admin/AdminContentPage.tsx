import React, { useEffect, useState } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight, Search, X } from "lucide-react";
import { toast } from "sonner";
import { adminService } from "@/services/adminService";
import type { Content } from "@/types";

const AdminContentPage: React.FC = () => {
  const [contents, setContents] = useState<Content[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "MOVIE" as "MOVIE" | "SERIES",
    year: "",
    duration: "",
    posterUrl: "",
    videoUrl: "",
    genre: "",
  });

  // 🔹 FETCH
  const fetchContents = async () => {
    try {
      setLoading(true);
      const data = await adminService.getContents(0, 20, search);

      const fixed = data.content.map((c: any) => ({
        ...c,
        genre: typeof c.genre === "string" ? JSON.parse(c.genre) : c.genre,
      }));

      setContents(fixed);
    } catch {
      toast.error("Error al cargar contenido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [search]);

  // 🔹 CREATE
  const handleCreate = async () => {
    try {
      await adminService.createContent({
        title: form.title,
        description: form.description,
        type: form.type,
        year: Number(form.year),
        duration: Number(form.duration),
        posterUrl: form.posterUrl,
        videoUrl: form.videoUrl,

        // 🔥 SOLUCIÓN FINAL
        genre: JSON.stringify(
          form.genre ? form.genre.split(",").map((g) => g.trim()) : ["General"],
        ),
      });

      toast.success("Contenido creado");
      setShowModal(false);

      setForm({
        title: "",
        description: "",
        type: "MOVIE",
        year: "",
        duration: "",
        posterUrl: "",
        videoUrl: "",
        genre: "",
      });

      fetchContents();
    } catch (error) {
      console.log(error);
      toast.error("Error al crear contenido");
    }
  };

  // 🔹 DELETE
  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteContent(id);
      toast.success("Contenido eliminado");
      fetchContents();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  // 🔹 TOGGLE
  const toggleActive = async (content: Content) => {
    try {
      await adminService.toggleContentActive(content.id, !content.active);
      toast.success("Estado actualizado");
      fetchContents();
    } catch {
      toast.error("Error al actualizar");
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Contenido</h1>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white font-bold"
        >
          <Plus className="h-4 w-4" /> Nuevo
        </button>
      </div>

      {/* 🔥 MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-in">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">
                Nuevo Contenido
              </h3>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 hover:bg-secondary transition"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* FORM */}
            <div className="grid gap-4 md:grid-cols-2">
              <input
                placeholder="Título"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
              />

              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value as "MOVIE" | "SERIES",
                  })
                }
                className="rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
              >
                <option value="MOVIE">Película</option>
                <option value="SERIES">Serie</option>
              </select>

              <input
                type="number"
                placeholder="Año"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
              />

              <input
                type="number"
                placeholder="Duración (min)"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
              />

              <input
                placeholder="Poster URL"
                value={form.posterUrl}
                onChange={(e) =>
                  setForm({ ...form, posterUrl: e.target.value })
                }
                className="rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
              />

              <input
                placeholder="Video URL"
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                className="rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
              />

              <input
                placeholder="Géneros (Acción, Drama, etc)"
                value={form.genre}
                onChange={(e) => setForm({ ...form, genre: e.target.value })}
                className="rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition md:col-span-2"
              />

              <textarea
                placeholder="Descripción"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                className="rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition md:col-span-2"
              />
            </div>

            {/* ACTIONS */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg bg-secondary px-4 py-2 text-sm text-foreground hover:bg-accent transition"
              >
                Cancelar
              </button>

              <button
                onClick={handleCreate}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH */}
      <div className="mb-6 flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar contenido..."
            className="w-full rounded-lg border border-border bg-secondary py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
          />
        </div>
      </div>

      {/* GRID */}
      {loading ? (
        <p className="text-center">Cargando...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contents.map((content) => (
            <div key={content.id} className="rounded-xl border bg-card">
              <img
                src={content.posterUrl}
                className="h-40 w-full object-cover"
              />

              <div className="p-4">
                <h3 className="font-bold">{content.title}</h3>

                <p className="text-sm text-muted-foreground">
                  {content.type} · {content.year}
                </p>

                <div className="mt-3 flex gap-2">
                  <button onClick={() => toggleActive(content)}>
                    {content.active ? <ToggleRight /> : <ToggleLeft />}
                  </button>

                  <button onClick={() => handleDelete(content.id)}>
                    <Trash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminContentPage;
