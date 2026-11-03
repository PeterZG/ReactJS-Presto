import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import InputModal from '../ui/SingleFieldDialog';
import ConfirmModal from '../ui/ConfirmationDialog';
import Button from '../ui/ActionButton';
import { MessageContext } from '../state/MessageContext';
import {
  loadPresentations,
  savePresentations,
} from '../services/presentationStorage';
import { defaultSlide } from '../editor/slideDefaults';

function Presentations () {
  const [presentations, setPresentations] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const { showError } = useContext(MessageContext);
  const navigate = useNavigate();

  function reload () {
    setLoading(true);
    setLoadError(false);
    loadPresentations()
      .then(setPresentations)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }
  useEffect(reload, []);

  async function persist (next) {
    setSaving(true);
    try {
      await savePresentations(next);
      setPresentations(next);
    } catch (error) {
      showError(error);
    } finally {
      setSaving(false);
    }
  }

  function createPresentation (name) {
    if (!name || !name.trim()) return;
    const id =
      presentations.reduce(
        (max, presentation) => Math.max(max, Number(presentation.id) || 0),
        0,
      ) + 1;
    persist([
      ...presentations,
      {
        id,
        name: name.trim(),
        bg: '#ffffff',
        useGradient: false,
        color: '#ffffff',
        colorStart: '',
        colorEnd: '',
        slides: [defaultSlide()],
      },
    ]);
  }

  const visible = presentations.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()),
  );
  const slideCount = presentations.reduce(
    (total, item) => total + item.slides.length,
    0,
  );
  const createControl = (
    <InputModal
      title="Presentation name"
      actionText="Create presentation"
      action={createPresentation}
      switcher={
        <Button
          className="btn btn-primary"
          disabled={loading || saving || loadError}
        >
          + New presentation
        </Button>
      }
    />
  );

  return (
    <main id="workspace" className="workspace-shell">
      <section className="workspace-hero">
        <div>
          <span className="eyebrow">YOUR CREATIVE SPACE</span>
          <h1>
            Good ideas
            <br />
            start <em>here.</em>
          </h1>
          <p>
            From a first thought to the final slide. Make something worth
            sharing.
          </p>
          {createControl}
        </div>
        <div className="workspace-hero-art" aria-hidden="true">
          <div className="hero-orbit" />
          <span className="hero-art-label">
            A LITTLE SPACE.
            <br />A LOT OF POSSIBILITY.
          </span>
          <span className="hero-art-arrow">↗</span>
          <span className="hero-art-index">PRESTO / STUDIO 01</span>
        </div>
      </section>
      <section className="library-section" aria-label="Presentation library">
        <div className="library-heading">
          <div>
            <span className="eyebrow">THE COLLECTION</span>
            <h2>
              My presentations{' '}
              <span>{presentations.length.toString().padStart(2, '0')}</span>
            </h2>
          </div>
          <div className="library-meta">
            {slideCount} slides in your workspace
          </div>
        </div>
        <div className="library-toolbar">
          <label className="search-field">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Search presentations"
              type="search"
              placeholder="Find a presentation…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <span className="library-save-status" role="status">
            {saving ? 'Saving changes…' : 'Your ideas, all in one place.'}
          </span>
          <Button
            className="btn btn-quiet"
            disabled={!presentations.length || saving}
            onClick={() => setShowClear(true)}
          >
            Clear workspace
          </Button>
        </div>
        {loading && (
          <div className="state-panel" role="status">
            <span className="loading-orbit" />
            Getting your workspace ready…
          </div>
        )}
        {!loading && loadError && (
          <div className="state-panel" role="alert">
            <h3>We couldn’t load your presentations.</h3>
            <p>Check your connection and try again.</p>
            <Button className="btn btn-primary" onClick={reload}>
              Try again
            </Button>
          </div>
        )}
        {!loading && !loadError && (
          <div className="presentation-grid">
            {visible.map((item, index) => (
              <button
                type="button"
                className="presentation-card"
                key={item.id}
                onClick={() => navigate(`/dashboard/presentation/${item.id}/0`)}
                aria-label={`Open ${item.name}`}
              >
                <div className={`presentation-cover cover-${index % 4}`}>
                  {item.thumbnail
                    ? (
                    <img src={item.thumbnail} alt="" />
                      )
                    : (
                    <>
                      <span className="cover-index">
                        PRESTO / {String(index + 1).padStart(2, '0')}
                      </span>
                      <strong>{item.name}</strong>
                      <span className="cover-shape" />
                      <span className="cover-open" aria-hidden="true">
                        ↗
                      </span>
                    </>
                      )}
                </div>
                <div className="presentation-card-info">
                  <div>
                    <h3>{item.name}</h3>
                    <p>
                      {item.slides.length}{' '}
                      {item.slides.length === 1 ? 'slide' : 'slides'} · Ready to
                      shape
                    </p>
                  </div>
                  <span aria-hidden="true">↗</span>
                </div>
              </button>
            ))}
            {!query && (
              <div className="new-presentation-tile">
                <span aria-hidden="true">+</span>
                <h3>A new beginning.</h3>
                <p>Your next idea belongs here.</p>
                {createControl}
              </div>
            )}
          </div>
        )}
        {!loading && !loadError && query && !visible.length && (
          <div className="state-panel">
            <h3>No presentations found.</h3>
            <p>Try another name or clear your search.</p>
            <Button className="btn btn-secondary" onClick={() => setQuery('')}>
              Clear search
            </Button>
          </div>
        )}
      </section>
      <footer className="workspace-footer">
        <span>PRESTO — IDEAS, PRESENTED.</span>
        <span>Made for the way you think.</span>
      </footer>
      <ConfirmModal
        show={showClear}
        content="Delete every presentation in this workspace? This cannot be undone."
        onHide={() => setShowClear(false)}
        action={() => {
          setShowClear(false);
          persist([]);
        }}
      />
    </main>
  );
}

export default Presentations;
