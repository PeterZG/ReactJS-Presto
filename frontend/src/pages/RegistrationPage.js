import InputBind from '../ui/BoundField';
import '../layout/authentication.css';
import { Link } from 'react-router-dom';
import React, { useState, useContext } from 'react';
import { MessageContext } from '../state/MessageContext';
import { fetchPost } from '../services/presentationApi';
import AuthShell from '../layout/AuthenticationLayout';
function Register () {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showMessage, showError } = useContext(MessageContext);

  async function register (event) {
    event.preventDefault();
    if (isSubmitting) return;
    if (
      email === '' ||
      name === '' ||
      password === '' ||
      passwordConfirm === ''
    ) {
      showError('Please input required field.');
      return;
    }
    if (password !== passwordConfirm) {
      showError('Error confirm password.');
      return;
    }
    setIsSubmitting(true);
    try {
      await fetchPost('/admin/auth/register', { email, name, password });
      showMessage('Register successfully.');
    } catch (err) {
      showError(err);
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <AuthShell mode="register">
      <div id="register_div" className="page" data-display="flex">
        <form
          className="register_inner_box"
          onSubmit={register}
          aria-label="Register"
        >
          <span className="eyebrow">A FRESH CANVAS AWAITS</span>
          <h2>Make it yours.</h2>
          <p className="auth-intro">
            Create an account and give your ideas a home.
          </p>
          <div className="row mb-4">
            <label className="col-4" htmlFor="register-email">
              <span aria-hidden="true">*</span>Email:
            </label>
            <div className="col-8">
              <InputBind
                id="register-email"
                type="email"
                autoComplete="email"
                required
                val={[email, setEmail]}
              />
            </div>
          </div>
          <div className="row mb-4">
            <label className="col-4" htmlFor="register-name">
              <span aria-hidden="true">*</span>Name:
            </label>
            <div className="col-8">
              <InputBind
                id="register-name"
                type="text"
                autoComplete="name"
                required
                val={[name, setName]}
              />
            </div>
          </div>
          <div className="row mb-4">
            <label className="col-4" htmlFor="register-password">
              <span aria-hidden="true">*</span>Password:
            </label>
            <div className="col-8">
              <InputBind
                id="register-password"
                type="password"
                autoComplete="new-password"
                required
                val={[password, setPassword]}
              />
            </div>
          </div>
          <div className="row mb-4">
            <label className="col-4" htmlFor="register-confirm-password">
              <span aria-hidden="true">*</span>Confirm Password:
            </label>
            <div className="col-8">
              <InputBind
                id="register-confirm-password"
                type="password"
                autoComplete="new-password"
                required
                val={[passwordConfirm, setPasswordConfirm]}
              />
            </div>
          </div>
          <div className="row mb-4">
            <div className="col-4"></div>
            <div className="col-8">
              <button
                id="register"
                type="submit"
                className="btn btn-primary me-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registering…' : 'Register'}
              </button>
              <Link to="/login" id="login_link" variant="secondary" className="btn btn-secondary">
                Login
              </Link>
            </div>
          </div>
        </form>
      </div>
    </AuthShell>
  );
}

export default Register;
