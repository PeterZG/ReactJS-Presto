import React, { useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import c from 'highlight.js/lib/languages/c';
import ElementEditDialog from './ElementEditDialog';
import ElementSelectionBorder from './ElementSelectionBorder';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('c', c);

function ElementContent ({ item }) {
  if (item.type === 'TEXT') return <div className="slide-text-content">{item.src}</div>;
  if (item.type === 'IMAGE') return <img src={item.src} alt={item.alt} draggable={false} />;
  if (item.type === 'VIDEO') return <iframe width="100%" height="100%" src={item.src} title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />;
  return <pre><code className="hljs" dangerouslySetInnerHTML={{ __html: hljs.highlightAuto(item.code || '', ['c', 'python', 'javascript']).value }} /></pre>;
}

export default function SlideCanvas ({ currentSlide, slide, presentation, preview = false, update, delete: deleteElement }) {
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [editingLayer, setEditingLayer] = useState(null);
  const [size, setSize] = useState({ width: 960, height: 700 });
  const canvas = useRef(null);
  const selected = slide?.items.find(item => item.layer === selectedLayer);
  const editing = slide?.items.find(item => item.layer === editingLayer);

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      const rect = entries[0].contentRect;
      setSize({ width: rect.width, height: rect.height });
    });
    observer.observe(canvas.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => { setSelectedLayer(null); setEditingLayer(null); }, [currentSlide]);

  function updateElement (element) {
    update({ ...slide, items: slide.items.map(item => item.layer === element.layer ? element : item) });
  }

  return <>
    {editing && <ElementEditDialog show item={editing} action={updateElement} onHide={() => { setEditingLayer(null); setSelectedLayer(null); }} />}
    <div className={`slide${preview ? ' preview' : ''}`} ref={canvas} style={{ background: slide?.bg || presentation?.bg || '#ffffff', fontSize: `${size.width / 960 * 16}px` }} aria-label={`Slide ${currentSlide + 1} canvas`}>
      {slide?.items.map(item => <div key={item.layer} className={`slide-item slide-item-${item.type.toLowerCase()}`} style={{ width: `${item.width}%`, height: `${item.height}%`, left: `${item.left}%`, top: `${item.top}%`, fontSize: `${item.font || 1}em`, fontFamily: item.fontFamily || 'inherit', color: item.color, zIndex: item.layer }}
        {...(!preview
          ? {
              role: 'button',
              tabIndex: 0,
              'aria-label': `Edit ${item.type.toLowerCase()} element`,
              onClick: () => setSelectedLayer(item.layer),
              onDoubleClick: () => setEditingLayer(item.layer),
              onContextMenu: event => { event.preventDefault(); setSelectedLayer(null); deleteElement(item); },
              onKeyDown: event => {
                if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); setEditingLayer(item.layer); }
                if (event.key === 'Delete') { event.preventDefault(); setSelectedLayer(null); deleteElement(item); }
              },
            }
          : {})}><ElementContent item={item} /></div>)}
      {!preview && selected && <ElementSelectionBorder item={selected} action={updateElement} hide={() => setSelectedLayer(null)} slideSize={size} />}
      <div className="slide-number" aria-hidden="true">{currentSlide + 1}</div>
    </div>
  </>;
}
