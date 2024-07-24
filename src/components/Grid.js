import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import Block from "./Block";
import NoticeModal from "./NoticeModal";
import "../App.css";
import { Cloudinary } from "@cloudinary/url-gen";
import confetti from "./confetti";

const cld = new Cloudinary({
  cloud: {
    cloudName: "dwkccmb6g",
  },
});

const Grid = forwardRef(
  (
    {
      gridSize = 3,
      letters,
      answers,
      loadNewGame,
      difficulty,
      setGridProps,
      boardCollection,
    },
    ref
  ) => {
    const [selectedBlocks, setSelectedBlocks] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [foundWords, setFoundWords] = useState([]);
    const [gameCompleted, setGameCompleted] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [revealedLetters, setRevealedLetters] = useState({});
    const [modalMessage, setModalMessage] = useState(""); // 新增状态用于保存modal消息
    const maxHints = 5;
    const gridRef = useRef(null);

    useImperativeHandle(ref, () => ({
      resetHints() {
        setHintsUsed(0);
        setRevealedLetters({});
      },
      resetGameState() {
        setFoundWords([]);
        setHintsUsed(0);
        setRevealedLetters({});
        setGameCompleted(false);
      },
    }));

    const handleMouseDown = (letter, index) => {
      setIsDragging(true);
      setSelectedBlocks([{ letter, index }]);
    };

    const handleMouseEnter = (letter, index) => {
      if (isDragging) {
        const lastBlock = selectedBlocks[selectedBlocks.length - 1];
        if (lastBlock && lastBlock.index !== index) {
          const currentRow = Math.floor(index / gridSize);
          const currentCol = index % gridSize;
          const lastRow = Math.floor(lastBlock.index / gridSize);
          const lastCol = lastBlock.index % gridSize;
          const isAdjacent =
            Math.abs(currentRow - lastRow) <= 1 &&
            Math.abs(currentCol - lastCol) <= 1;

          if (isAdjacent) {
            const lastIndex = selectedBlocks.findIndex(
              (block) => block.index === index
            );
            if (lastIndex !== -1) {
              setSelectedBlocks(selectedBlocks.slice(0, lastIndex + 1));
            } else {
              setSelectedBlocks((prev) => [...prev, { letter, index }]);
            }
          }
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      const selectedWord = selectedBlocks.map((block) => block.letter).join("");
      if (
        answers.includes(selectedWord) &&
        !foundWords.includes(selectedWord)
      ) {
        setFoundWords((prev) => [...prev, selectedWord]);
      }
      setSelectedBlocks([]);
    };

    useEffect(() => {
      if (foundWords.length === answers.length && answers.length > 0) {
        setGameCompleted(true);
        setIsModalOpen(true);
        displayConfetti();

        // 生成随机消息
        const messages = [
          "Well done!",
          "Awesome!",
          "You found all the words!",
          "You are on fire!",
          "Congratulations!",
        ];
        const randomIndex = Math.floor(Math.random() * messages.length);
        setModalMessage(messages[randomIndex]);
      }
    }, [foundWords, answers.length]);

    useEffect(() => {
      const handleMouseUpGlobal = () => {
        if (isDragging) {
          setIsDragging(false);
        }
      };

      document.addEventListener("mouseup", handleMouseUpGlobal);
      const adjustGridWrapperWidth = () => {
        if (gridRef.current) {
          const gridHeight = gridRef.current.offsetHeight;
          gridRef.current.parentNode.style.width = `${gridHeight}px`;
        }
      };

      adjustGridWrapperWidth();

      window.addEventListener("resize", adjustGridWrapperWidth);

      return () => {
        window.removeEventListener("resize", adjustGridWrapperWidth);
        document.removeEventListener("mouseup", handleMouseUpGlobal);
      };
    }, [isDragging]);

    const calculateLinePosition = (block) => {
      const blockElement = gridRef.current.children[block.index];
      const rect = blockElement.getBoundingClientRect();
      const gridRect = gridRef.current.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2 - gridRect.left,
        y: rect.top + rect.height / 2 - gridRect.top,
      };
    };

    const handleNextGame = () => {
      setIsModalOpen(false);
      loadNewGame(difficulty);
      stopConfetti();
    };

    const handleClose = () => {
      setIsModalOpen(false);
      stopConfetti();
    };

    const handleHint = () => {
      if (hintsUsed < maxHints && !gameCompleted) {
        const remainingAnswers = answers.filter(
          (answer) => !foundWords.includes(answer)
        );
        if (remainingAnswers.length > 0) {
          let randomAnswer;
          do {
            randomAnswer =
              remainingAnswers[
                Math.floor(Math.random() * remainingAnswers.length)
              ];
          } while (foundWords.includes(randomAnswer));

          const unrevealedLetters = randomAnswer
            .split("")
            .filter((char, index) => {
              return (
                !revealedLetters[randomAnswer] ||
                !revealedLetters[randomAnswer].includes(index)
              );
            });

          if (unrevealedLetters.length > 0) {
            const randomIndex = randomAnswer.indexOf(
              unrevealedLetters[
                Math.floor(Math.random() * unrevealedLetters.length)
              ]
            );
            setRevealedLetters((prev) => {
              return {
                ...prev,
                [randomAnswer]: prev[randomAnswer]
                  ? [...prev[randomAnswer], randomIndex]
                  : [randomIndex],
              };
            });
          }
        }

        setHintsUsed((prev) => prev + 1);

        // 检查是否所有单词的字母都已显示出来
        let allLettersRevealed = true;
        for (const answer of answers) {
          if (
            !revealedLetters[answer] ||
            revealedLetters[answer].length < answer.length
          ) {
            allLettersRevealed = false;
            break;
          }
        }

        if (allLettersRevealed || foundWords.length === answers.length) {
          setGameCompleted(true);
          setIsModalOpen(true);
          displayConfetti();

          // 生成随机消息
          const messages = [
            "Well done!",
            "Awesome!",
            "You found all the words!",
            "You are on fire!",
            "Congratulations!",
          ];
          const randomIndex = Math.floor(Math.random() * messages.length);
          setModalMessage(messages[randomIndex]);
        }
      }
    };

    const hintImages = {
      5: "https://res.cloudinary.com/dwkccmb6g/image/upload/v1721627632/petal5_lwvwtr.png",
      4: "https://res.cloudinary.com/dwkccmb6g/image/upload/v1721627632/petal4_wwpli1.png",
      3: "https://res.cloudinary.com/dwkccmb6g/image/upload/v1721627632/petal3_hm6ynb.png",
      2: "https://res.cloudinary.com/dwkccmb6g/image/upload/v1721627632/petal2.png",
      1: "https://res.cloudinary.com/dwkccmb6g/image/upload/v1721627632/petal1.png",
    };

    const remainingHints = maxHints - hintsUsed;
    const hintImageUrl = hintImages[remainingHints];

    const displayConfetti = () => {
      setTimeout(function () {
        confetti.start();
      });
    };

    const stopConfetti = () => {
      setTimeout(function () {
        confetti.stop();
      });
    };

    return (
      <div className="board-container">
        <div className="grid-wrapper">
          <div
            className="grid"
            ref={gridRef}
            onMouseLeave={handleMouseUp}
            onMouseUp={handleMouseUp}
            style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
          >
            {letters.map((letter, index) => (
              <Block
                key={index}
                letter={letter}
                index={index}
                onMouseDown={handleMouseDown}
                onMouseEnter={handleMouseEnter}
                isSelected={selectedBlocks.some(
                  (block) => block.index === index
                )}
              />
            ))}
            <svg className="line-drawer">
              {selectedBlocks.map((block, index) => {
                if (index === 0) return null;
                const start = calculateLinePosition(selectedBlocks[index - 1]);
                const end = calculateLinePosition(block);
                return (
                  <line
                    key={index}
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="rgb(29, 68, 150)"
                    strokeWidth="4"
                  />
                );
              })}
            </svg>
          </div>
        </div>

        <div className="answer-wrapper">
          <div className="answer-block">
            {answers.map((answer, index) => (
              <div key={index} className="answer">
                {answer.split("").map((char, charIndex) => (
                  <span key={charIndex} className="answer-box">
                    {foundWords.includes(answer) ||
                    (revealedLetters[answer] &&
                      revealedLetters[answer].includes(charIndex))
                      ? char
                      : ""}
                  </span>
                ))}
              </div>
            ))}
          </div>

          <div className="hint">
            {hintImageUrl && (
              <img src={hintImageUrl} alt={`hint${remainingHints}`} />
            )}
            <button
              onClick={handleHint}
              disabled={hintsUsed >= maxHints}
              style={{
                backgroundColor: hintsUsed >= maxHints ? "darkgrey" : "ivory",
              }}
            >
              HINT
            </button>
          </div>
        </div>

        {isModalOpen && gameCompleted && (
          <NoticeModal
            onClose={handleClose}
            onNextGame={handleNextGame}
            message={modalMessage} // 传递modalMessage到NoticeModal
          />
        )}
      </div>
    );
  }
);

export default Grid;
