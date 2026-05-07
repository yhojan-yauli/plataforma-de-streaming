import React, { useDeferredValue, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Grid, List, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import ContentCard from '@/components/ContentCard';
import { contentService } from '@/services/contentService';
import type { Content } from '@/types';

const genres = ['Todos', 'Acción', 'Comedia', 'Drama', 'Terror', 'Ciencia Ficción', 'Romance', 'Documental', 'Aventura'];
const years = ['Todos', ...Array.from({ length: 10 }, (_, index) => String(new Date().getFullYear() - index))];

const BrowsePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedGenre, setSelectedGenre] = useState('Todos');
  const [selectedYear, setSelectedYear] = useState('Todos');
  const [selectedType, setSelectedType] = useState<'MOVIE' | 'SERIES' | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [results, setResults] = useState<Content[]>([]);
  const [page, setPage] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    const nextQuery = searchParams.get('q') || '';
    const nextType = searchParams.get('type');

    setSearchQuery(nextQuery);
    setSelectedType(nextType === 'MOVIE' || nextType === 'SERIES' ? nextType : '');
    setPage(0);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    const loadBrowse = async () => {
      setLoading(true);

      try {
        const response = await contentService.browse({
          search: deferredSearchQuery.trim() || undefined,
          genre: selectedGenre !== 'Todos' ? selectedGenre : undefined,
          year: selectedYear !== 'Todos' ? Number(selectedYear) : undefined,
          type: selectedType || undefined,
          page,
          size: 24,
        });

        if (cancelled) return;

        setResults(response.data.content);
        setTotalResults(response.data.totalElements);
        setHasNext(response.data.hasNext);
        setHasPrevious(response.data.hasPrevious);
        setError(null);
      } catch {
        if (cancelled) return;

        setResults([]);
        setTotalResults(0);
        setHasNext(false);
        setHasPrevious(false);
        setError('No pudimos cargar resultados en este momento.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadBrowse();

    return () => {
      cancelled = true;
    };
  }, [deferredSearchQuery, page, selectedGenre, selectedType, selectedYear]);

  return (
    <div className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-[1400px]">
        <h1 className="mb-6 text-2xl font-bold text-foreground md:text-3xl">Explorar</h1>

        <div className="mb-8 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setPage(0);
              }}
              placeholder="Buscar por nombre..."
              className="w-full rounded-lg border border-border bg-secondary py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedType}
              onChange={(event) => {
                setSelectedType(event.target.value as 'MOVIE' | 'SERIES' | '');
                setPage(0);
              }}
              className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none"
            >
              <option value="">Todo</option>
              <option value="MOVIE">Películas</option>
              <option value="SERIES">Series</option>
            </select>
            <select
              value={selectedGenre}
              onChange={(event) => {
                setSelectedGenre(event.target.value);
                setPage(0);
              }}
              className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none"
            >
              {genres.map((genre) => <option key={genre}>{genre}</option>)}
            </select>
            <select
              value={selectedYear}
              onChange={(event) => {
                setSelectedYear(event.target.value);
                setPage(0);
              }}
              className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none"
            >
              {years.map((year) => <option key={year}>{year}</option>)}
            </select>
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-lg p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{totalResults} resultados</p>
          {(loading || hasNext || hasPrevious) && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 0))}
                disabled={!hasPrevious || loading}
                className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
              <span className="text-sm text-muted-foreground">Página {page + 1}</span>
              <button
                onClick={() => setPage((currentPage) => currentPage + 1)}
                disabled={!hasNext || loading}
                className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-foreground">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando catálogo...
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : 'space-y-3'}>
            {results.map((content) => (
              <ContentCard key={content.id} content={content} variant={viewMode === 'list' ? 'wide' : 'poster'} />
            ))}
          </div>
        )}

        {!loading && results.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            No se encontraron resultados
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
