import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from './button';
import InputModal from './input_modal';
import React, { useState, useEffect } from 'react';
import { loadPresentations, savePresentations } from './storage';
import thumbnail from '../imgs/thumbnail.jpg';
import { useNavigate } from 'react-router-dom';
import { defaultSlide } from './utils';
function Presentations () {
  const [presentations, setPresentations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadPresentations().then(data => {
      setPresentations(data);
      console.log('here set pres.');
    });
  }, []);

  function createId () {
    let max = 0;
    for (const p of presentations) {
      if (p.id > max) {
        max = p.id;
      }
    }
    return max + 1;
  }
  function createPresentation (name) {
    console.log('create presentation 001 .');
    if (name === null || name === '') {
      return;
    }
    const presentation = {
      id: createId(),
      name,
      bg: '#ffffff',
      useGradient: false,
      color: '#ffffff',
      colorStart: '',
      colorEnd: '',
      slides: [
        defaultSlide()
      ]
    };
    console.log('create presentation .', presentations.length);
    const newPresentations = [...presentations, presentation];
    doubleSave(newPresentations);
    console.log('create presentation .', presentations.length);
  }

  function doubleSave (newPresentations) {
    setPresentations(newPresentations);
    savePresentations(newPresentations);
  }

  function showPresentation (id) {
    navigate(`/dashboard/presentation/${id}/0`);
  }

  return (

    <Container fluid>
      <Row className='mt-4'>
        <Col xs={2}>
          <div className='sidebar'>
            <InputModal title='Name' actionText='Create' action={createPresentation}
              switcher={<Button className='btn btn-primary'>New presentation</Button>} />
            <Button onClick={() => doubleSave([])} className='btn btn-danger mt-2'>Clear All</Button>
          </div>
        </Col>
        <Col xs={10}>
          <div className='presentations'>
            {presentations.map((item, index) => (
              <div className='presentation' key={index} onClick={() => showPresentation(item.id)}>
                <div className='img'><img src={thumbnail} alt="thumbnail" /></div>
                <div className='info'>
                  <div className='name'>name: {item.name}</div>
                  <div>Slides number: {item.slides.length}</div>
                </div>
              </div>
            ))}
          </div>
        </Col>
      </Row >
    </Container >
  );
}

export default Presentations;
