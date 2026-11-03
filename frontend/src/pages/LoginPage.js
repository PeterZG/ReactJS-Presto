import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useContext } from 'react';
import { MessageContext } from '../state/MessageContext';
import { fetchPost } from '../services/presentationApi';
import { saveUser, saveToken } from '../services/presentationStorage';
import '../layout/authentication.css';
import AuthShell from '../layout/AuthenticationLayout';
function Login () {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError } = useContext(MessageContext);
  const navigate = useNavigate();
  async function login (event) {
    event.preventDefault();
    if (isSubmitting) return;
    if (email === '' || password === '') {
      showError('Please input required field.');
      return;
    }
    setIsSubmitting(true);
    try {
      const data = await fetchPost('/admin/auth/login', { email, password });
      saveUser({ email });
      saveToken(data.token);
      navigate('/dashboard');
    } catch (err) {
      showError(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell mode="login">
      <div id="login_div" className="page" data-display="flex">
        <form className="login_inner_box" onSubmit={login} aria-label="Login">
          <span className="eyebrow">START SOMETHING GOOD</span>
          <h2>Welcome back.</h2>
          <p className="auth-intro">
            Your next great presentation starts here.
          </p>
          <div className="row mb-4">
            <label className="col-4" htmlFor="email">
              <span aria-hidden="true">*</span>Email:
            </label>
            <div className="col-8">
              <input
                type="email"
                className="form-control"
                id="email"
                aria-label="Email"
                placeholder="Email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="row mb-4">
            <label className="col-4" htmlFor="password">
              <span aria-hidden="true">*</span>Password:
            </label>
            <div className="col-8">
              <input
                type="password"
                className="form-control"
                id="password"
                aria-label="Password"
                placeholder="Password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-4"></div>
            <div className="col-8">
              <button
                id="login"
                type="submit"
                className="btn btn-primary me-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in…' : 'Login'}
              </button>
              <Link
                to="/register"
                id="register_link"
                className="btn btn-secondary"
              >
                Register
              </Link>
            </div>
          </div>
        </form>
      </div>
    </AuthShell>
  );
}

export default Login;
