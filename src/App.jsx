import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Board from './components/Board';
import PostForm from './components/PostForm';
import ItemDetail from './components/ItemDetail';
import LoginForm from './components/LoginForm';
import { fetchItems, updateItemStatus } from './firebase/firestore';

function App() {
  const [screen, setScreen] = useState('board'); // 'board', 'post', 'detail', 'auth'
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    try {
      const data = await fetchItems();
      setItems(data);
    } catch (error) {
      console.error("Failed to load items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setScreen('detail');
  };

  const handlePostItem = async () => {
    // Instead of appending to local state, we re-fetch the list from Firestore
    // to ensure consistency and that it survives a refresh.
    await loadItems();
    setScreen('board');
  };

  const handleMarkResolved = async (itemId) => {
    try {
      await updateItemStatus(itemId, { status: 'resolved' });

      setItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, status: 'resolved' } : item
        )
      );

      setSelectedItem(prevItem =>
        prevItem && prevItem.id === itemId ? { ...prevItem, status: 'resolved' } : prevItem
      );
    } catch (error) {
      alert("Failed to update item status. Please try again.");
    }
  };

  const handleLogin = () => {
    setScreen('board');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'inherit' }}>
        <h2>Loading Campus Board...</h2>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar currentScreen={screen} setScreen={setScreen} />

      <main style={{ paddingBottom: '50px' }}>
        {screen === 'board' && (
          <Board
            items={items.filter(i => i.status !== 'resolved')}
            onSelectItem={handleSelectItem}
          />
        )}
        {screen === 'post' && (
          <PostForm
            onPostItem={handlePostItem}
            onBack={() => setScreen('board')}
          />
        )}
        {screen === 'detail' && (
          <ItemDetail
            item={selectedItem}
            onMarkResolved={handleMarkResolved}
            onBack={() => setScreen('board')}
          />
        )}
        {screen === 'auth' && (
          <LoginForm onLogin={handleLogin} />
        )}
      </main>
    </div>
  );
}

export default App;
