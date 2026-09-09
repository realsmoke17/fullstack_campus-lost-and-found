import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ItemDetail = ({ item, onMarkResolved, onBack }) => {
  const { user: currentUser } = useAuth();
  const [resolving, setResolving] = useState(false);

  if (!item) return null;

  const isOriginalPoster = currentUser && item.postedByUid === currentUser.uid;
  const isVerified = currentUser && currentUser.emailVerified;

  const handleMarkResolved = async () => {
    setResolving(true);
    try {
      await onMarkResolved(item.id);
    } finally {
      setResolving(false);
    }
  };

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
              {item.postedByStudentNumber || 'Unknown Student'}
            </div>
          </div>

          {item.status !== 'resolved' && (
            <>
              {isOriginalPoster && isVerified ? (
                <button
                  className="btn btn-primary"
                  onClick={handleMarkResolved}
                  disabled={resolving}
                >
                  {resolving ? 'Marking...' : 'Mark as Claimed/Found'}
                </button>
              ) : (
                <div className="info-box">
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
            <div className="resolved-badge">
              This item found its way to the owner
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
