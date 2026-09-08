import React from 'react';

const ItemCard = ({ item, onClick }) => {
  return (
    <div className="item-card" onClick={() => onClick(item)}>
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
