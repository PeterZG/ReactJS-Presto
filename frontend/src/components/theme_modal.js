import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import InputGroup from './input_group';
import CheckboxGroup from './checkbox_group';

function ThemeModal (props) {
  const { slide, presentation } = props;
  const [show, setShow] = useState(false);
  const [currentBg, setCurrentBg] = useState('#ffffff');
  const [currentStart, setCurrentStart] = useState('#ffffff');
  const [currentEnd, setCurrentEnd] = useState('#ffffff');
  const [currentGradient, setCurrentGradient] = useState(false);
  const [defaultBg, setDefaultBg] = useState('#ffffff');
  const [defaultStart, setDefaultStart] = useState('#ffffff');
  const [defaultEnd, setDefaultEnd] = useState('#ffffff');
  const [defaultGradient, setDefaultGradient] = useState(false);

  useEffect(() => {
    if (!slide) {
      return;
    }
    setCurrentGradient(slide.useGradient);
    setDefaultGradient(presentation.useGradient);

    setCurrentBg(slide.color || '');
    setDefaultBg(presentation.color || '');

    setCurrentStart(slide.colorStart || '');
    setDefaultStart(presentation.colorStart || '');

    setCurrentEnd(slide.colorEnd || '');
    setDefaultEnd(presentation.colorEnd || '');
  }, [slide, presentation]);

  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
  }
  const handleAction = () => {
    handleClose();
    let current = currentBg;
    if (currentGradient) {
      current = `linear-gradient(to right, ${currentStart}, ${currentEnd})`;
    }
    let defaultColor = defaultBg;
    if (defaultGradient) {
      defaultColor = `linear-gradient(to right, ${defaultStart}, ${defaultEnd})`;
    }
    const data = {
      currentBg: current,
      defaultBg: defaultColor,
      currentColor: currentBg,
      defaultColor: defaultBg,
      currentStart,
      currentEnd,
      defaultStart,
      defaultEnd,
      currentGradient,
      defaultGradient
    };
    console.log('set color', data);
    props.action(data);
  }

  return (
    <>
      <Button className='btn btn-primary ms-2 mb-2' onClick={handleShow}>Theme</Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Please input</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {!currentGradient && <InputGroup type='text' value={currentBg} onChange={w => setCurrentBg(w)}>Current Slide Background Colour</InputGroup>}
            {currentGradient && <>
              <InputGroup type='text' value={currentStart} onChange={w => setCurrentStart(w)}>Current Colour Start</InputGroup>
              <InputGroup type='text' value={currentEnd} onChange={w => setCurrentEnd(w)}>Current Colour End</InputGroup>
            </>}
            <CheckboxGroup checked={currentGradient} onChange={v => setCurrentGradient(v)}>Use colour gradient for current slide</CheckboxGroup>
            {!defaultGradient && <InputGroup type='text' value={defaultBg} onChange={w => setDefaultBg(w)}>Default Slide Background Colour</InputGroup>}
            {defaultGradient && <>
              <InputGroup type='text' value={defaultStart} onChange={w => setDefaultStart(w)}>Default Colour Start</InputGroup>
              <InputGroup type='text' value={defaultEnd} onChange={w => setDefaultEnd(w)}>Default Colour End</InputGroup>
            </>}
            <CheckboxGroup checked={defaultGradient} onChange={v => setDefaultGradient(v)}>Use colour gradient for default slide</CheckboxGroup>
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

export default ThemeModal;
