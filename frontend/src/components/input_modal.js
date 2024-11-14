import React, { useState, cloneElement } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

function InputModal (props) {
  const [show, setShow] = useState(false);
  const [text, setText] = useState('');

  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
  }
  const handleAction = () => {
    handleClose();
    props.action(text);
  }

  return (
    <>
      {cloneElement(props.switcher, { onClick: handleShow })}

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Please input</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className='mb-3'>
              <Form.Label>{props.title}</Form.Label>
              <Form.Control
                type='text'
                placeholder='new presentation'
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}

              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleClose}>
            Close
          </Button>
          <Button variant='primary' onClick={handleAction}>
            {props.actionText || 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default InputModal;
