import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from './button';
import InputModal from './input_modal';
import ConfirmModal from './confirm_modal';
import React, { useEffect, useState, useContext } from 'react';
import { MessageContext } from './message_context';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { loadPresentation, savePresentation, loadPresentations, savePresentations, saveHistoryRecord } from './storage';
import { Pencil, ArrowRightCircle, ArrowLeftCircle, Image, FileFont, CameraVideo, CodeSlash } from 'react-bootstrap-icons';
import SlideButton from './slide_button';
import { SlideModal } from './slide_modal';
import Slide from './slide';
import ThemeModal from './theme_modal';
import ReArrange from './re_arrang';
import { defaultSlide } from './utils';
import HistoryModal from './history_modal';
function Presentations () {
  const [presentation, setPresentation] = useState({ name: '', slides: [] });
  const [showConfirm, setShowConfirm] = useState(false);
  const [leftCtrl, setLeftCtrl] = useState(false);
  const [rightCtrl, setRightCtrl] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slide, setSlide] = useState({ items: [] });
  let { id, slideIndex } = useParams();
  const { showError } = useContext(MessageContext);
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
    });
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

  function editTitle (title) {
    const newPresentation = {
      ...presentation,
      name: title
    };
    doubleSave(newPresentation);
  }

  function doubleSave (newPresentation) {
    setPresentation(newPresentation);
    savePresentation(newPresentation);

    saveHistoryRecord(newPresentation);
  }

  function showConfirmDialog () {
    setShowConfirm(true);
  }
  function deletePresentation () {
    loadPresentations().then(pres => {
      let index = -1;
      for (let i = 0; i < pres.length; i++) {
        if (pres[i].id === Number(id)) {
          index = i;
          break;
        }
      }
      if (index >= 0) {
        pres.splice(index, 1);
        savePresentations(pres);
        navigate('/dashboard');
      }
    });
  }

  function createSlide () {
    const p = presentation;
    const newPresentation = {
      ...p,
      slides: [...p.slides, defaultSlide()]
    };
    doubleSave(newPresentation);
  }
  function deleteSlide () {
    if (presentation.slides.length === 1) {
      showError('Can not delete the last slide.');
      return;
    }
    presentation.slides.splice(currentSlide, 1);
    if (currentSlide > presentation.slides.length - 1) {
      setCurrentSlide(currentSlide - 1);
    }
    const newPresentation = {
      ...presentation,
      slides: [...presentation.slides]
    };
    doubleSave(newPresentation);
  }

  function prevSlide () {
    console.log('prev exe. curr is:', currentSlide);
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      console.log('set current.', currentSlide - 1);
      navigate(`/dashboard/presentation/${id}/${currentSlide - 1}`);
      handleFadeToggle();
    }
    console.log('prev exe after. curr is:', currentSlide);
  }
  function nextSlide () {
    console.log('next exe. curr is:', currentSlide, presentation.slides.length - 1);
    if (currentSlide < presentation.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
      navigate(`/dashboard/presentation/${id}/${currentSlide + 1}`);
      handleFadeToggle();
      console.log('set current+.', currentSlide + 1);
    }
    console.log('next exe after. curr is:', currentSlide);
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

  const addItem = (data) => {
    const slide = presentation.slides[currentSlide];
    data.layer = slide.layer;
    slide.layer = slide.layer + 1;
    data.top = 0;
    data.left = 0;
    slide.items.push(data);

    const p = presentation;
    const newPresentation = {
      ...p,
      slides: [...p.slides.slice(0, currentSlide), {
        ...slide,
      }, ...p.slides.slice(currentSlide + 1)]
    };
    doubleSave(newPresentation);
  };

  const updateSlide = slide => {
    const p = presentation;
    const newPresentation = {
      ...p,
      slides: [...p.slides.slice(0, currentSlide), {
        ...slide,
      }, ...p.slides.slice(currentSlide + 1)]
    };
    doubleSave(newPresentation);
  }

  const deleteItem = (item) => {
    const slide = presentation.slides[currentSlide];
    let index = -1;
    for (let i = 0; i < slide.items.length; i++) {
      if (item.layer === slide.items[i].layer) {
        index = i;
        break;
      }
    }
    if (index >= 0) {
      slide.items.splice(index, 1);
      updateSlide(slide);
    }
  };

  const setBackground = (data) => {
    slide.bg = data.currentBg;
    slide.useGradient = data.currentGradient;
    slide.color = data.currentColor;
    slide.colorStart = data.currentStart;
    slide.colorEnd = data.currentEnd;
    updateSlide(slide);
    const newPresentation = {
      ...presentation,
      bg: data.defaultBg,
      useGradient: data.defaultGradient,
      color: data.defaultColor,
      colorStart: data.defaultStart,
      colorEnd: data.defaultEnd
    };
    doubleSave(newPresentation);
  }

  const [fadeShow, setFadeShow] = useState(false);
  const handleFadeToggle = () => setFadeShow(!fadeShow);
  const fadeStyle = {
    opacity: fadeShow ? 1 : 1,
    animation: 'fadeInOut 1s'
  }

  const reArrange = (newPresentation) => {
    doubleSave(newPresentation);
    setSlide(newPresentation.slides[currentSlide]);
  }
  const openNewTab = (url) => {
    window.open(url, '_blank').focus();
  };

  function restoreHistory (record) {
    setPresentation(record);
  }

  return (

    <Container fluid>
      <Row >
        <Col xs={2}>
          <div className='sidebar'>
            <Link to='/dashboard' id='register_link' title='back to dashboard' className='mt-3 btn btn-secondary'>Back</Link>
            <Button title='delete presentation' className='btn btn-danger mt-3' onClick={showConfirmDialog}>Delete</Button>
            <ConfirmModal
              show={showConfirm}
              content='Are you sure?'
              onHide={() => setShowConfirm(false)}
              action={deletePresentation} />
            <SlideModal action={addItem}
              switcher={<SlideButton icon={<FileFont />}>TEXT</SlideButton>} />
            <SlideModal action={addItem}
              switcher={<SlideButton icon={<Image />}>IMAGE</SlideButton>} />
            <SlideModal action={addItem}
              switcher={<SlideButton icon={<CameraVideo />}>VIDEO</SlideButton>} />
            <SlideModal action={addItem}
              switcher={<SlideButton icon={<CodeSlash />}>CODE</SlideButton>} />
          </div>
        </Col>
        <Col xs={10}>
          <div className='mt-2 mb-2'>
            Title: {presentation.name}
            <InputModal title='Title' actionText='Save' action={editTitle}
              switcher={<Pencil className='icon-border ms-2' title='Edit Title' />} />
          </div>
          <div>
            <Button className='btn btn-primary me-2 mb-2' onClick={createSlide}>Add slide</Button>
            <Button className='btn btn-danger mb-2' onClick={deleteSlide}>Delete slide</Button>
            <span className='ms-2'>Slide count: {presentation.slides.length}</span>
            <ThemeModal action={setBackground} slide={slide} presentation={presentation}></ThemeModal>
            <Button onClick={() => openNewTab(`/preview/${id}/${currentSlide}`)} className='btn btn-primary ms-2 mb-2'>Preview</Button>
            <ReArrange presentation={presentation} action={reArrange}></ReArrange>
            <HistoryModal
              presentationId={id}
              action={restoreHistory}
              switcher={
                <Button className='btn btn-primary ms-2 mb-2'>History</Button>
              }></HistoryModal>
          </div>
          <div className='slideBox'>
            <Slide preview={false} style={fadeStyle} slide={slide} currentSlide={currentSlide} update={updateSlide} delete={deleteItem} presentation={presentation}></Slide>
            <div className='slide-control'>
              {leftCtrl && <ArrowLeftCircle className='icon' onClick={prevSlide} />}
              {rightCtrl && <ArrowRightCircle className='icon' onClick={nextSlide} />}
            </div>
          </div>
        </Col>
      </Row >
    </Container >
  );
}

export default Presentations;
