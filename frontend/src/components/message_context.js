import React, { createContext, useState } from 'react';

export const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [message, setMessage] = useState('');
  const [isShow, setIsShow] = useState('');
  const [messageType, setMessageType] = useState('message');
  const [callback, setCallback] = useState(null);

  const showMessage = (text, cb) => {
    setMessage(text);
    setMessageType('message');
    if (cb) {
      setCallback(cb);
    }
    setIsShow(true);
  };
  const showError = (text, cb) => {
    setMessage(text);
    setMessageType('error');
    if (cb) {
      setCallback(cb);
    }
    setIsShow(true);
  };

  return (
    <MessageContext.Provider value={{ isShow, setIsShow, message, showMessage, showError, messageType, callback }}>
      {children}
    </MessageContext.Provider>
  );
};
