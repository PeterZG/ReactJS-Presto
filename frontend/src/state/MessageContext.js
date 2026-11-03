import React, { createContext, useState, useCallback } from 'react';

export const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [message, setMessage] = useState('');
  const [isShow, setIsShow] = useState(false);
  const [messageType, setMessageType] = useState('message');
  const [callback, setCallback] = useState(null);

  const showMessage = useCallback((text, cb) => {
    setMessage(text instanceof Error ? text.message : String(text));
    setMessageType('message');
    setCallback(() => cb || null);
    setIsShow(true);
  }, []);
  const showError = useCallback((text, cb) => {
    setMessage(text instanceof Error ? text.message : String(text));
    setMessageType('error');
    setCallback(() => cb || null);
    setIsShow(true);
  }, []);

  return (
    <MessageContext.Provider
      value={{
        isShow,
        setIsShow,
        message,
        showMessage,
        showError,
        messageType,
        callback,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};
