import React, { useEffect, useState } from 'react';
import { rangeValue } from './utils';

function EditBorder (props) {
  const { item } = props;
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [top, setTop] = useState(item.top);
  const [left, setLeft] = useState(item.left);
  const [width, setWidth] = useState(item.width);
  const [height, setHeight] = useState(item.height);
  const WIDTH = props.slideSize.width;
  const HEIGHT = props.slideSize.height;

  useEffect(() => {
    setTop(item.top);
    setLeft(item.left);
    setWidth(item.width);
    setHeight(item.height);
  }, [item]);
  const topLeftStyle = {
    top: top + '%',
    left: left + '0%',
  }
  const topRightStyle = {
    top: (top) + '%',
    left: (left + width) + '%',
  }
  const bottomLeftStyle = {
    top: (top + height) + '%',
    left: left + '0%',
  }
  const bottomRightStyle = {
    top: (top + height) + '%',
    left: (left + width) + '%',
  }
  const editBoxStyle = {
    top: top + '%',
    left: left + '%',
    width: width + '%',
    height: height + '%',
  }

  const boxMouseDown = (e) => {
    setMouseX(e.clientX);
    setMouseY(e.clientY);
  }
  const boxMouseUp = (e) => {
    if (mouseX === e.clientX && mouseY === e.clientY) {
      console.log('box mouse up');
      props.hide();
    }
  }

  const dragStart = (e) => {
    setStartX(e.clientX);
    setStartY(e.clientY);
    console.log('drag start, WIDTH', WIDTH, HEIGHT);
  }
  const dragBox = (e) => {
    e.preventDefault();
    let newTop = top + (e.clientY - startY) / HEIGHT * 100;
    newTop = rangeValue(newTop, 0, 100 - height);
    setTop(newTop);
    let newLeft = left + (e.clientX - startX) / WIDTH * 100;
    newLeft = rangeValue(newLeft, 0, 100 - width);
    setLeft(newLeft);
    // console.log('Width Height', WIDTH, HEIGHT);
    // console.log('start', startX, startY, 'end', e.clientX, e.clientY, 'topleft', top, left, newTop, newLeft);
    setStartX(e.clientX);
    setStartY(e.clientY);
  }
  const dragEnd = (e) => {
    item.top = top;
    item.left = left;
    props.action(item);
  }
  const cornerDragStart = (e) => {
    setStartX(e.clientX);
    setStartY(e.clientY);
  }

  const cornerDrag = (e, pos) => {
    let newTop = top;
    let newLeft = left;
    let newWidth = width;
    let newHeight = height;
    if (pos === 'tl') {
      newTop = top + (e.clientY - startY) / HEIGHT * 100;
      newLeft = left + (e.clientX - startX) / WIDTH * 100;
      newWidth = width - (e.clientX - startX) / WIDTH * 100;
      newHeight = height - (e.clientY - startY) / HEIGHT * 100;
      newTop = rangeValue(newTop, 0, top + newHeight - 1, top);
      newLeft = rangeValue(newLeft, 0, left + newWidth - 1, left);
      newWidth = rangeValue(newWidth, 1, 100 - left);
      newHeight = rangeValue(newHeight, 1, 100 - top);
    } else if (pos === 'tr') {
      newTop = top + (e.clientY - startY) / HEIGHT * 100;
      newWidth = width + (e.clientX - startX) / WIDTH * 100;
      newHeight = height - (e.clientY - startY) / HEIGHT * 100;
      newTop = rangeValue(newTop, 0, top + newHeight - 1, top);
      newWidth = rangeValue(newWidth, 1, 100 - left);
      newHeight = rangeValue(newHeight, 1, 100 - top);
    } else if (pos === 'bl') {
      newLeft = left + (e.clientX - startX) / WIDTH * 100;
      newWidth = width - (e.clientX - startX) / WIDTH * 100;
      newHeight = height + (e.clientY - startY) / HEIGHT * 100;
      newLeft = rangeValue(newLeft, 0, left + newWidth - 1, left);
      newWidth = rangeValue(newWidth, 1, 100 - left);
      newHeight = rangeValue(newHeight, 1, 100 - top);
    } else {
      newWidth = width + (e.clientX - startX) / WIDTH * 100;
      newHeight = height + (e.clientY - startY) / HEIGHT * 100;
      newWidth = rangeValue(newWidth, 1, 100 - left);
      newHeight = rangeValue(newHeight, 1, 100 - top);
    }
    setStartX(e.clientX);
    setStartY(e.clientY);
    // console.log('corner drag', pos, e.clientX, e.clientY, 'new', newTop, newLeft, newWidth, newHeight);
    setTop(newTop);
    setLeft(newLeft);
    setWidth(newWidth);
    setHeight(newHeight);
  }

  const cornerDragEnd = (e) => {
    item.top = top;
    item.left = left;
    item.width = width;
    item.height = height;
    props.action(item);
  }
  return (
    <>
      <div style={topLeftStyle} className='edit-corner'
        draggable
        onDragStart={(e) => { cornerDragStart(e) }}
        onDragEnd={cornerDragEnd}
        onDrag={e => cornerDrag(e, 'tl')}
      ></div>
      <div style={topRightStyle} className='edit-corner'
        draggable
        onDragStart={(e) => { cornerDragStart(e) }}
        onDragEnd={cornerDragEnd}
        onDrag={e => cornerDrag(e, 'tr')}></div>
      <div style={bottomLeftStyle} className='edit-corner'
        draggable
        onDragStart={(e) => { cornerDragStart(e) }}
        onDragEnd={cornerDragEnd}
        onDrag={e => cornerDrag(e, 'bl')}></div>
      <div style={bottomRightStyle} className='edit-corner'
        draggable
        onDragStart={(e) => { cornerDragStart(e) }}
        onDragEnd={cornerDragEnd}
        onDrag={e => cornerDrag(e, 'br')}
      ></div>
      <div style={editBoxStyle} className='edit-box'
        onMouseDown={boxMouseDown}
        onMouseUp={boxMouseUp}
        draggable
        onDrag={dragBox}
        onDragStart={dragStart}
        onDragEnd={dragEnd}
      ></div>
    </>
  );
}

export default EditBorder;
