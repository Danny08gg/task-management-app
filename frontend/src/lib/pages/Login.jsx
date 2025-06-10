import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import pb from '../../lib/pocketbase';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await pb.collection('users').authWithPassword(email, password);
      navigate('/dashboard');
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="p-6 bg-white rounded shadow-md">
        <h2 className="text-2xl mb-4">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
          Login
        </button>
        {pb.authStore.isValid && (
          <Link to="/dashboard" className="block mt-4 text-blue-500">
            Go to Dashboard
          </Link>
        )}
      </form>
    </div>
  );
}

export default Login;