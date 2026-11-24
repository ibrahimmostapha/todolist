import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/signin');
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to={user ? '/todos' : '/signin'} className="brand">
          <span className="brand-dot" aria-hidden="true" />
          TaskFlow
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          {user ? (
            <>
              <NavLink
                to="/todos"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                My To-Do List
              </NavLink>
              <span className="nav-user">Hi, {user.name}</span>
              <button type="button" className="btn btn-outline btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/signin"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Sign In
              </NavLink>
              <NavLink
                to="/signup"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Sign Up
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
