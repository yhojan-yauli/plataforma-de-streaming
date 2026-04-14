import React from 'react';
import { useContentStore } from '@/store';
import ContentCard from '@/components/ContentCard';

const MyListPage: React.FC = () => {
  const { myList } = useContentStore();

  return (
    <div className="min-h-screen px-4 py-12 md:px-8">
      <div className="mx-auto max-w-[1400px]">
        <h1 className="mb-8 text-2xl font-bold text-foreground md:text-3xl">Mi Lista</h1>
        {myList.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">Tu lista está vacía</p>
            <p className="mt-2 text-sm text-muted-foreground">Agrega películas y series desde el catálogo</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {myList.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListPage;
