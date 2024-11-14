import React from 'react';
function Button (props) {
  const { children } = props;
  return (
    <button {...props}>{children}</button>

  );
}

export default Button;
