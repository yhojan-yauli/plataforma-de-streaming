import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ContentCard from './ContentCard';
import type { Content } from '@/types';

interface ContentRowProps {
  title: string;
  contents: Content[];
}

const ContentRow: React.FC<ContentRowProps> = ({ title, contents }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = direction === 'left' ? -600 : 600;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeft(scrollLeft > 0);
    setShowRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  if (!contents.length) return null;

  return (
    <div className="group/row relative py-4">
      <h2 className="mb-3 px-4 text-lg font-bold text-foreground md:px-8 md:text-xl">{title}</h2>
      <div className="relative">
        {showLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 z-10 flex h-full w-12 items-center justify-center bg-gradient-to-r from-background/90 to-transparent opacity-0 transition-opacity group-hover/row:opacity-100"
          >
            <ChevronLeft className="h-8 w-8 text-foreground" />
          </button>
        )}
        <div ref={scrollRef} onScroll={handleScroll} className="content-row px-4 md:px-8">
          {contents.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
        {showRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 z-10 flex h-full w-12 items-center justify-center bg-gradient-to-l from-background/90 to-transparent opacity-0 transition-opacity group-hover/row:opacity-100"
          >
            <ChevronRight className="h-8 w-8 text-foreground" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ContentRow;
