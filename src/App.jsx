import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Board from './components/Board';
import PostForm from './components/PostForm';
import ItemDetail from './components/ItemDetail';
import LoginForm from './components/LoginForm';
import VerificationScreen from './components/VerificationScreen';
import { subscribeToItems, updateItemStatus, getUserProfile } from './firebase/firestore';
import { onAuthStateChange, initAuthPersistence } from './firebase/auth';

/**
 * ProtectedRoute wrapper to handle authentication and verification guards.
 */
const ProtectedRoute = ({ children, user }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!user.emailVerified) {
    return <Navigate to="/verify" replace />;
  }
  return children;
};

/**
 * Helper component to resolve item from ID for the Detail view.
 */
const ItemDetailWrapper = ({ items, currentUser, onMarkResolved }) => {
  const { id } = useParams();
  const item = items.find(i => i.id === id);

  if (!item) {
    return <div className="container"><h2>Item not found</h2></div>;
  }

  return (
    <ItemDetail
      item={item}
      currentUser={currentUser}
      onMarkResolved={onMarkResolved}
      onBack={() => {}} // Navbar handles navigation
    />
  );
};

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // 1. Initialize session-only persistence
    initAuthPersistence();

    // 2. Subscribe to real-time items
    const unsubscribeItems = subscribeToItems(
      (data) => {
        setItems(data);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load real-time items:", error);
        setLoading(false);
      }
    );

    // 3. Track authentication state
    const unsubscribeAuth = onAuthStateChange(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const profile = await getUserProfile(currentUser.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error("Error loading user profile:", error);
        }
      } else {
        setUserProfile(null);
      }
    });

    return () => {
      unsubscribeItems();
      unsubscribeAuth();
    };
  }, []);

  const handleMarkResolved = async (itemId) => {
    try {
      await updateItemStatus(itemId, { status: 'resolved' });
    } catch (error) {
      alert("Failed to update item status. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'inherit' }}>
        <h2>Loading Campus Board...</h2>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />

        <main style={{ paddingBottom: '50px' }}>
          <Routes>
            {/* Public Route: Login/Signup */}
            <Route
              path="/login"
              element={
                !user ? <LoginForm /> : <Navigate to="/board" replace />
              }
            />

            {/* Public Route: Verification Warning */}
            <Route
              path="/verify"
              element={
                user && !user.emailVerified ? <VerificationScreen user={user} /> : <Navigate to="/board" replace />
              }
            />

            {/* Protected Routes: Require Auth and Verification */}
            <Route
              path="/board"
              element={
                <ProtectedRoute user={user}>
                  <Board
                    items={items.filter(i => i.status !== 'resolved')}
                    onSelectItem={() => {}} // handled by routing now
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/post"
              element={
                <ProtectedRoute user={user}>
                  <PostForm
                    user={user}
                    userProfile={userProfile}
                    onPostItem={() => {}} // handled by routing now
                    onBack={() => {}} // handled by routing now
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/item/:id"
              element={
                <ProtectedRoute user={user}>
                  <ItemDetailWrapper
                    items={items}
                    currentUser={user}
                    onMarkResolved={handleMarkResolved}
                  />
                </ProtectedRoute>
              }
            />

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/board" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
