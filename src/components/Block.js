import React from 'react';
import '../App.css';

const Block = ({ letter, index, onMouseDown, onMouseEnter, isSelected }) => {
    return (
        <div
            className={`block ${isSelected ? 'selected' : ''}`}
            onMouseDown={() => onMouseDown(letter, index)}
            onMouseEnter={() => onMouseEnter(letter, index)}
        >
            {letter}
        </div>
    );
};

export default Block;
