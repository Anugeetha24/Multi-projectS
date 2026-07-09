import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { api } from './utils/api';
import './App.css';

function App() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Authenticate user on page load/refresh
  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        console.log('[App] Auto-authenticating cached student token...');
        const currentStudent = await api.getMe();
        setStudent(currentStudent);
      } catch (err) {
        console.error('[App] Token expired or invalid session:', err.message);
        localStorage.removeItem('token');
        localStorage.removeItem('student');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  const handleAuthSuccess = (authenticatedStudent) => {
    setStudent(authenticatedStudent);
  };

  const handleLogout = () => {
    console.log('[App] Session ended by student.');
    localStorage.removeItem('token');
    localStorage.removeItem('student');
    setStudent(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b13] flex flex-col items-center justify-center text-slate-400">
        <svg className="animate-spin h-8 w-8 text-indigo-500 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs tracking-wider uppercase font-semibold">Validating session token...</span>
      </div>
    );
  }

  return (
    <>
      {student ? (
        <Dashboard student={student} onLogout={handleLogout} />
      ) : (
        <Login onAuthSuccess={handleAuthSuccess} />
      )}
    </>
  );
}

export default App;
