import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { Outlet, useNavigate } from 'react-router-dom';
import Button from './button';
import React, { useContext, useEffect } from 'react';
import { MessageContext } from './message_context';
import { clearUser, loadUser } from './storage';
import { fetchPost } from './fetch_util';
function Dashboard () {
  const { showError } = useContext(MessageContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loadUser() === null) {
      navigate('/login');
    }
  }, []);
  function logout () {
    fetchPost('/admin/auth/logout', {}).then(() => {
      clearUser();
      navigate('/login');
    }).catch(err => {
      showError(err);
    });
  }
  return (
    <>
      <Navbar expand="lg" bg="dark" data-bs-theme="dark">
        <Container>
          <Navbar.Brand href="/dashboard">Presto</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
              Signed in as: User
            </Navbar.Text>
            <Navbar.Text>
              <Button className='btn btn-secondary ms-5' onClick={logout}>Logout</Button>
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Outlet />
    </>
  );
}

export default Dashboard;
