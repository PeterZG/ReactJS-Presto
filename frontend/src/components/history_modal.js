import React, { useState, cloneElement, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { loadHistoryRecords } from './storage';

function HistoryModal (props) {
  const { presentationId } = props;
  const [show, setShow] = useState(false);
  const [history, setHistory] = useState([]);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const records = loadHistoryRecords(presentationId);
    console.log('retrive history. preId', presentationId, records);
    setHistory(records);
  }, [time, presentationId]);

  const handleShow = () => {
    setTime(new Date().getTime());
    setShow(true);
  }
  const handleClose = () => {
    setShow(false);
  }
  const handleAction = (record) => {
    handleClose();
    props.action(record);
  }

  function timeStr (time) {
    const date = new Date(time);
    const str = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() +
      ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + '.' +
      date.getMilliseconds();
    return str;
  }

  return (
    <>
      {cloneElement(props.switcher, { onClick: handleShow })}

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Please input</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='history-box'>
            {history.map((record, index) => {
              return <div className='history-item' key={index} onClick={() => {
                handleAction(record);
              }}>{timeStr(record.time)}</div>
            })}

          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleClose}>
            Close
          </Button>
          <Button variant='primary' onClick={handleAction}>
            {props.actionText || 'OK'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default HistoryModal;
