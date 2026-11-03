import React, { cloneElement, useState } from 'react';
import ElementDialog from './ElementDialog';

function SlideModal ({ switcher, action }) {
  const [show, setShow] = useState(false);
  return <>
    {cloneElement(switcher, { onClick: () => setShow(true) })}
    <ElementDialog show={show} type={switcher.props.children} onSave={action} onHide={() => setShow(false)} />
  </>;
}

export { SlideModal };
