import React from 'react';

const ItemDetail = ({ item, currentUser, onMarkResolved, onBack }) => {
  if (!item) return null;

  const isOriginalPoster = currentUser && item.postedByUid === currentUser.uid;
  const isVerified = currentUser && currentUser.emailVerified;

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
              {item.postedByStudentNumber || item.poster || 'Unknown Student'}
            </div>
          </div>

          {item.status !== 'resolved' && (
            <>
              {isOriginalPoster && isVerified ? (
                <button
                  className="btn btn-primary"
                  onClick={() => onMarkResolved(item.id)}
                >
                  Mark as Claimed/Found
                </button>
              ) : (
                <div style={{
                  marginTop: '20px',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '5px',
                  fontSize: '0.9rem',
                  color: '#7f8c8d',
                  border: '1px solid #dee2e6'
                }}>
                  {!currentUser ? (
                    "Please log in to manage this item."
                  ) : !isVerified ? (
                    "Please verify your account email to mark items as claimed."
                  ) : (
                    "Only the original poster can mark this item as claimed."
                  )}
                </div>
              )}
            </>
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
