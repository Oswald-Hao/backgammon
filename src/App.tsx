import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';

const BOARD_SIZE = 15;

function checkWin(board: number[][], x: number, y: number, color: number) {
  const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
  for (const [dx, dy] of dirs) {
    let count = 1;
    const line = [{x, y}];
    
    for (let i = 1; i <= 4; i++) {
      const nx = x + dx * i;
      const ny = y + dy * i;
      if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[ny][nx] === color) {
        count++;
        line.push({x: nx, y: ny});
      } else {
        break;
      }
    }
    
    for (let i = 1; i <= 4; i++) {
      const nx = x - dx * i;
      const ny = y - dy * i;
      if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[ny][nx] === color) {
        count++;
        line.push({x: nx, y: ny});
      } else {
        break;
      }
    }
    
    if (count >= 5) {
      // Sort the line so the stroke draws correctly from end to end
      line.sort((a, b) => a.x !== b.x ? a.x - b.x : a.y - b.y);
      return line;
    }
  }
  return null;
}

function getScore(board: number[][], x: number, y: number, color: number) {
  let score = 0;
  const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
  for (const [dx, dy] of dirs) {
    let leftSpace = 0;
    let rightSpace = 0;

    // Forward space
    for (let i = 1; i <= 4; i++) {
      const nx = x + dx * i;
      const ny = y + dy * i;
      if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break;
      if (board[ny][nx] === color || board[ny][nx] === 0) {
        rightSpace++;
      } else {
        break;
      }
    }

    // Backward space
    for (let i = 1; i <= 4; i++) {
      const nx = x - dx * i;
      const ny = y - dy * i;
      if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break;
      if (board[ny][nx] === color || board[ny][nx] === 0) {
        leftSpace++;
      } else {
        break;
      }
    }

    if (leftSpace + rightSpace + 1 < 5) {
      continue;
    }

    let count = 1;
    let block = 0;
    
    // Forward count
    for (let i = 1; i <= 4; i++) {
      const nx = x + dx * i;
      const ny = y + dy * i;
      if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) {
        block++;
        break;
      }
      if (board[ny][nx] === color) {
        count++;
      } else if (board[ny][nx] === 0) {
        break;
      } else {
        block++;
        break;
      }
    }
    
    // Backward count
    for (let i = 1; i <= 4; i++) {
      const nx = x - dx * i;
      const ny = y - dy * i;
      if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) {
        block++;
        break;
      }
      if (board[ny][nx] === color) {
        count++;
      } else if (board[ny][nx] === 0) {
        break;
      } else {
        block++;
        break;
      }
    }

    if (count >= 5) score += 1000000;
    else if (count === 4) {
      if (block === 0) score += 100000;
      else if (block === 1) score += 10000;
    }
    else if (count === 3) {
      if (block === 0) score += 10000;
      else if (block === 1) score += 1000;
    }
    else if (count === 2) {
      if (block === 0) score += 1000;
      else if (block === 1) score += 100;
    }
    else if (count === 1) {
      if (block === 0) score += 100;
      else if (block === 1) score += 10;
    }
  }
  return score;
}

function getBestMove(board: number[][]) {
  let bestScore = -1;
  let bestMoves: {x: number, y: number}[] = [];

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === 0) {
        const attackScore = getScore(board, x, y, 2);
        const defenseScore = getScore(board, x, y, 1);
        
        const score = attackScore + defenseScore * 0.9;

        if (score > bestScore) {
          bestScore = score;
          bestMoves = [{ x, y }];
        } else if (score === bestScore) {
          bestMoves.push({ x, y });
        }
      }
    }
  }

  if (bestMoves.length === 0) {
    if (board[Math.floor(BOARD_SIZE/2)][Math.floor(BOARD_SIZE/2)] === 0) {
      return { x: Math.floor(BOARD_SIZE/2), y: Math.floor(BOARD_SIZE/2) };
    }
    return null;
  }
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

export default function App() {
  const [board, setBoard] = useState<number[][]>(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0)));
  const [currentPlayer, setCurrentPlayer] = useState<number>(1); // 1: Player (Black), 2: AI (White)
  const [winner, setWinner] = useState<number>(0);
  const [winningLine, setWinningLine] = useState<{x: number, y: number}[]>([]);

  const resetGame = () => {
    setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0)));
    setCurrentPlayer(1);
    setWinner(0);
    setWinningLine([]);
  };

  const handleClick = (x: number, y: number) => {
    if (winner !== 0 || board[y][x] !== 0 || currentPlayer !== 1) return;

    const newBoard = board.map(row => [...row]);
    newBoard[y][x] = 1;
    setBoard(newBoard);
    
    const winLine = checkWin(newBoard, x, y, 1);
    if (winLine) {
      setWinner(1);
      setWinningLine(winLine);
      return;
    }

    if (newBoard.every(row => row.every(cell => cell !== 0))) {
      setWinner(3);
      return;
    }

    setCurrentPlayer(2);
  };

  useEffect(() => {
    if (currentPlayer === 2 && winner === 0) {
      const timer = setTimeout(() => {
        const move = getBestMove(board);
        if (move) {
          const newBoard = board.map(row => [...row]);
          newBoard[move.y][move.x] = 2;
          setBoard(newBoard);
          
          const winLine = checkWin(newBoard, move.x, move.y, 2);
          if (winLine) {
            setWinner(2);
            setWinningLine(winLine);
            return;
          }

          if (newBoard.every(row => row.every(cell => cell !== 0))) {
            setWinner(3);
            return;
          }

          setCurrentPlayer(1);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, board, winner]);

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="max-w-3xl w-full flex flex-col items-center gap-8">
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-stone-800 tracking-tight">Gomoku</h1>
          <p className="text-stone-500 font-medium">Play against AI</p>
        </div>

        <div className="flex items-center justify-between w-full max-w-[600px] px-4 py-3 bg-white rounded-2xl shadow-sm border border-stone-200">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${currentPlayer === 1 ? 'bg-black shadow-md' : 'bg-stone-300'}`} />
            <span className={`font-semibold ${currentPlayer === 1 ? 'text-stone-900' : 'text-stone-400'}`}>You (Black)</span>
          </div>
          
          <div className="text-sm font-bold text-stone-400 uppercase tracking-wider">
            {winner === 1 && <span className="text-emerald-600">You Win!</span>}
            {winner === 2 && <span className="text-rose-600">AI Wins!</span>}
            {winner === 3 && <span className="text-amber-600">Draw!</span>}
            {winner === 0 && <span>Vs</span>}
          </div>

          <div className="flex items-center gap-3">
            <span className={`font-semibold ${currentPlayer === 2 ? 'text-stone-900' : 'text-stone-400'}`}>AI (White)</span>
            <div className={`w-4 h-4 rounded-full border border-stone-300 ${currentPlayer === 2 ? 'bg-white shadow-md' : 'bg-stone-100'}`} />
          </div>
        </div>

        <div className="relative w-full max-w-[600px] aspect-square bg-[#DEB887] border-[12px] border-[#8B5A2B] shadow-2xl rounded-sm p-2">
          <svg width="100%" height="100%" className="absolute top-0 left-0 pointer-events-none">
            {Array.from({ length: BOARD_SIZE }).map((_, i) => {
              const pos = `${(i + 0.5) * (100 / BOARD_SIZE)}%`;
              const start = `${0.5 * (100 / BOARD_SIZE)}%`;
              const end = `${100 - 0.5 * (100 / BOARD_SIZE)}%`;
              return (
                <g key={i}>
                  <line x1={start} y1={pos} x2={end} y2={pos} stroke="#5c4033" strokeWidth="1.5" />
                  <line x1={pos} y1={start} x2={pos} y2={end} stroke="#5c4033" strokeWidth="1.5" />
                </g>
              );
            })}
            {[3, 7, 11].map(x => 
              [3, 7, 11].map(y => (
                <circle 
                  key={`${x}-${y}`}
                  cx={`${(x + 0.5) * (100 / BOARD_SIZE)}%`} 
                  cy={`${(y + 0.5) * (100 / BOARD_SIZE)}%`} 
                  r="4" 
                  fill="#5c4033" 
                />
              ))
            )}
            {winningLine.length > 0 && (
              <line
                x1={`${(winningLine[0].x + 0.5) * (100 / BOARD_SIZE)}%`}
                y1={`${(winningLine[0].y + 0.5) * (100 / BOARD_SIZE)}%`}
                x2={`${(winningLine[winningLine.length - 1].x + 0.5) * (100 / BOARD_SIZE)}%`}
                y2={`${(winningLine[winningLine.length - 1].y + 0.5) * (100 / BOARD_SIZE)}%`}
                stroke="#ef4444"
                strokeWidth="6"
                strokeLinecap="round"
                className="animate-pulse drop-shadow-md"
              />
            )}
          </svg>
          
          <div className="absolute top-0 left-0 w-full h-full grid" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`, gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)` }}>
            {board.map((row, y) => 
              row.map((cell, x) => (
                <div 
                  key={`${x}-${y}`} 
                  className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-black/5 transition-colors"
                  onClick={() => handleClick(x, y)}
                >
                  {cell !== 0 && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`rounded-full shadow-[2px_2px_5px_rgba(0,0,0,0.5)] w-[85%] h-[85%] ${
                        cell === 1 
                          ? 'bg-gradient-to-br from-gray-700 to-black' 
                          : 'bg-gradient-to-br from-white to-gray-300'
                      }`}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <button
          onClick={resetGame}
          className="flex items-center gap-2 px-6 py-3 bg-stone-800 hover:bg-stone-900 text-white rounded-full font-medium transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Restart Game
        </button>

      </div>
    </div>
  );
}
