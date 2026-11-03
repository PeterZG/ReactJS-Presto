import { render, screen } from '@testing-library/react';
import App from './App';
import React from 'react';

test('renders the login journey entry points', () => {
  window.history.pushState({}, '', '/login');
  render(<App />);

  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /register/i })).toHaveAttribute(
    'href',
    '/register',
  );
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
});
