import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ItemCard from './ItemCard';

const Board = ({ items }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ['All', 'Electronics', 'Keys', 'Bags', 'ID/Cards', 'Other'];

  const handleSelectItem = (item) => {
    navigate(`/item/${item.id}`);
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Lost & Found Board</h1>
        <p>Help your fellow students find their missing belongings </p>
      </header>

      <div className="filter-section">
        <input
          type="text"
          className="search-input"
          placeholder="Search for items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select
          className="select-input"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        <div className="toggle-group">
          <button
            className={`toggle-btn ${statusFilter === 'All' ? 'active' : ''}`}
            onClick={() => setStatusFilter('All')}
          >
            All
          </button>
          <button
            className={`toggle-btn ${statusFilter === 'lost' ? 'active' : ''}`}
            onClick={() => setStatusFilter('lost')}
          >
            Lost
          </button>
          <button
            className={`toggle-btn ${statusFilter === 'found' ? 'active' : ''}`}
            onClick={() => setStatusFilter('found')}
          >
            Found
          </button>
        </div>
      </div>

      <div className="item-grid">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <ItemCard key={item.id} item={item} onClick={handleSelectItem} />
          ))
        ) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
            No items found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Board;
