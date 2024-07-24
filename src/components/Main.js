import React, { useState, useEffect, useRef } from 'react';
import Grid from './Grid';
import boardCollection from '../data/boardData';
import '../App.css';

const Main = () => {
  const [difficulty, setDifficulty] = useState('easy');
  const [gridProps, setGridProps] = useState({
    letters: [],
    answers: [],
    gridSize: 3,
  });
  const gridRef = useRef();

  const handleDifficultyChange = (newDifficulty) => {
    try {
      setDifficulty(newDifficulty);
      loadNewGame(newDifficulty);
      if (gridRef.current && gridRef.current.resetHints) {
        gridRef.current.resetHints();
      }
    } catch (error) {
      console.error('Failed to change difficulty:', error);
    }
  };

  const loadNewGame = (newDifficulty) => {
    const difficultyLevels = boardCollection[newDifficulty];
    const levelKeys = Object.keys(difficultyLevels);
    const randomIndex = Math.floor(Math.random() * levelKeys.length);
    const randomLevel = difficultyLevels[levelKeys[randomIndex]];
    const { letters, answers } = randomLevel;

    if (!Array.isArray(letters)) {
      throw new Error('Invalid letters format');
    }

    // 初始化游戏状态
    if (gridRef.current && gridRef.current.resetGameState) {
      gridRef.current.resetGameState();
    }

    setGridProps({
      letters,
      answers,
      gridSize: newDifficulty === 'easy' ? 3 : newDifficulty === 'medium' ? 4 : 5,
    });
  };

  useEffect(() => {
    loadNewGame('easy'); // 默认加载 'easy' 难度的内容
  }, []);

  return (
    <div className="main">
      <div className="difficulty">
        {['easy', 'medium', 'hard'].map((level) => (
          <button
            key={level}
            style={{ backgroundColor: difficulty === level ? '#F0CF61' : 'ivory' }}
            onClick={() => handleDifficultyChange(level)}
          >
            {level.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="gridboard">
        <Grid 
          ref={gridRef} 
          {...gridProps} 
          loadNewGame={loadNewGame} 
          difficulty={difficulty} 
          setGridProps={setGridProps} 
          boardCollection={boardCollection} 
        />
      </div>
    </div>
  );
};

export default Main;
