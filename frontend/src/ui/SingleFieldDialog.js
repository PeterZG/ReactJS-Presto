import React, { useState, useId, cloneElement } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

function InputModal (props) {
  const [show, setShow] = useState(false);
  const [text, setText] = useState('');
  const formId = useId();
  const inputId = useId();

  const handleShow = () => {
    setText(props.value || '');
    setShow(true);
  };
  const handleClose = () => {
    setShow(false);
  };
  const handleAction = (event) => {
    event.preventDefault();
    if (!props.allowEmpty && !text.trim()) return;
    handleClose();
    props.action(text.trim());
  };

  return (
    <>
      {cloneElement(props.switcher, { onClick: handleShow })}

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form id={formId} onSubmit={handleAction}>
            <Form.Group className="mb-3" controlId={inputId}>
              <Form.Label>{props.title}</Form.Label>
              <Form.Control
                type="text"
                placeholder={props.placeholder || 'Give it a name'}
                required={!props.allowEmpty}
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="primary"
            type="submit"
            form={formId}
            disabled={!props.allowEmpty && !text.trim()}
          >
            {props.actionText || 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default InputModal;
