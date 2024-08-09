import React from 'react';
import '../App.css';

const NoticeModal = ({ onClose, onNextGame, message }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <p>{message}</p>        
        <button onClick={onNextGame}>⏩NEXT</button>
        <button onClick={onClose}>❌CLOSE</button>
      </div>
    </div>
  );
};

export default NoticeModal;
