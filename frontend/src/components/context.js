import React, { createContext } from 'react';
export const initialValue = {
  appName: 'presto',
  presentations: []
};

export const Context = createContext(initialValue);
export const useContext = React.useContext;
