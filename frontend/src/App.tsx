import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Summaries from "./pages/Summaries";
import News from "./pages/News";
import Podcast from "./pages/Podcast";
import History from "./pages/History";
import Settings from "./pages/Settings";
import AppLayout from "./layouts/AppLayout";
import { useAuth } from "./context/useAuth";

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/app" replace /> : <Login />}
      />

      <Route
        path="/register"
        element={user ? <Navigate to="/app" replace /> : <Register />}
      />

      <Route
        path="/app"
        element={
          user ? <AppLayout /> : <Navigate to="/login" replace />
        }
      >
        <Route index element={<Home />} />
        <Route path="news" element={<News />} />
        <Route path="summaries" element={<Summaries />} />
        <Route path="podcast" element={<Podcast />} />
        <Route path="history" element={<History />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route
        path="/"
        element={<Navigate to={user ? "/app" : "/login"} replace />}
      />

      <Route
        path="*"
        element={<Navigate to={user ? "/app" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;