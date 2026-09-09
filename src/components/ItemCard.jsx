import React from 'react';

const ItemCard = ({ item, onClick }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(item);
    }
  };

  return (
    <div 
      className="item-card" 
      onClick={() => onClick(item)}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`Item: ${item.title}, Status: ${item.status}`}
    >
      <img src={item.image} alt={item.title} className="item-image" />
      <div className="item-content">
        <span className={`item-tag ${item.status === 'lost' ? 'tag-lost' : 'tag-found'}`}>
          {item.status}
        </span>
        <div className="item-title">{item.title}</div>
        <div className="item-meta"> {item.location}</div>
        <div className="item-meta"> {item.date}</div>
      </div>
    </div>
  );
};

export default ItemCard;
