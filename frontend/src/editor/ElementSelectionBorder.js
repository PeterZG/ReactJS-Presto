import React, { useRef, useState, useEffect } from 'react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function ElementSelectionBorder ({ item, action, hide, slideSize }) {
  const [geometry, setGeometry] = useState(item);
  const gesture = useRef(null);
  const latest = useRef(item);
  useEffect(() => { setGeometry(item); latest.current = item; }, [item]);

  function start (event, resize) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = { x: event.clientX, y: event.clientY, initial: geometry, resize };
  }
  function move (event) {
    const active = gesture.current;
    if (!active) return;
    const dx = (event.clientX - active.x) / slideSize.width * 100;
    const dy = (event.clientY - active.y) / slideSize.height * 100;
    const original = active.initial;
    const next = active.resize
      ? {
          ...original,
          width: clamp(original.width + dx, 1, 100 - original.left),
          height: clamp(original.height + dy, 1, 100 - original.top),
        }
      : {
          ...original,
          left: clamp(original.left + dx, 0, 100 - original.width),
          top: clamp(original.top + dy, 0, 100 - original.height),
        };
    latest.current = next;
    setGeometry(next);
  }
  function finish () {
    if (!gesture.current) return;
    gesture.current = null;
    action({ ...item, ...latest.current });
  }

  return <div className="element-selection" style={{ left: `${geometry.left}%`, top: `${geometry.top}%`, width: `${geometry.width}%`, height: `${geometry.height}%` }}>
    <div className="element-move-surface" role="button" tabIndex={0} aria-label="Move selected element" onPointerDown={event => start(event, false)} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish}
      onKeyDown={event => { if (event.key === 'Escape') hide(); }} />
    <button type="button" className="element-resize-handle" aria-label="Resize selected element" onPointerDown={event => start(event, true)} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish} />
    <button type="button" className="element-deselect" aria-label="Deselect element" onClick={hide}>×</button>
  </div>;
}
