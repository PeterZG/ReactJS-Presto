import React from 'react';
import ElementDialog from './ElementDialog';

export default function ElementEditDialog ({ show, item, action, onHide }) {
  return <ElementDialog show={show} type={item.type} item={item} onSave={action} onHide={onHide} />;
}
