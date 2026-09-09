import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { subscribeToItems, updateItemStatus } from "../firebase/firestore";

/**
 * MyItems page shows only items posted by the current user.
 * Allows marking items as resolved directly from the list.
 */
const MyItems = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToItems(
      (allItems) => {
        const userItems = allItems.filter(
          (item) => item.postedByUid === user.uid
        );
        setMyItems(userItems);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching my items:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleResolve = async (itemId) => {
    try {
      await updateItemStatus(itemId, { status: "resolved" });
    } catch (error) {
      console.error("Failed to mark as resolved:", error);
    }
  };

  if (loading) {
    return (
      <div className="container my-items-container">
        <h1>My Items</h1>
        <p className="auth-page__subtitle">Loading your items...</p>
      </div>
    );
  }

  return (
    <div className="container my-items-container">
      <h1>My Items</h1>
      {myItems.length === 0 ? (
        <div className="my-items-empty">
          <div className="emoji-icon">📦</div>
          <p>You haven't posted any items yet.</p>
          <button className="btn btn-primary" onClick={() => navigate("/post")}>
            Post an Item
          </button>
        </div>
      ) : (
        <div className="item-grid">
          {myItems.map((item) => (
            <div
              key={item.id}
              className="item-card"
              onClick={() => navigate(`/item/${item.id}`)}
            >
              <img
                src={item.image}
                alt={item.title}
                className="item-image"
              />
              <div className="item-content">
                <span
                  className={`item-tag ${
                    item.status === "lost"
                      ? "tag-lost"
                      : item.status === "found"
                      ? "tag-found"
                      : "tag-resolved"
                  }`}
                >
                  {item.status}
                </span>
                <div className="item-title">{item.title}</div>
                <div className="item-meta">{item.location}</div>
                <div className="item-meta">{item.date}</div>
              </div>
              {item.status !== "resolved" && (
                <div className="my-items-card-actions">
                  <button
                    className="btn btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResolve(item.id);
                    }}
                  >
                    Mark as Resolved
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyItems;
