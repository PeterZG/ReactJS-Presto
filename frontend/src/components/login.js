import Container from 'react-bootstrap/Container';
import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useContext } from 'react';
import { MessageContext } from './message_context';
import { fetchPost } from './fetch_util';
import { saveUser, saveToken } from './storage';
function Login () {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { showError } = useContext(MessageContext);
  const navigate = useNavigate();
  function login () {
    if (email === '' || password === '') {
      showError('Please input required field.');
      return;
    }
    fetchPost('/admin/auth/login', { email, password }).then((data) => {
      saveUser({ email });
      saveToken(data.token);
      navigate('/dashboard');
    }).catch(err => {
      showError(err);
    })
  }

  function handleKeyDown (e) {
    if (e.key === 'Enter') {
      login();
    }
  }

  return (
    <Container>
      <div id='login_div' className='page' data-display='flex'>
        <div className='login_inner_box'>
          <div className='row mb-4'>
            <div className='col-4'><span>*</span>Email:</div>
            <div className='col-8'>
              <input type='text' className='form-control' id='email' placeholder='Email' required={true}
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKeyDown} />
            </div>
          </div>
          <div className='row mb-4'>
            <div className='col-4'><span>*</span>Password:</div>
            <div className='col-8'>
              <input type='password' className='form-control' id='password' placeholder='Password'
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKeyDown} />
            </div>
          </div>
          <div className='row'>
            <div className='col-4'>
            </div>
            <div className='col-8'>
              <button id='login' className='btn btn-primary me-3' onClick={login}>Login</button>
              <Link to='/register' id='register_link' className='btn btn-secondary'>Register</Link>
            </div>
          </div>
        </div>
      </div>

    </Container>
  );
}

export default Login;
