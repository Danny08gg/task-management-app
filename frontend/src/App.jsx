import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './lib/pages/Login';
import Dashboard from './lib/pages/Dashboard';
import Tasks from './lib/pages/Task';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;