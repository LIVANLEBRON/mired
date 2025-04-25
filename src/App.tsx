import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'; // Import Link
import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import UserProfile from './components/Profile/UserProfile'; // Import UserProfile
import EditProfile from './components/Profile/EditProfile'; // Import EditProfile
import CreatePost from './components/Posts/CreatePost'; // Import CreatePost
import PostList from './components/Posts/PostList'; // Import PostList
import UserSearch from './components/Users/UserSearch'; // Import UserSearch

// Placeholder for a protected component
const HomePage: React.FC = () => {
  const auth = getAuth();
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl">Página Principal (Protegida)</h1>
      <p>Bienvenido, usuario autenticado.</p>
      <Link to="/profile" className="text-indigo-600 hover:text-indigo-800 mr-4">Mi Perfil</Link> {/* Changed link text */}
      <Link to="/search-users" className="text-indigo-600 hover:text-indigo-800 mr-4">Buscar Usuarios</Link> {/* Add link to user search */}
      <div className="mt-6">
        <CreatePost /> {/* Add CreatePost component */}
        <PostList /> {/* Add PostList component */}
      </div>
      <button 
        onClick={handleLogout}
        className="mt-4 px-4 py-2 font-medium text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Cerrar Sesión
      </button>
    </div>
  );
};

// Protected Route Component
interface ProtectedRouteProps {
  user: User | null;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  if (loading) {
    // Optional: Add a loading spinner or message
    return <div>Cargando...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
        <Route 
          path="/"
          element={
            <ProtectedRoute user={user}>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/profile" // Route for the current user's profile
          element={
            <ProtectedRoute user={user}>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/profile/:userId" // Route for viewing other users' profiles
          element={
            <ProtectedRoute user={user}>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/edit-profile"
          element={
            <ProtectedRoute user={user}>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/search-users"
          element={
            <ProtectedRoute user={user}>
              <UserSearch />
            </ProtectedRoute>
          }
        />
        {/* Add other protected/public routes here */}
      </Routes>
    </Router>
  );
}

export default App;
