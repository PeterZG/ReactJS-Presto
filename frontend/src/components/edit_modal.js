import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import InputGroup from './input_group';

function EditModal (props) {
  const [show, setShow] = useState(false);
  const [type, setType] = useState(props.item.type);
  const [width, setWidth] = useState(props.item.width);
  const [height, setHeight] = useState(props.item.height);
  const [src, setSrc] = useState(props.item.src);
  const [alt, setAlt] = useState(props.item.alt);
  const [font, setFont] = useState(props.item.font);
  const [color, setColor] = useState(props.item.color);
  const [code, setCode] = useState(props.item.code);
  const [autoPlay, setAutoPlay] = useState(false);
  const [fontFamily, setFontFamily] = useState('');

  useEffect(() => {
    console.log('edit init, ', props.item);
    setType(props.item.type);
    setWidth(props.item.width);
    setHeight(props.item.height);
    setSrc(props.item.src);
    setAlt(props.item.alt);
    setFont(props.item.font);
    setColor(props.item.color);
    setCode(props.item.code);
    setAutoPlay(props.item.autoPlay);
    setFontFamily(props.item.fontFamily);
  }, [props.item]);

  useEffect(() => {
    setShow(props.show);
  }, [props.show]);

  const handleClose = () => {
    setShow(false);
    if (props.onHide) {
      props.onHide();
    }
  }
  const getYouTubeVideoId = (url) => {
    const videoIdRegex = /^.*(?:youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/;
    const match = url.match(videoIdRegex);
    return match && match[1].length === 11 ? match[1] : null;
  }
  const handleAction = () => {
    handleClose();
    let data = { type, width, height, src, alt, font, color, code, autoPlay, fontFamily };
    data = {
      ...data,
      layer: props.item.layer,
      top: props.item.top,
      left: props.item.left,
      width: props.item.width,
      height: props.item.height
    }
    if (type === 'VIDEO') {
      data.src = `https://www.youtube.com/embed/${getYouTubeVideoId(src)}`;
      if (autoPlay) {
        data.src = data.src + '?autoplay=1'
      }
    }
    console.log('edit modal data:', data);
    if (props.action) {
      props.action(data);
    }
  }
  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Please input</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {type === 'TEXT' &&
              <InputGroup type='text' value={src} onChange={w => setSrc(w)}>Text</InputGroup>}
            {(type === 'TEXT' || type === 'CODE') &&
              <InputGroup type='number' value={font} onChange={w => setFont(w)}>FontSize(em)</InputGroup>}
            {type === 'TEXT' &&
              <InputGroup type='text' value={color} onChange={w => setColor(w)}>Colour</InputGroup>}
            {type === 'TEXT' &&
              <InputGroup type='text' value={fontFamily} onChange={w => setFontFamily(w)}>Font Family</InputGroup>}
            {type === 'IMAGE' &&
              <InputGroup type='text' value={src} onChange={w => setSrc(w)}>URL or base64 string encoding</InputGroup>}
            {type === 'IMAGE' &&
              <InputGroup type='text' value={alt} onChange={w => setAlt(w)}>Description</InputGroup>}
            {type === 'VIDEO' &&
              <InputGroup type='text' value={src} onChange={w => setSrc(w)}>URL</InputGroup>}
            {type === 'VIDEO' &&
              <>
                <input id='slide-auto' type='checkbox' className='me-3' checked={autoPlay} onChange={(e) => setAutoPlay(e.target.checked)} />
                <label htmlFor='slide-auto'>Auto-play</label>
              </>
            }
            {type === 'CODE' &&

              <Form.Group className='mb-3'>
                <Form.Label>Code</Form.Label>
                <textarea className='form-control' value={code} onChange={e => setCode(e.target.value)}></textarea>
              </Form.Group>}

          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleClose}>
            Close
          </Button>
          <Button variant='primary' onClick={handleAction}>
            {props.actionText || 'OK'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default EditModal;
