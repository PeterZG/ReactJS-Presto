import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function ConfirmModal (props) {
  const [show, setShow] = useState(props.show);
  useEffect(() => {
    setShow(props.show);
  }, [props.show]);
  const handleClose = () => {
    setShow(false);
    if (props.onHide) {
      props.onHide();
    }
  }
  const handleAction = () => {
    handleClose();
    if (props.action) {
      props.action();
    }
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {props.content}
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={handleClose}>
          No
        </Button>
        <Button variant='primary' onClick={handleAction}>
          {props.actionText || 'Yes'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmModal;
