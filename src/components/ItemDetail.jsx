import React from 'react';

const ItemDetail = ({ item, onMarkResolved, onBack }) => {
  if (!item) return null;

  return (
    <div className="container">
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '20px' }}>
        ← Back to Board
      </button>

      <div className="detail-container">
        <img src={item.image} alt={item.title} className="detail-image" />
        <div className="detail-info">
          <span className={`item-tag ${item.status === 'lost' ? 'tag-lost' : 'tag-found'}`}>
            {item.status}
          </span>
          <h2>{item.title}</h2>
          <p className="detail-description">{item.description}</p>

          <div className="detail-meta-grid">
            <div className="meta-item">
              <strong>Category</strong>
              {item.category}
            </div>
            <div className="meta-item">
              <strong>Date</strong>
              {item.date}
            </div>
            <div className="meta-item">
              <strong>Location</strong>
              {item.location}
            </div>
            <div className="meta-item">
              <strong>Posted By</strong>
              {item.poster}
            </div>
          </div>

          {item.status !== 'resolved' && (
            <button
              className="btn btn-primary"
              onClick={() => onMarkResolved(item.id)}
            >
              Mark as Claimed/Found
            </button>
          )}
          {item.status === 'resolved' && (
            <div style={{ color: 'green', fontWeight: 'bold', fontSize: '1.2rem' }}>
              This item found its way to the owner
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
