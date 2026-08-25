import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import AppLayout from './components/AppLayout.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Feed from './pages/Feed.jsx';
import Explore from './pages/Explore.jsx';
import Messages from './pages/Messages.jsx';
import Profile from './pages/Profile.jsx';
import RecipeDetail from './pages/RecipeDetail.jsx';
import NewRecipe from './pages/NewRecipe.jsx';
import EditRecipe from './pages/EditRecipe.jsx';
import Settings from './pages/Settings.jsx';
import SavedRecipes from './pages/SavedRecipes.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-100">
        <span className="text-sm font-semibold text-stone-500">Memuat…</span>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/feed" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <GuestOnly>
            <Login />
          </GuestOnly>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnly>
            <Register />
          </GuestOnly>
        }
      />
      <Route
        path="/feed"
        element={
          <Protected>
            <AppLayout>
              <Feed />
            </AppLayout>
          </Protected>
        }
      />
      <Route
        path="/explore"
        element={
          <Protected>
            <AppLayout>
              <Explore />
            </AppLayout>
          </Protected>
        }
      />
      <Route
        path="/messages"
        element={
          <Protected>
            <AppLayout>
              <Messages />
            </AppLayout>
          </Protected>
        }
      />
      <Route
        path="/profile"
        element={
          <Protected>
            <AppLayout>
              <Profile />
            </AppLayout>
          </Protected>
        }
      />
      <Route
        path="/recipes/new"
        element={
          <Protected>
            <AppLayout>
              <NewRecipe />
            </AppLayout>
          </Protected>
        }
      />
      <Route
        path="/recipes/:id/edit"
        element={
          <Protected>
            <AppLayout>
              <EditRecipe />
            </AppLayout>
          </Protected>
        }
      />
      <Route
        path="/settings"
        element={
          <Protected>
            <AppLayout>
              <Settings />
            </AppLayout>
          </Protected>
        }
      />
      <Route
        path="/saved"
        element={
          <Protected>
            <AppLayout>
              <SavedRecipes />
            </AppLayout>
          </Protected>
        }
      />
      <Route
        path="/u/:id"
        element={
          <AppLayout>
            <Profile />
          </AppLayout>
        }
      />
      <Route
        path="/recipes/:id"
        element={
          <AppLayout>
            <RecipeDetail />
          </AppLayout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
