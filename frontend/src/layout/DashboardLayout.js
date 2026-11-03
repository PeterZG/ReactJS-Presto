import { Link, Outlet, useNavigate } from 'react-router-dom';
import Button from '../ui/ActionButton';
import React, { useContext, useEffect } from 'react';
import { MessageContext } from '../state/MessageContext';
import { clearUser, loadUser } from '../services/presentationStorage';
import { fetchPost } from '../services/presentationApi';
function Dashboard () {
  const { showError } = useContext(MessageContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loadUser() === null) {
      navigate('/login');
    }
  }, []);
  function logout () {
    fetchPost('/admin/auth/logout', {})
      .then(() => {
        clearUser();
        navigate('/login');
      })
      .catch((err) => {
        showError(err);
      });
  }
  return (
    <>
      <a className="skip-link" href="#workspace">
        Skip to workspace
      </a>
      <header className="studio-header">
        <Link
          to="/dashboard"
          className="brand-lockup"
          aria-label="Presto dashboard"
        >
          <span className="brand-symbol">p</span>presto
        </Link>
        <nav aria-label="Main navigation">
          <Link to="/dashboard" className="studio-nav-active">
            My workspace
          </Link>
          <span className="studio-nav-note">A place for your ideas</span>
        </nav>
        <div className="studio-account">
          <span className="account-avatar" aria-hidden="true">
            {(loadUser()?.email || 'P').slice(0, 1).toUpperCase()}
          </span>
          <Button className="btn btn-quiet" onClick={logout}>
            Log out ↗
          </Button>
        </div>
      </header>
      <Outlet />
    </>
  );
}

export default Dashboard;
