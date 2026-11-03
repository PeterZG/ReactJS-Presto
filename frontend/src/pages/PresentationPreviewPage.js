import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { loadPresentation } from '../services/presentationStorage';
import { ArrowRightCircle, ArrowLeftCircle } from 'react-bootstrap-icons';
import Slide from '../editor/SlideCanvas';

function Preview () {
  const [presentation, setPresentation] = useState(null);
  const [error, setError] = useState('');
  const { id, slideIndex } = useParams();
  const navigate = useNavigate();
  const currentSlide = Math.max(0, Number(slideIndex) || 0);
  const slide = presentation?.slides[currentSlide];

  useEffect(() => {
    loadPresentation(Number(id))
      .then((data) => {
        if (!data) setError('This presentation could not be found.');
        setPresentation(data);
      })
      .catch(() =>
        setError(
          'We couldn’t load this presentation. Please check your connection.',
        ),
      );
  }, [id]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const direction =
        event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
      const next = currentSlide + direction;
      if (
        direction &&
        presentation &&
        next >= 0 &&
        next < presentation.slides.length
      ) {
        event.preventDefault();
        navigate(`/preview/${id}/${next}`);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [currentSlide, presentation, id, navigate]);

  return (
    <main className="preview-shell">
      <header className="preview-header">
        <Link className="brand-lockup" to="/dashboard">
          <span className="brand-symbol">p</span>presto
        </Link>
        <span>{presentation?.name || 'Presentation preview'}</span>
        <Link
          to={`/dashboard/presentation/${id}/${currentSlide}`}
          variant="secondary" className="btn btn-secondary"
        >
          Back to editor ↗
        </Link>
      </header>
      {error
        ? (
        <div className="state-panel" role="alert">
          {error}
          <Link to="/dashboard">Return to workspace</Link>
        </div>
          )
        : !presentation
            ? (
        <div className="state-panel" role="status">
          Preparing your presentation…
        </div>
              )
            : !slide
                ? (
        <div className="state-panel">
          This slide could not be found.
          <Link to={`/preview/${id}/0`}>Open the first slide</Link>
        </div>
                  )
                : (
        <>
          <div className="preview-stage">
            <div className="slideBox preview">
              <Slide
                preview
                slide={slide}
                currentSlide={currentSlide}
                presentation={presentation}
              />
            </div>
          </div>
          <footer className="preview-footer">
            <span>PREVIEW MODE</span>
            <div className="preview-navigation">
              <button
                type="button"
                aria-label="Previous slide"
                disabled={currentSlide === 0}
                onClick={() => navigate(`/preview/${id}/${currentSlide - 1}`)}
              >
                <ArrowLeftCircle />
              </button>
              <span>
                {String(currentSlide + 1).padStart(2, '0')} /{' '}
                {String(presentation.slides.length).padStart(2, '0')}
              </span>
              <button
                type="button"
                aria-label="Next slide"
                disabled={currentSlide >= presentation.slides.length - 1}
                onClick={() => navigate(`/preview/${id}/${currentSlide + 1}`)}
              >
                <ArrowRightCircle />
              </button>
            </div>
            <span>USE ← → TO NAVIGATE</span>
          </footer>
        </>
                  )}
    </main>
  );
}

export default Preview;
