import React, { useState, useEffect } from 'react';
import './GameBoard.css';

// Function to create an empty 5x5 board
const createEmptyBoard = () => Array(5).fill(null).map(() => Array(5).fill(''));

function GameBoard() {
  // State to hold the game state, WebSocket connection, and selected character
  const [state, setState] = useState({
    board: createEmptyBoard(),
    currentTurn: 'A',
    scores: { A: 0, B: 0 },
    moveHistory: [],
  });
  const [ws, setWs] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  // Effect to initialize WebSocket connection when the component mounts
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');

    // On WebSocket connection open, set the WebSocket state
    socket.onopen = () => {
      console.log('WebSocket connection established');
      setWs(socket);
    };

    // On receiving a message from the WebSocket, update the game state
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'INITIAL_STATE' || message.type === 'UPDATE_STATE') {
        setState(prevState => ({
          ...prevState,
          board: message.data.board,
          currentTurn: message.data.currentTurn,
          moveHistory: message.data.moveHistory,
          scores: message.data.scores,
        }));
        console.log('State updated:', message.data);
      } else if (message.type === 'GAME_OVER') {
        alert(`Game over! Player ${message.winner} wins!`);
      }
    };

    // Handle WebSocket errors
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Cleanup WebSocket connection on component unmount
    return () => socket.close();
  }, []);

  // Handle cell clicks to either select a character or move a character
  const handleCellClick = (x, y) => {
    if (!ws) return;
  
    if (!selectedCharacter) {
      // Select the character if a cell contains the player's character
      const character = state.board[x][y];
      if (character && character[0] === state.currentTurn) {
        setSelectedCharacter({ x, y, character });
      }
    } else {
      // Calculate the move direction and send move data via WebSocket
      const direction = getMoveDirection(selectedCharacter.x, selectedCharacter.y, x, y);
      if (direction) {
        const move = {
          player: state.currentTurn,
          character: selectedCharacter.character.split('-')[1],
          from: { x: selectedCharacter.x, y: selectedCharacter.y },
          to: { x, y },
          direction,
        };
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'MOVE', data: move }));
        }
        setSelectedCharacter(null);
      }
    }
  };

  // Get move direction based on start and end positions
  const getMoveDirection = (startX, startY, endX, endY) => {
    const dx = endX - startX;
    const dy = endY - startY;

    if (dx === 0 && dy === -1) return 'L';
    if (dx === 0 && dy === 1) return 'R';
    if (dx === -1 && dy === 0) return 'F';
    if (dx === 1 && dy === 0) return 'B';
    if (dx === -2 && dy === -2) return 'FL';
    if (dx === -2 && dy === 2) return 'FR';
    if (dx === 2 && dy === -2) return 'BL';
    if (dx === 2 && dy === 2) return 'BR';

    return null;
  };

  // Render the game board
  const renderBoard = () => {
    return state.board.map((row, i) => (
      <tr key={i}>
        {row.map((cell, j) => (
          <td
            key={j}
            onClick={() => handleCellClick(i, j)}
            className={selectedCharacter && selectedCharacter.x === i && selectedCharacter.y === j ? 'selected' : ''}
          >
            {cell}
          </td>
        ))}
      </tr>
    ));
  };

  // Handle resetting the game by sending a RESET message via WebSocket
  const handleReset = () => {
    if (ws) {
      ws.send(JSON.stringify({ type: 'RESET' }));
    }
  };

  // Render move history
  const renderMoveHistory = () => {
    return (state.moveHistory || []).map((move, index) => (
      <li key={index}>
        {`Player ${move.player} moved ${move.character} ${move.direction} from (${move.from.x}, ${move.from.y}) to (${move.to.x}, ${move.to.y})`}
      </li>
    ));
  };
  
  return (
    <div className="game-board">
      <h1>Chess-Like Game</h1>
      <div className="game-content">
        <div className="board-container">
          <div id="current-player" className="current-player">
            Current Player: {state.currentTurn ? `Player ${state.currentTurn}` : ''}
          </div>
          <table>
            <tbody>{renderBoard()}</tbody>
          </table>
          <button onClick={handleReset}>Reset Game</button>
        </div>
        <div className="move-history-container">
          <h2>Move History</h2>
          <ul id="moveHistory" className="move-history">
            {renderMoveHistory()}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default GameBoard;
