import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from '../pages/LoginPage';
import Register from '../pages/RegistrationPage';
import { MessageProvider } from '../state/MessageContext';
import MessageModal from '../ui/MessageDialog';
import { ApiError, fetchPost } from '../services/presentationApi';

jest.mock('../services/presentationApi', () => ({
  ...jest.requireActual('../services/presentationApi'),
  fetchPost: jest.fn(),
}));

function renderAuth (component) {
  return render(
    <MemoryRouter>
      <MessageProvider>
        <MessageModal />
        <Routes>
          <Route path="/" element={component} />
          <Route path="/dashboard" element={<h1>Presentation dashboard</h1>} />
        </Routes>
      </MessageProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  fetchPost.mockReset();
});

test('login saves the session and opens the dashboard', async () => {
  fetchPost.mockResolvedValue({ token: 'session-token' });
  renderAuth(<Login />);
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'person@example.test' },
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'password' },
  });
  fireEvent.submit(screen.getByRole('form', { name: 'Login' }));

  expect(
    await screen.findByRole('heading', { name: 'Presentation dashboard' }),
  ).toBeInTheDocument();
  expect(localStorage.getItem('token')).toBe('session-token');
  expect(JSON.parse(localStorage.getItem('user'))).toEqual({
    email: 'person@example.test',
  });
});

test('an API error is readable and the login form can be retried', async () => {
  fetchPost.mockRejectedValue(
    new ApiError('Invalid credentials', { kind: 'http', status: 401 }),
  );
  renderAuth(<Login />);
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'person@example.test' },
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'wrong' },
  });
  fireEvent.submit(screen.getByRole('form', { name: 'Login' }));

  expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Login' })).toBeEnabled();
  expect(localStorage.getItem('token')).toBeNull();
});

test('registration rejects mismatched passwords before contacting the API', async () => {
  renderAuth(<Register />);
  fireEvent.change(screen.getByLabelText(/Email:/), {
    target: { value: 'person@example.test' },
  });
  fireEvent.change(screen.getByLabelText(/Name:/), {
    target: { value: 'Person' },
  });
  fireEvent.change(
    screen.getByLabelText(/Password:/, { selector: '#register-password' }),
    { target: { value: 'password' } },
  );
  fireEvent.change(screen.getByLabelText(/Confirm Password:/), {
    target: { value: 'different' },
  });
  fireEvent.submit(screen.getByRole('form', { name: 'Register' }));

  expect(
    await screen.findByText('Error confirm password.'),
  ).toBeInTheDocument();
  await waitFor(() => expect(fetchPost).not.toHaveBeenCalled());
});
