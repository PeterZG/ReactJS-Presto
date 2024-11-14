import React, { useState, cloneElement, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import InputGroup from './input_group';
import { rangeValue } from './utils';

function SlideModal (props) {
  const [show, setShow] = useState(false);
  const [type, setType] = useState('TEXT');
  const [width, setWidth] = useState(50);
  const [height, setHeight] = useState(50);
  const [src, setSrc] = useState('');
  const [alt, setAlt] = useState('');
  const [font, setFont] = useState(1);
  const [color, setColor] = useState('#000000');
  const [code, setCode] = useState('');
  const [autoPlay, setAutoPlay] = useState(false);

  useEffect(() => {
    if (props.switcher) {
      setType(props.switcher.props.children);
    }
  }, []);

  const handleShow = () => {
    setShow(true)
  };
  const handleClose = () => {
    setShow(false);
  }
  const getYouTubeVideoId = (url) => {
    const videoIdRegex = /^.*(?:youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/;
    const match = url.match(videoIdRegex);
    return match && match[1].length === 11 ? match[1] : null;
  }
  const handleAction = () => {
    setShow(false);
    console.log('x', width, 'y', height, 'src', src);
    setWidth(rangeValue(width, 0, 100));
    setWidth(rangeValue(height, 0, 100));
    const data = {
      type,
      width: rangeValue(width, 0, 100),
      height: rangeValue(height, 0, 100),
      src,
      alt,
      font,
      color,
      code,
      autoPlay
    };
    if (type === 'VIDEO') {
      data.src = `https://www.youtube.com/embed/${getYouTubeVideoId(src)}`;
      if (autoPlay) {
        data.src = data.src + '?autoplay=1'
      }
    }
    if (props.action) {
      props.action(data);
    }
  }
  return (
    <>
      {props.switcher && cloneElement(props.switcher, { onClick: handleShow })}

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Please input</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <InputGroup type='number' value={width} onChange={w => setWidth(Number(w))} min={0} max={100}>Width(%)</InputGroup>
            <InputGroup type='number' value={height} onChange={w => setHeight(Number(w))}>Height(%)</InputGroup>
            {type === 'TEXT' &&
              <InputGroup type='text' value={src} onChange={w => setSrc(w)}>Text</InputGroup>}
            {(type === 'TEXT' || type === 'CODE') &&
              <InputGroup type='number' value={font} onChange={w => setFont(w)}>FontSize(em)</InputGroup>}
            {type === 'TEXT' &&
              <InputGroup type='text' value={color} onChange={w => setColor(w)}>Colour(HEX colour code)</InputGroup>}
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

export {
  SlideModal
}
