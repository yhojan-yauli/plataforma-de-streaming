import React from 'react';

interface SkeletonCardProps {
  count?: number;
  variant?: 'poster' | 'banner' | 'row';
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ count = 6, variant = 'poster' }) => {
  if (variant === 'banner') {
    return <div className="skeleton-pulse h-[70vh] w-full rounded-none" />;
  }

  if (variant === 'row') {
    return (
      <div className="space-y-4 px-4 md:px-8">
        <div className="skeleton-pulse h-6 w-40" />
        <div className="flex gap-2">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="skeleton-pulse h-[300px] w-[200px] flex-shrink-0 rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-pulse h-[300px] w-[200px] flex-shrink-0 rounded-md" />
      ))}
    </div>
  );
};

export default SkeletonCard;
