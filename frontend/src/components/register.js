import InputBind from './input_bind';
import './login.css';
import { Link } from 'react-router-dom';
import React, { useState, useContext } from 'react';
import { MessageContext } from './message_context';
import { fetchPost } from './fetch_util';
function Register () {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const { showMessage, showError } = useContext(MessageContext);

  function register () {
    if (email === '' || password === '' || password === '') {
      showError('Please input required field.');
      return;
    }
    if (password !== passwordConfirm) {
      showError('Error confirm password.');
      return;
    }
    fetchPost('/admin/auth/register', { email, name, password }).then(data => {
      showMessage('Register successfully.');
    }).catch(err => {
      showError(err);
    })
  }

  function handleKeyDown (e) {
    if (e.key === 'Enter') {
      register();
    }
  }
  return (

    <div id='register_div' className='page' data-display='flex'>
      <div className='register_inner_box'>
        <div className='row mb-4'>
          <div className='col-4'><span>*</span>Email:</div>
          <div className='col-8'>
            <InputBind type='text' val={[email, setEmail]} onKeyDown={handleKeyDown} />
          </div>
        </div>
        <div className='row mb-4'>
          <div className='col-4'><span>*</span>Name:</div>
          <div className='col-8'>
            <InputBind type='text' val={[name, setName]} onKeyDown={handleKeyDown} />
          </div>
        </div>
        <div className='row mb-4'>
          <div className='col-4'><span>*</span>Password:</div>
          <div className='col-8'>
            <InputBind type='password' val={[password, setPassword]} onKeyDown={handleKeyDown} />
          </div>
        </div>
        <div className='row mb-4'>
          <div className='col-4'><span>*</span>Confirm Password:</div>
          <div className='col-8'>
            <InputBind type='password' val={[passwordConfirm, setPasswordConfirm]} onKeyDown={handleKeyDown} />
          </div>
        </div>
        <div className='row mb-4'>
          <div className='col-4'></div>
          <div className='col-8'>
            <button id='register' className='btn btn-primary me-3' onClick={register}>Register</button>
            <Link to='/login' id='login_link' className='btn btn-secondary'>Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
