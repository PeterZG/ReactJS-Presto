import Login from './pages/LoginPage';
import Register from './pages/RegistrationPage';
import Dashboard from './layout/DashboardLayout';
import React from 'react';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Presentation from './pages/PresentationEditorPage';
import Presentations from './pages/PresentationLibraryPage';
import Preview from './pages/PresentationPreviewPage';
import { MessageProvider } from './state/MessageContext';
import MessageModal from './ui/MessageDialog';

const router = createBrowserRouter([
  { path: '/', element: <Login /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    path: '/dashboard',
    element: <Dashboard />,
    children: [
      { index: true, element: <Presentations /> },
      { path: 'presentation/:id/:slideIndex', element: <Presentation /> },
    ],
  },
  { path: '/preview/:id/:slideIndex', element: <Preview /> },
]);

function App () {
  return (
    <React.StrictMode>
      <MessageProvider>
        <MessageModal />
        <RouterProvider router={router} />
      </MessageProvider>
    </React.StrictMode>
  );
}

export default App;
