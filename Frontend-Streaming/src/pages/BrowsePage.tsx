import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Grid, List } from 'lucide-react';
import ContentCard from '@/components/ContentCard';
import type { Content } from '@/types';

const genres = ['Todos', 'Acción', 'Comedia', 'Drama', 'Terror', 'Ciencia Ficción', 'Romance', 'Documental'];
const years = ['Todos', '2024', '2023', '2022', '2021', '2020'];

const mockResults: Content[] = Array.from({ length: 20 }, (_, i) => ({
  id: `browse-${i}`,
  title: `Título ${i + 1}`,
  description: 'Descripción del contenido.',
  type: i % 3 === 0 ? 'SERIES' : 'MOVIE',
  genre: [genres[1 + (i % (genres.length - 1))]],
  year: 2020 + (i % 5),
  duration: 90 + (i * 5) % 60,
  rating: 3 + (i % 20) / 10,
  posterUrl: `https://picsum.photos/seed/browse-${i}/400/600`,
  bannerUrl: '',
  videoUrl: '',
  active: true,
  views: i * 1000,
  createdAt: new Date().toISOString(),
}));

const BrowsePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedGenre, setSelectedGenre] = useState('Todos');
  const [selectedYear, setSelectedYear] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = mockResults.filter((c) => {
    if (selectedGenre !== 'Todos' && !c.genre.includes(selectedGenre)) return false;
    if (selectedYear !== 'Todos' && c.year !== parseInt(selectedYear)) return false;
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-[1400px]">
        <h1 className="mb-6 text-2xl font-bold text-foreground md:text-3xl">Explorar</h1>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full rounded-lg border border-border bg-secondary py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none"
            >
              {genres.map((g) => <option key={g}>{g}</option>)}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none"
            >
              {years.map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setViewMode('grid')} className={`rounded-lg p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <Grid className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`rounded-lg p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Results */}
        <p className="mb-4 text-sm text-muted-foreground">{filtered.length} resultados</p>
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : 'space-y-3'}>
          {filtered.map((content) => (
            <ContentCard key={content.id} content={content} variant={viewMode === 'list' ? 'wide' : 'poster'} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            No se encontraron resultados
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
