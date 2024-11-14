import Highlight from 'react-highlight.js';
import EditModal from './edit_modal';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import EditBorder from './edit_border';
function Slide (props) {
  const { currentSlide, slide } = props;
  const [showEdit, setShowEdit] = useState(false);
  const [item, setItem] = useState({});
  const [showEditBorder, setShowEditBorder] = useState(false);
  const [slideSize, setSlideSize] = useState({ width: 100, height: 100 });
  const [lastClickTime, setLastClickTime] = useState(0);
  const [slideStyle, setSlideStyle] = useState(props.style);
  const [isPreview, setIsPreview] = useState(props.preview);
  const [slideClass, setSlideClass] = useState('slide');

  const slideRef = useRef(null);
  function handleResize () {
    const { offsetWidth, offsetHeight } = slideRef.current;
    setSlideSize({ width: offsetWidth, height: offsetHeight });
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    console.log('slide init. props.preview:', props.preview);
    if (props.preview) {
      setSlideClass('slide preview');
      setIsPreview(true);
    } else {
      setSlideClass('slide');
      setIsPreview(false);
    }
  }, [props]);

  useEffect(() => {
    handleResize();
  }, [item]);

  useEffect(() => {
    if (slide == null) {
      return;
    }
    let backgroundColor = slide.bg;
    if (backgroundColor === null || backgroundColor === '') {
      if (props.presentation && props.presentation.bg) {
        backgroundColor = props.presentation.bg;
      }
    }
    const style = props.style ? { ...props.style, background: backgroundColor } : { background: backgroundColor };
    setSlideStyle(style);
    console.log('slide style:', style);
  }, [slide, props.presentation, props.style]);

  const handleRightClick = (event, item) => {
    event.preventDefault();
    if (props.delete) {
      props.delete(item);
    }
  }

  const editItem = (item) => {
    console.log('double click item', item);
    if (isPreview) {
      return;
    }
    setItem(item);
    setShowEdit(true);
  }

  const updateItem = (item) => {
    let index = -1;
    for (let i = 0; i < slide.items.length; i++) {
      if (slide.items[i].layer === item.layer) {
        index = i;
        break;
      }
    }
    if (index >= 0) {
      slide.items[index] = item;
    }
    if (props.update) {
      props.update(slide);
    }
  }

  const startEdit = (item) => {
    console.log('start edit. isPreview:', isPreview);
    if (isPreview) {
      return;
    }
    setItem(item);
    setShowEditBorder(true);
  }

  const doubleClickTimer = useRef();
  const handleMouseDown = useCallback((event, item) => {
    // event.preventDefault();
    if (isPreview) {
      return;
    }

    const now = Date.now();
    const clickThreshold = 500;

    if (now - lastClickTime < clickThreshold) {
      clearTimeout(doubleClickTimer.current);
      editItem(item);
    } else {
      clearTimeout(doubleClickTimer.current);
      doubleClickTimer.current = setTimeout(() => {
        startEdit(item);
      }, clickThreshold);
    }

    setLastClickTime(now);
  }, [lastClickTime]);

  return (
    <>
      <EditModal show={showEdit} action={updateItem} onHide={() => setShowEdit(false)} item={item}></EditModal>
      <div className={slideClass} ref={slideRef} style={slideStyle}>
        {showEditBorder &&
          <EditBorder item={item} action={updateItem}
            hide={() => setShowEditBorder(false)}
            slideSize={slideSize}></EditBorder>}
        {slide && slide.items &&
          <>
            {
              slide.items.map((item, index) => {
                const style = {
                  width: item.width + '%',
                  height: item.height + '%',
                  fontSize: item.font + 'em',
                  zIndex: item.layer,
                  alt: item.alt,
                  top: item.top + '%',
                  left: item.left + '%',
                  fontFamily: item.fontFamily
                }
                let element;
                if (item.type === 'TEXT') {
                  style.color = item.color;
                  element = (
                    <div className='slide-item' style={style} key={index}
                      onMouseDown={e => handleMouseDown(e, item)}
                      onContextMenu={(e) => handleRightClick(e, item)}>{item.src}</div>
                  )
                } else if (item.type === 'IMAGE') {
                  element = (
                    <div className='slide-item' style={style} key={index}
                      onMouseDown={e => handleMouseDown(e, item)}
                      onContextMenu={(e) => handleRightClick(e, item)}>
                      <img src={item.src} alt={item.alt} />
                    </div>
                  )
                } else if (item.type === 'VIDEO') {
                  element = (
                    <div className='slide-item' style={style} key={index}
                      onMouseDown={e => handleMouseDown(e, item)}
                      onContextMenu={(e) => handleRightClick(e, item)}>
                      <iframe
                        width='99%'
                        height='100%'
                        src={item.src}
                        title='YouTube video player'
                        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                        allowFullScreen
                      ></iframe>
                    </div>
                  )
                } else {
                  element = (
                    <div className='slide-item' style={style} key={index}
                      onMouseDown={e => handleMouseDown(e, item)}
                      onContextMenu={(e) => handleRightClick(e, item)}>
                      <Highlight style={{ width: '100%', height: '100%' }} >{item.code}</Highlight>
                    </div>
                  )
                }
                return element;
              })
            }
          </>
        }
        <div className='slide-number'>{currentSlide + 1}</div>
      </div>
    </>
  );
}

export default Slide;
