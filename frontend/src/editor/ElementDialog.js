import React, { useEffect, useId, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

const imageSourceIsValid = source => /^(https?:\/\/|data:image\/(?:png|jpe?g|gif|webp|svg\+xml);)/i.test(source);

function youtubeSource (source, autoPlay) {
  try {
    const url = new URL(source);
    const host = url.hostname.replace(/^www\./, '');
    if (!['youtube.com', 'youtube-nocookie.com', 'youtu.be'].includes(host)) return null;
    const id = host === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).pop();
    if (!/^[\w-]{11}$/.test(id)) return null;
    return `https://www.youtube-nocookie.com/embed/${id}${autoPlay ? '?autoplay=1' : ''}`;
  } catch {
    return null;
  }
}

export default function ElementDialog ({ show, type, item, onHide, onSave }) {
  const formId = useId();
  const [draft, setDraft] = useState({});
  const [error, setError] = useState('');
  useEffect(() => {
    if (show) {
      setDraft({ width: 50, height: 40, left: 0, top: 0, font: 1, color: '#202a34', src: '', code: '', alt: '', autoPlay: false, fontFamily: '', ...item });
      setError('');
    }
  }, [show, item]);
  const update = (key, value) => setDraft(previous => ({ ...previous, [key]: value }));
  const field = (key, label, inputType = 'text', options = {}) => <Form.Group className="mb-3" controlId={`${formId}-${key}`}>
    <Form.Label>{label}</Form.Label>
    <Form.Control type={inputType} value={draft[key] ?? ''} onChange={event => update(key, event.target.value)} {...options} />
  </Form.Group>;

  function submit (event) {
    event.preventDefault();
    const left = Number(draft.left);
    const top = Number(draft.top);
    const width = Number(draft.width);
    const height = Number(draft.height);
    if (![left, top, width, height].every(Number.isFinite) || left < 0 || top < 0 || width < 1 || height < 1 || left + width > 100 || top + height > 100) {
      setError('Keep the element inside the slide: position plus size must not exceed 100%.');
      return;
    }
    let src = draft.src;
    if (type === 'IMAGE' && !imageSourceIsValid(src)) {
      setError('Use an http(s) image URL or an image data URL.');
      return;
    }
    if (type === 'VIDEO') {
      src = youtubeSource(src, draft.autoPlay);
      if (!src) {
        setError('Enter a valid YouTube video URL.');
        return;
      }
    }
    onSave({ ...draft, type, left, top, width, height, font: Number(draft.font), src });
    onHide();
  }

  return <Modal show={show} onHide={onHide} scrollable>
    <Modal.Header closeButton><Modal.Title>{item ? 'Edit' : 'Add'} {type?.toLowerCase()} element</Modal.Title></Modal.Header>
    <Modal.Body>
      <Form id={formId} onSubmit={submit}>
        {error && <p className="field-error" role="alert">{error}</p>}
        <div className="element-geometry-grid">
          {field('width', 'Width (%)', 'number', { min: 1, max: 100, step: 'any', required: true })}
          {field('height', 'Height (%)', 'number', { min: 1, max: 100, step: 'any', required: true })}
          {field('left', 'Left (%)', 'number', { min: 0, max: 99, step: 'any', required: true })}
          {field('top', 'Top (%)', 'number', { min: 0, max: 99, step: 'any', required: true })}
        </div>
        {type === 'TEXT' && <>{field('src', 'Text', 'text', { as: 'textarea', rows: 3, required: true })}{field('color', 'Text colour', 'color')}{field('fontFamily', 'Font family', 'text', { placeholder: 'Inherit presentation font' })}</>}
        {(type === 'TEXT' || type === 'CODE') && field('font', 'Font size (em)', 'number', { min: 0.25, max: 12, step: 0.25, required: true })}
        {type === 'IMAGE' && <>{field('src', 'Image URL', 'text', { required: true })}{field('alt', 'Image description', 'text', { required: true })}</>}
        {type === 'VIDEO' && <>{field('src', 'YouTube URL', 'url', { required: true })}<Form.Check id={`${formId}-autoplay`} type="checkbox" label="Auto-play" checked={Boolean(draft.autoPlay)} onChange={event => update('autoPlay', event.target.checked)} /></>}
        {type === 'CODE' && field('code', 'Code', 'text', { as: 'textarea', rows: 6, required: true, spellCheck: false })}
        <p className="field-hint">Position and size use a percentage of the slide. You can also drag a selected element on the canvas.</p>
      </Form>
    </Modal.Body>
    <Modal.Footer><Button variant="secondary" onClick={onHide}>Cancel</Button><Button variant="primary" type="submit" form={formId}>{item ? 'Save element' : 'Add element'}</Button></Modal.Footer>
  </Modal>;
}
