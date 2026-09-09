import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Board from './components/Board';
import PostForm from './components/PostForm';
import ItemDetail from './components/ItemDetail';
import LoginForm from './components/LoginForm';
import VerificationScreen from './components/VerificationScreen';
import VerifyComplete from './components/VerifyComplete';
import MyItems from './components/MyItems';
import LandingPage from './components/LandingPage';
import NotFound from './components/NotFound';
import ItemSkeleton from './components/ItemSkeleton';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './context/AuthContext';
import { subscribeToItems, updateItemStatus } from './firebase/firestore';

/**
 * ProtectedRoute wrapper to handle authentication and verification guards.
 * Uses AuthContext instead of receiving user as a prop.
 */
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

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
const ItemDetailWrapper = ({ items, onMarkResolved }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = items.find(i => i.id === id);

  if (!item) {
    return <div className="container"><h2>Item not found</h2></div>;
  }

  return (
    <ItemDetail
      item={item}
      onMarkResolved={onMarkResolved}
      onBack={() => navigate('/board')}
    />
  );
};

function App() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = React.useState([]);
  const [itemsLoading, setItemsLoading] = React.useState(true);

  React.useEffect(() => {
    // Subscribe to real-time items
    const unsubscribeItems = subscribeToItems(
      (data) => {
        setItems(data);
        setItemsLoading(false);
      },
      (error) => {
        console.error("Failed to load real-time items:", error);
        setItemsLoading(false);
      }
    );

    return () => {
      unsubscribeItems();
    };
  }, []);

  const handleMarkResolved = async (itemId) => {
    try {
      await updateItemStatus(itemId, { status: 'resolved' });
    } catch (error) {
      alert("Failed to update item status. Please try again.");
    }
  };

  const loading = authLoading || itemsLoading;

  if (loading) {
    return (
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <div className="container">
              <header className="header">
                <h1 className="loading-title">Loading Campus Board...</h1>
              </header>
              <div className="item-grid">
                {[...Array(6)].map((_, i) => <ItemSkeleton key={i} />)}
              </div>
            </div>
          </main>
        </div>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <div className="app">
          <Navbar />

          <main className="main-content">
            <Routes>
              {/* Public Route: Landing Page */}
              <Route
                path="/"
                element={
                  user ? <Navigate to="/board" replace /> : <LandingPage />
                }
              />

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
                  user && !user.emailVerified ? <VerificationScreen /> : <Navigate to="/board" replace />
                }
              />

              {/* Public Route: Verification Success Handler */}
              <Route path="/verify-complete" element={<VerifyComplete />} />

              {/* Protected Routes: Require Auth and Verification */}
              <Route
                path="/board"
                element={
                  <ProtectedRoute>
                    <Board
                      items={items.filter(i => i.status !== 'resolved')}
                    />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/post"
                element={
                  <ProtectedRoute>
                    <PostForm />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-items"
                element={
                  <ProtectedRoute>
                    <MyItems />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/item/:id"
                element={
                  <ProtectedRoute>
                    <ItemDetailWrapper
                      items={items}
                      onMarkResolved={handleMarkResolved}
                    />
                  </ProtectedRoute>
                }
              />

              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
