import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export default function SlideOrderDialog ({ presentation, action }) {
  const [show, setShow] = useState(false);
  const [order, setOrder] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  function open () {
    setOrder(presentation.slides.map((_, index) => index));
    setShow(true);
  }
  function move (index, destination) {
    if (destination < 0 || destination >= order.length) return;
    setOrder(previous => {
      const next = [...previous];
      const [entry] = next.splice(index, 1);
      next.splice(destination, 0, entry);
      return next;
    });
  }
  return <>
    <Button className="btn btn-secondary" onClick={open}>Arrange slides</Button>
    {show && <Modal show onHide={() => setShow(false)} scrollable>
      <Modal.Header closeButton><Modal.Title>Arrange slides</Modal.Title></Modal.Header>
      <Modal.Body><p className="field-hint">Drag a slide or use the move buttons. Changes apply when you save.</p><ol className="slide-order-list">
        {order.map((original, index) => <li key={original} draggable onDragStart={() => setDraggedIndex(index)} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); if (draggedIndex !== null) move(draggedIndex, index); setDraggedIndex(null); }}>
          <span className="order-grip" aria-hidden="true">⠿</span><div><strong>Slide {original + 1}</strong><small>{presentation.slides[original].items.length} elements</small></div>
          <button type="button" aria-label={`Move slide ${original + 1} earlier`} disabled={index === 0} onClick={() => move(index, index - 1)}>↑</button>
          <button type="button" aria-label={`Move slide ${original + 1} later`} disabled={index === order.length - 1} onClick={() => move(index, index + 1)}>↓</button>
        </li>)}
      </ol></Modal.Body>
      <Modal.Footer><Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button><Button variant="primary" onClick={() => { action({ ...presentation, slides: order.map(index => presentation.slides[index]) }); setShow(false); }}>Save order</Button></Modal.Footer>
    </Modal>}
  </>;
}
