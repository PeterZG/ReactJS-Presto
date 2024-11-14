import React from 'react';
function SlideButton (props) {
  const { icon, children } = props;
  return (
    <div className='slide-btn' {...props}>
      {icon}
      <span>{children}</span>
    </div>
  );
}

export default SlideButton;
