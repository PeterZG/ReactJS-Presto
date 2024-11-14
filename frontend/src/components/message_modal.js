import React, { useContext } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { MessageContext } from './message_context';

function MessageModal (props) {
  const { isShow, setIsShow, message, messageType, callback } = useContext(MessageContext);

  const handleClose = () => {
    setIsShow(false);
  }
  const handleAction = () => {
    handleClose();
    if (callback) {
      callback();
    }
  }

  return (
    <>
      <Modal show={isShow} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{messageType === 'error' ? 'Error' : 'Message'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message}
        </Modal.Body>
        <Modal.Footer>
          <Button variant='primary' onClick={handleAction}>
            {props.actionText || 'OK'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default MessageModal;
