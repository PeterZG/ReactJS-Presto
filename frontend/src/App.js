import Login from './components/login';
import Register from './components/register';
import Dashboard from './components/dashboard';
import React, { useState } from 'react';
import { Context, initialValue } from './components/context';

import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import Presentation from './components/presentation';
import Presentations from './components/presentations';
import Preview from './components/preview';
import { MessageProvider } from './components/message_context';
import MessageModal from './components/message_modal';

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
    ]
  },
  { path: '/preview/:id/:slideIndex', element: <Preview /> }
]);

function App () {
  const [appName, setAppName] = useState(initialValue.appName);
  const [presentations, setPresentations] = useState(initialValue.presentations);
  const getters = {
    appName,
    presentations
  }
  const setters = {
    setAppName,
    setPresentations,
  }
  return (
    <React.StrictMode>
      <Context.Provider value={{ getters, setters, }}>
        {/* <App /> */}
        <MessageProvider>
          <MessageModal />
          <RouterProvider router={router} />
        </MessageProvider>
      </Context.Provider>
    </React.StrictMode>
  );
}

export default App;
