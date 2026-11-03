import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from '../ui/ActionButton';
import InputModal from '../ui/SingleFieldDialog';
import ConfirmModal from '../ui/ConfirmationDialog';
import React, { useEffect, useLayoutEffect, useState, useContext, useRef } from 'react';
import { MessageContext } from '../state/MessageContext';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  loadPresentation,
  savePresentation,
  removePresentation,
  saveHistoryRecord,
} from '../services/presentationStorage';
import {
  Pencil,
  ArrowRightCircle,
  ArrowLeftCircle,
  Image,
  FileFont,
  CameraVideo,
  CodeSlash,
} from 'react-bootstrap-icons';
import SlideButton from '../editor/InsertElementButton';
import { SlideModal } from '../editor/SlideElementDialog';
import Slide from '../editor/SlideCanvas';
import ThemeModal from '../editor/SlideThemeDialog';
import ReArrange from '../editor/SlideOrderDialog';
import { defaultSlide } from '../editor/slideDefaults';
import HistoryModal from '../editor/PresentationHistoryDialog';
function PresentationEditorPage () {
  const [presentation, setPresentation] = useState({ name: '', slides: [] });
  const [showConfirm, setShowConfirm] = useState(false);
  const [historyWarning, setHistoryWarning] = useState('');
  const [saveStatus, setSaveStatus] = useState('All changes saved');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [canvasZoom, setCanvasZoom] = useState(100);
  const saveVersion = useRef(0);
  const { id, slideIndex } = useParams();
  const parsedSlideIndex = Number(slideIndex);
  const currentSlide = Number.isSafeInteger(parsedSlideIndex) && parsedSlideIndex >= 0 ? parsedSlideIndex : 0;
  const slide = presentation.slides[currentSlide] || { items: [] };
  const leftCtrl = currentSlide > 0;
  const rightCtrl = currentSlide < presentation.slides.length - 1;
  const { showError } = useContext(MessageContext);
  const navigate = useNavigate();
  // Update keyboard navigation before the next paint, including rapid key presses.
  useLayoutEffect(() => {
    const onKeyDown = (event) => {
      if (
        event.target.closest(
          'input, textarea, select, [contenteditable="true"], [role="dialog"]',
        )
      ) { return; }
      const direction =
        event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
      const next = currentSlide + direction;
      if (direction && next >= 0 && next < presentation.slides.length) {
        event.preventDefault();
        navigate(`/dashboard/presentation/${id}/${next}`);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [currentSlide, presentation.slides.length, id, navigate]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    loadPresentation(Number(id))
      .then((loadedPresentation) => {
        if (!active) return;
        if (!loadedPresentation) {
          navigate('/dashboard');
          return;
        }
        setPresentation(loadedPresentation);
        if (!saveHistoryRecord(loadedPresentation)) setHistoryWarning('Local history is unavailable. Your presentation still saves to the API.');
      })
      .catch(() => { if (active) setLoadError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, navigate, loadAttempt]);
  useEffect(() => {
    if (presentation.slides.length && currentSlide >= presentation.slides.length) navigate(`/dashboard/presentation/${id}/0`, { replace: true });
  }, [presentation, currentSlide, navigate, id]);

  function editTitle (title) {
    const newPresentation = {
      ...presentation,
      name: title,
    };
    saveEditorChanges(newPresentation);
  }

  function saveEditorChanges (newPresentation) {
    const version = ++saveVersion.current;
    setPresentation(newPresentation);
    setSaveStatus('Saving…');
    savePresentation(newPresentation)
      .then(() => {
        if (version === saveVersion.current) setSaveStatus('All changes saved');
      })
      .catch((error) => {
        if (version === saveVersion.current) setSaveStatus('Changes not saved');
        showError(error);
      });

    if (!saveHistoryRecord(newPresentation)) setHistoryWarning('Local history is unavailable. Your presentation still saves to the API.');
  }

  function showConfirmDialog () {
    setShowConfirm(true);
  }
  function deletePresentation () {
    removePresentation(Number(id))
      .then(() => navigate('/dashboard'))
      .catch(showError);
  }

  function createSlide () {
    const newPresentation = {
      ...presentation,
      slides: [...presentation.slides, defaultSlide()],
    };
    saveEditorChanges(newPresentation);
  }
  function deleteSlide () {
    if (presentation.slides.length === 1) {
      showError('Can not delete the last slide.');
      return;
    }
    const remaining = presentation.slides.filter((_, index) => index !== currentSlide);
    const nextIndex = Math.min(currentSlide, remaining.length - 1);
    if (nextIndex !== currentSlide) navigate(`/dashboard/presentation/${id}/${nextIndex}`);
    const newPresentation = {
      ...presentation,
      slides: remaining,
    };
    saveEditorChanges(newPresentation);
  }

  function prevSlide () {
    if (currentSlide > 0) {
      navigate(`/dashboard/presentation/${id}/${currentSlide - 1}`);
    }
  }
  function nextSlide () {
    if (currentSlide < presentation.slides.length - 1) {
      navigate(`/dashboard/presentation/${id}/${currentSlide + 1}`);
    }
  }

  const addItem = (data) => {
    const activeSlide = presentation.slides[currentSlide];
    if (!activeSlide) return;
    updateSlide({
      ...activeSlide,
      layer: activeSlide.layer + 1,
      items: [...activeSlide.items, { ...data, layer: activeSlide.layer }],
    });
  };

  const updateSlide = (slide) => {
    const newPresentation = {
      ...presentation,
      slides: [
        ...presentation.slides.slice(0, currentSlide),
        {
          ...slide,
        },
        ...presentation.slides.slice(currentSlide + 1),
      ],
    };
    saveEditorChanges(newPresentation);
  };

  const deleteItem = (item) => {
    updateSlide({ ...slide, items: slide.items.filter(element => element.layer !== item.layer) });
  };

  const setBackground = (data) => {
    const newPresentation = {
      ...presentation,
      slides: presentation.slides.map((entry, index) => index === currentSlide
        ? {
            ...entry,
            bg: data.currentBg,
            useGradient: data.currentGradient,
            color: data.currentColor,
            colorStart: data.currentStart,
            colorEnd: data.currentEnd,
          }
        : entry),
      bg: data.defaultBg,
      useGradient: data.defaultGradient,
      color: data.defaultColor,
      colorStart: data.defaultStart,
      colorEnd: data.defaultEnd,
    };
    saveEditorChanges(newPresentation);
  };

  const reArrange = (newPresentation) => {
    saveEditorChanges(newPresentation);
  };
  const openNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  function restoreHistory (record) {
    if (!record || !Array.isArray(record.slides)) return;
    saveEditorChanges(JSON.parse(JSON.stringify(record)));
    if (currentSlide >= record.slides.length) { navigate(`/dashboard/presentation/${id}/0`); }
  }

  if (loading) return <main id="workspace" className="state-panel" role="status">Loading your presentation…</main>;
  if (loadError) return <main id="workspace" className="state-panel" role="alert"><h1>We couldn’t load this presentation.</h1><p>Check your connection and try again.</p><Button className="btn btn-primary" onClick={() => setLoadAttempt(attempt => attempt + 1)}>Try again</Button><Link to="/dashboard">Back to workspace</Link></main>;

  return (
    <Container fluid id="workspace" className="editor-shell">
      <Row className="editor-layout">
        <Col xs={12} md={2} className="editor-tool-rail">
          <div className="sidebar">
            <Link
              to="/dashboard"
              title="back to dashboard"
              className="btn btn-quiet"
            >
              ← All presentations
            </Link>
            <span className="eyebrow tool-rail-label">ADD TO YOUR SLIDE</span>
            <Button
              title="delete presentation"
              className="btn btn-danger mt-3"
              onClick={showConfirmDialog}
            >
              Delete
            </Button>
            <ConfirmModal
              show={showConfirm}
              content="Are you sure?"
              onHide={() => setShowConfirm(false)}
              action={deletePresentation}
            />
            <InputModal title="Thumbnail URL" value={presentation.thumbnail} allowEmpty
              placeholder="https://… or data:image/… (leave blank to remove)"
              action={thumbnail => saveEditorChanges({ ...presentation, thumbnail })}
              switcher={<Button className="btn btn-secondary">Thumbnail</Button>} />
            <SlideModal
              action={addItem}
              switcher={<SlideButton icon={<FileFont />}>TEXT</SlideButton>}
            />
            <SlideModal
              action={addItem}
              switcher={<SlideButton icon={<Image />}>IMAGE</SlideButton>}
            />
            <SlideModal
              action={addItem}
              switcher={<SlideButton icon={<CameraVideo />}>VIDEO</SlideButton>}
            />
            <SlideModal
              action={addItem}
              switcher={<SlideButton icon={<CodeSlash />}>CODE</SlideButton>}
            />
          </div>
        </Col>
        <Col xs={12} md={10} className="editor-main">
          <div className="editor-title-row">
            <div>
              <span className="eyebrow">PRESENTATION STUDIO</span>
              <h1>{presentation.name || 'Your presentation'}</h1>
            </div>
            <InputModal
              title="Title"
              value={presentation.name}
              actionText="Save"
              action={editTitle}
              switcher={
                <button
                  type="button"
                  className="btn btn-secondary"
                  aria-label="Edit presentation title"
                >
                  <Pencil /> Rename
                </button>
              }
            />
            <span className="save-status" role="status">
              <span className="status-dot" />
              {saveStatus}
              {saveStatus === 'Changes not saved' && <Button className="btn btn-secondary" onClick={() => saveEditorChanges(presentation)}>Retry save</Button>}
            </span>
          </div>
          {historyWarning && <p className="editor-hint" role="status">{historyWarning}</p>}
          <div className="editor-toolbar" aria-label="Slide tools">
            <div className="slide-actions" role="group" aria-label="Slide actions">
              <Button className="btn btn-primary" onClick={createSlide}>
                Add slide
              </Button>
              <Button className="btn btn-danger" onClick={deleteSlide}>
                Delete slide
              </Button>
              <span className="slide-count">
                Slide {currentSlide + 1} / {presentation.slides.length}
              </span>
            </div>
            <div className="presentation-actions" role="group" aria-label="Presentation tools">
              <ThemeModal
                action={setBackground}
                slide={slide}
                presentation={presentation}
              />
              <Button
                onClick={() => openNewTab(`/preview/${id}/${currentSlide}`)}
                className="btn btn-secondary"
                disabled={saveStatus !== 'All changes saved'}
              >
                Preview
              </Button>
              <ReArrange presentation={presentation} action={reArrange} />
              <HistoryModal
                presentationId={id}
                action={restoreHistory}
                switcher={<Button className="btn btn-secondary">History</Button>}
              />
            </div>
          </div>
          <div className="editor-stage">
            <div className="slideBox" style={{ width: `${canvasZoom}%`, maxWidth: canvasZoom === 100 ? '960px' : 'none' }}>
              <Slide
                preview={false}
                slide={slide}
                currentSlide={currentSlide}
                update={updateSlide}
                delete={deleteItem}
                presentation={presentation}
              ></Slide>
              <div className="slide-control">
                <button
                  type="button"
                  aria-label="Previous slide"
                  disabled={!leftCtrl}
                  onClick={prevSlide}
                >
                  <ArrowLeftCircle className="icon" />
                </button>
                <button
                  type="button"
                  aria-label="Next slide"
                  disabled={!rightCtrl}
                  onClick={nextSlide}
                >
                  <ArrowRightCircle className="icon" />
                </button>
              </div>
            </div>
          </div>
          <div className="canvas-zoom-controls"><label htmlFor="canvas-zoom">Canvas zoom</label><input id="canvas-zoom" type="range" min="100" max="250" step="25" value={canvasZoom} onChange={event => setCanvasZoom(Number(event.target.value))} /><output htmlFor="canvas-zoom">{canvasZoom}%</output><Button className="btn btn-quiet" onClick={() => setCanvasZoom(100)}>Fit to screen</Button></div>
          <div className="slide-filmstrip" aria-label="Slides">
            {presentation.slides.map((item, index) => (
              <button
                type="button"
                key={index}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentSlide ? 'step' : undefined}
                onClick={() =>
                  navigate(`/dashboard/presentation/${id}/${index}`)
                }
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <small>
                  {item.items.length
                    ? `${item.items.length} elements`
                    : 'Blank canvas'}
                </small>
              </button>
            ))}
          </div>
          <p className="editor-hint">
            ← → Navigate slides <span>·</span> Select to move or resize <span>·</span> Enter or double-click to edit <span>·</span> Delete to remove
          </p>
        </Col>
      </Row>
    </Container>
  );
}

export default PresentationEditorPage;
