import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Board from './components/Board';
import PostForm from './components/PostForm';
import ItemDetail from './components/ItemDetail';
import LoginForm from './components/LoginForm';
import { subscribeToItems, updateItemStatus } from './firebase/firestore';

function App() {
  const [screen, setScreen] = useState('board'); // 'board', 'post', 'detail', 'auth'
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToItems(
      (data) => {
        setItems(data);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load real-time items:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setScreen('detail');
  };

  const handlePostItem = async () => {
    // Real-time listener automatically handles updating the list
    setScreen('board');
  };

  const handleMarkResolved = async (itemId) => {
    try {
      await updateItemStatus(itemId, { status: 'resolved' });

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
