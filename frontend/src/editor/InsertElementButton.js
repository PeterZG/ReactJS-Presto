import React from 'react';
function SlideButton (props) {
  const { icon, children, ...buttonProps } = props;
  return (
    <button type="button" className="slide-btn" {...buttonProps}>
      {icon}
      <span>{children}</span>
    </button>
  );
}

export default SlideButton;
