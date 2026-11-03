import React, { useState, cloneElement } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { loadHistoryRecords } from '../services/presentationStorage';

function PresentationHistoryDialog (props) {
  const { presentationId } = props;
  const [show, setShow] = useState(false);
  const [history, setHistory] = useState([]);

  const handleShow = () => {
    setHistory(loadHistoryRecords(presentationId));
    setShow(true);
  };
  const handleClose = () => {
    setShow(false);
  };
  const handleAction = (record) => {
    handleClose();
    props.action(record);
  };

  return (
    <>
      {cloneElement(props.switcher, { onClick: handleShow })}

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Restore a recent version</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="history-box">
            {history.map((record, index) => {
              return (
                <button
                  type="button"
                  className="history-item"
                  key={index}
                  onClick={() => {
                    handleAction(record);
                  }}
                >
                  <strong>{record.name}</strong><span>{record.slides.length} {record.slides.length === 1 ? 'slide' : 'slides'} · {new Date(record.time).toLocaleString()}</span>
                </button>
              );
            })}
          </div>
          {!history.length && <p>No recent versions yet. Your next edit will appear here.</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default PresentationHistoryDialog;
