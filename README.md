# AishwaryaBuddaraju_21bce7367
# Chess-Like Game

A turn-based chess-like game with a 5x5 grid and WebSocket communication. Players take turns moving their characters with unique abilities and the game ends when one player eliminates all of the opponent's characters.

![chesslikegame_21bce7367](https://github.com/user-attachments/assets/b9598134-33a3-44f4-9a99-84f94b106567)



## Project Structure

The project is organized into two main parts:
1. **Server**: Handles game logic and WebSocket communication.
2. **Client**: Provides the user interface and interacts with the server via WebSocket.

## Prerequisites

- Node.js and npm installed on your machine.
- A WebSocket-compatible browser or environment.

## Setup and Run Instructions

### Server

1. **Navigate to the server directory**:
    ```bash
    cd server
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Start the server**:
    ```bash
    node server.js
    ```
   The server will start and listen on port `8080`.

### Client

1. **Navigate to the client directory**:
    ```bash
    cd client
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Start the client**:
    ```bash
    npm start
    ```
   The client will start and be accessible at `http://localhost:3000`.

## Usage

1. **Open the Client**: Navigate to `http://localhost:3000` in your web browser.
2. **Play the Game**: The game board will be displayed. Click on a cell to select a character and then click on a destination cell to move the character.
3. **Reset the Game**: Click the "Reset Game" button to restart the game.

## WebSocket Communication

- **Server**:
  - Listens for WebSocket connections on port `8080`.
  - Supports the following message types:
    - `MOVE`: For sending move actions.
    - `RESET`: For resetting the game state.
    - `INITIAL_STATE`: Sent to new clients with the initial game state.
    - `UPDATE_STATE`: Sent to all clients when the game state updates.
    - `GAME_OVER`: Sent when the game ends, announcing the winner.

- **Client**:
  - Connects to the WebSocket server at `ws://localhost:8080`.
  - Sends move and reset messages to the server.
  - Listens for state updates and game over messages from the server.

## Development

- **Server**: Located in the `server` directory.
  - Main file: `server.js`
- **Client**: Located in the `client` directory.
  - Main file: `src/GameBoard.js`

## Contributing

Feel free to submit issues and pull requests. Contributions to improve the game and add new features are welcome!


## Contact

For any questions or suggestions, please contact [Aishwarya](mailto:aishwaryavarma.buddaraju@gmail.com).

