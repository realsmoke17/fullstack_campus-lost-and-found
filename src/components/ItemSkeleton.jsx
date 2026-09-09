import React from 'react';

/**
 * ItemSkeleton provides an animated placeholder card shown while items are loading.
 * Mimics the layout of ItemCard for a smooth visual transition.
 */
const ItemSkeleton = () => {
  return (
    <div className="item-card skeleton-card" aria-hidden="true">
      <div className="skeleton-card__image skeleton-shimmer" />
      <div className="item-content">
        <div className="skeleton-card__tag skeleton-shimmer" />
        <div className="skeleton-card__title skeleton-shimmer" />
        <div className="skeleton-card__meta skeleton-shimmer" />
        <div className="skeleton-card__meta skeleton-shimmer" style={{ width: '60%' }} />
      </div>
    </div>
  );
};

export default ItemSkeleton;

