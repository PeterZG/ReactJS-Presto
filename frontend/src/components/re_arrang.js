import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function ReArrange (props) {
  const { presentation } = props;
  const [show, setShow] = useState(false);
  const [numbers, setNumbers] = useState([]);
  const [dragIndex, setDragIndex] = useState(0);

  useEffect(() => {
    if (presentation) {
      const temp = [];
      for (let i = 0; i < presentation.slides.length; i++) {
        temp.push(i);
      }
      setNumbers(temp);
    }
  }, [presentation]);

  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
  }
  const handleAction = () => {
    handleClose();
    const slides = [];
    for (const i of numbers) {
      slides.push({ ...presentation.slides[i] });
    }
    presentation.slides = slides;
    props.action(presentation);
  }

  function isCursorInElement (element, event) {
    const rect = element.getBoundingClientRect();
    return (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    );
  }

  const dragStart = (index) => {
    setDragIndex(index);
  }

  const dragEnd = e => {
    const items = document.getElementsByClassName('arrange-item');
    let index = 0;
    for (const item of items) {
      if (isCursorInElement(item, e)) {
        console.log('mouse in index:', index);
        arrangeNumbers(index);
        return;
      }
      index++;
    }
    arrangeNumbers(numbers.length - 1);
  }

  const arrangeNumbers = (destIndex) => {
    if (dragIndex === destIndex) {
      return;
    }
    const temp = numbers[dragIndex];
    if (dragIndex < destIndex) {
      for (let i = dragIndex; i < destIndex; i++) {
        numbers[i] = numbers[i + 1];
      }
    } else {
      for (let i = dragIndex; i > destIndex; i--) {
        numbers[i] = numbers[i - 1];
      }
    }
    numbers[destIndex] = temp;
    setNumbers([...numbers]);
  }
  return (
    <>
      <Button className='btn btn-primary ms-2 mb-2' onClick={handleShow}>ReArrange</Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Arrange Slides</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='arrange-box'>
            <>
              {numbers.map((item, index) => {
                return <div key={index} className='arrange-item' draggable
                  onDragStart={e => dragStart(index)}
                  onDragEnd={dragEnd}
                >{item}</div>
              })}
            </>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleClose}>
            Cancel
          </Button>
          <Button variant='primary' onClick={handleAction}>
            {props.actionText || 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ReArrange;
