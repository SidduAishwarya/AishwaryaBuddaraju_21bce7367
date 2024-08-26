const http = require('http');
const WebSocket = require('ws');
const express = require('express');
const app = express();

// Create an HTTP server and attach it to the Express app
const server = http.createServer(app);
// Create a WebSocket server that uses the HTTP server
const wss = new WebSocket.Server({ server });

// Initial game state
let gameState = {
  board: [
    ['A-P1', 'A-P2', 'A-H1', 'A-H2', 'A-P3'], // Player A's pieces
    ['', '', '', '', ''],                     // Empty row
    ['', '', '', '', ''],                     // Empty row
    ['', '', '', '', ''],                     // Empty row
    ['B-P1', 'B-P2', 'B-H1', 'B-H2', 'B-P3'], // Player B's pieces
  ],
  currentTurn: 'A', // Track whose turn it is
  moveHistory: [],  // Log of all moves made in the game
  scores: { A: 0, B: 0 }, // Scores for each player
};

// Handle new WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected');
  // Send the initial game state to the newly connected client
  ws.send(JSON.stringify({ type: 'INITIAL_STATE', data: gameState }));

  // Handle incoming messages from clients
  ws.on('message', (message) => {
    try {
      const { type, data } = JSON.parse(message);

      if (type === 'MOVE') {
        handleMove(data); // Process a move
      } else if (type === 'RESET') {
        resetGame(); // Reset the game
      } else {
        console.error(`Unknown message type: ${type}`); // Handle unknown message types
      }

      // Broadcast updated game state to all connected clients
      broadcastState();
    } catch (error) {
      console.error('Error processing message:', error); // Handle JSON parsing errors
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Function to handle player moves
const handleMove = (moveData) => {
  const { player, character, direction, from, to } = moveData;

  // Check if it's the player's turn
  if (gameState.currentTurn !== player) return;

  // Validate the move
  if (!isValidMove(from, to, direction)) return;

  // Find the character's current position
  const characterPosition = findCharacterPosition(player, character, from);
  if (!characterPosition) return;

  // Special handling for 'H1' and 'H2' characters
  if (character === 'H1' || character === 'H2') {
    // Move in a straight line and check all cells between start and end positions for enemies
    const dx = to.x > from.x ? 1 : (to.x < from.x ? -1 : 0);
    const dy = to.y > from.y ? 1 : (to.y < from.y ? -1 : 0);

    let x = from.x;
    let y = from.y;

    while (x !== to.x || y !== to.y) {
      x += dx;
      y += dy;

      if (gameState.board[x][y] && gameState.board[x][y][0] !== player) {
        // Remove opponent's piece and update score
        gameState.board[x][y] = '';
        gameState.scores[player]++;
      }
    }
  }

  // Update the board with the new piece position
  gameState.board[to.x][to.y] = `${player}-${character}`;
  gameState.board[from.x][from.y] = '';

  // Add the move to the history
  gameState.moveHistory.push({
    player,
    character,
    direction,
    from,
    to
  });

  // Switch to the other player's turn
  gameState.currentTurn = player === 'A' ? 'B' : 'A';

  // Check if the game is over
  checkGameOver();
};

// Function to broadcast the updated game state to all clients
const broadcastState = () => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'UPDATE_STATE', data: gameState }));
    }
  });
};

// Function to reset the game state to the initial configuration
const resetGame = () => {
  gameState = {
    board: [
      ['A-P1', 'A-P2', 'A-H1', 'A-H2', 'A-P3'],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['B-P1', 'B-P2', 'B-H1', 'B-H2', 'B-P3'],
    ],
    currentTurn: 'A',
    moveHistory: [],
    scores: { A: 0, B: 0 },
  };

  broadcastState(); // Notify all clients of the reset
};

// Check if a position is within the bounds of the board
const isValidPosition = (x, y) => x >= 0 && x < 5 && y >= 0 && y < 5;

// Get the target position based on the direction of movement
const getTargetPosition = (x, y, direction) => {
  const moves = {
    'L': { x, y: y - 1 }, // Move left
    'R': { x, y: y + 1 }, // Move right
    'F': { x: x - 1, y }, // Move forward
    'B': { x: x + 1, y }, // Move backward
    'FL': { x: x - 2, y: y - 2 }, // Move forward-left
    'FR': { x: x - 2, y: y + 2 }, // Move forward-right
    'BL': { x: x + 2, y: y - 2 }, // Move backward-left
    'BR': { x: x + 2, y: y + 2 }, // Move backward-right
  };

  const target = moves[direction];
  return target && isValidPosition(target.x, target.y) ? target : null;
};

// Validate if a move from one position to another is possible in the given direction
const isValidMove = (from, to, direction) => {
  const target = getTargetPosition(from.x, from.y, direction);
  return target && target.x === to.x && target.y === to.y;
};

// Find the position of a character on the board
const findCharacterPosition = (player, character, position) => {
  return gameState.board[position.x][position.y] === `${player}-${character}` ? position : null;
};

// Check if the game is over (i.e., a player has no remaining characters)
const checkGameOver = () => {
  const hasNoCharacters = (player) => {
    return gameState.board.flat().every(cell => !cell || cell[0] !== player);
  };

  if (hasNoCharacters('A')) {
    broadcastState();
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'GAME_OVER', winner: 'B' }));
      }
    });
  } else if (hasNoCharacters('B')) {
    broadcastState();
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'GAME_OVER', winner: 'A' }));
      }
    });
  }
};

// Start the server and listen on port 8080
server.listen(8080, () => {
  console.log('Server is listening on port 8080');
});
