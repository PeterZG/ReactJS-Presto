import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadPresentation } from './storage';
import { ArrowRightCircle, ArrowLeftCircle } from 'react-bootstrap-icons';
import Slide from './slide';
function Preview () {
  const [presentation, setPresentation] = useState({ name: '', slides: [] });
  const [leftCtrl, setLeftCtrl] = useState(false);
  const [rightCtrl, setRightCtrl] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slide, setSlide] = useState({ items: [] });
  let { id, slideIndex } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    }
  }, []);
  useEffect(() => {
    id = Number(id);
    loadPresentation(id).then(prest => {
      setPresentation(prest);
    })
    if (slideIndex) {
      setCurrentSlide(Number(slideIndex));
    }
  }, [id, slideIndex]);
  useEffect(() => {
    setRightCtrl(currentSlide < presentation.slides.length - 1);
    setLeftCtrl(currentSlide > 0);
    setSlide(presentation.slides[currentSlide]);
    console.log('current slide', presentation.slides[currentSlide]);
  }, [presentation, currentSlide]);

  function prevSlide () {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      navigate(`/preview/${id}/${currentSlide - 1}`);
    }
  }
  function nextSlide () {
    if (currentSlide < presentation.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
      navigate(`/preview/${id}/${currentSlide + 1}`);
    }
  }

  const handleKeyDown = (event) => {
    // left（key code 37）right（key code 39）
    if (event.keyCode === 37 || event.keyCode === 39) {
      event.preventDefault();
      if (event.keyCode === 37) { // left
        console.log('Left arrow key was pressed');
        prevSlide();
      } else if (event.keyCode === 39) { // right
        console.log('Right arrow key was pressed');
        nextSlide();
      }
    }
  };

  return (

    <div className='slideBox preview'>
      <Slide preview={true} slide={slide} currentSlide={currentSlide} presentation={presentation}></Slide>
      <div className='slide-control'>
        {leftCtrl && <ArrowLeftCircle className='icon' onClick={prevSlide} />}
        {rightCtrl && <ArrowRightCircle className='icon' onClick={nextSlide} />}
      </div>
    </div>
  );
}

export default Preview;
