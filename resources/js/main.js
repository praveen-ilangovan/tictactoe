/**
 * TicTacToe : Game logic
 */

class TicTacToe {

	static WIN = 1;
	static TIE = 0;
	static CONTINUE = -1;

	// AI
	static MIN = -1000;
	static MAX = 1000;
	static WIN_SCORE = 10;
	static TIE_SCORE = 0;
	static LOSE_SCORE = -10;

	constructor() {
		this.board = [];
		this.humanPlayer = "O";
		this.computerPlayer = "X";
		this.gameOver = false;

		this.initialize();
	}

	/**
	 * Initialize the board
	 */
	initialize() {
		// initialize the board with 9 empty slots
		this.board = ['','','','','','','','',''];
		this.gameOver = false;
	}

	/**
	 * Get all the empty slots in the board. If a board is
	 * not specified, the method would use the instance
	 * board by default.
	 *
	 * @param {array} board : Optional
	 *
	 * Returns an array
	 */
	getAvailableSlots(board) {
		// If a board isn't provided use the instance board
		if (!board)
			board = this.board;

		let availableSlots = []

		// Loop through the board and find the empty slots
		for (let i=0; i<board.length; i++) {
			if (!board[i])
				availableSlots.push(i);
		}

		return availableSlots
	}

	/**
	 * Check if the slot is valid one, meaning, its empty
	 * and a user could play it.
	 *
	 * @param {int} slot
	 *
	 * Returns a bool
	 */
	isValidSlot(slot) {
		return slot >= 0 && slot < this.board.length && this.board[slot] === ""
	}

	/**
	 * Play
	 */
	play(slot, player) {
		//
		if (this.gameOver)
			throw new Error("Game over! Please reset the board");

		// Check if the incoming slot is a valid one
		if (!this.isValidSlot(slot))
			throw new Error(`${slot} is not a valid slot.`);

		// Human player wants to play a slot. Mark it with his symbol
		this.board[slot] = player;

		// Check if the game is over
		let result = this.isGameOver();
		if (result["result"] !== TicTacToe.CONTINUE)
			this.gameOver = true;

		return result
	}

	/**
	 * Compute the next best move for the computer to play
	 */
	getNextBestSlot() {
		// Take a shallow copy of the board
		let board = this.board.slice();

		const move = this.minimax(board, this.computerPlayer,
			TicTacToe.MIN, TicTacToe.MAX, 0);
		return move["slot"];
	}

	/**
	 * Recursive minimax algo with alpha-beta pruning
	 *
	 * @param {array} board : Current state of the board
	 * @param {String} player : Current player
	 * @param {int} alpha: Alpha value for alpha beta pruning
	 * @param {int} beta: Beta value
	 * @param {int} depth: recursive depth
	 *
	 * Returns an object that has the best slot to play.
	 */
	minimax(board, player, alpha, beta, depth=0) {

		// Check if the game is over before proceeding
		const game_result = this.isGameOver(board);
		if (game_result["result"] === TicTacToe.WIN) {
			const score = game_result["player"] === this.computerPlayer ? TicTacToe.WIN_SCORE : TicTacToe.LOSE_SCORE;
			return {"score" : score}
		} else if (game_result["result"] === TicTacToe.TIE) {
			return {"score" : TicTacToe.TIE_SCORE}
		}

		// Initialize a few variables
		let bestMove = {}
		let bestScore = player === this.computerPlayer ? TicTacToe.MIN : TicTacToe.MAX

		// Loop through all the available slots
		for (const slot of game_result["slots"]) {
			board[slot] = player;

			if (player === this.computerPlayer) {
				const result = this.minimax(board, this.humanPlayer, alpha, beta, depth+1);

				if (result["score"] > bestScore) {
					bestScore = result["score"];
					bestMove = {"slot" : slot, "score" : bestScore};
				}

				alpha = Math.max(alpha, bestScore);

				// Reset the board
				board[slot] = "";

				// Alpha beta pruning
				if (beta <= alpha)
					break
			} else {
				const result = this.minimax(board, this.computerPlayer, alpha, beta, depth+1)

				if (result["score"] < bestScore) {
					bestScore = result["score"];
					bestMove = {"slot" : slot, "score" : bestScore};
				}

				beta = Math.min(beta, bestScore);

				// Reset the board
				board[slot] = "";

				// Alpha beta pruning
				if (beta <= alpha)
					break
			}

		}

		return bestMove;
	}

	/**
	 * Check if the game is over
	 */
	isGameOver(board) {
		// If a board isn't provided use the instance board
		if (!board)
			board = this.board;

		// Make sure the slots has the character and they are not empty
		function won(slots) {
			return slots.every( (val, i, arr) => val === arr[0] ) && slots[0] !== ""
		}

		// Check row
		for (let i=0; i<board.length; i=i+3) {
			let slots = [board[i], board[i+1], board[i+2]];
			if (won(slots))
				return {"result" : TicTacToe.WIN, "player" : slots[0], "slots" : [i, i+1, i+2]};
		}

		// Check col
		for (let i=0; i<3; i++) {
			let slots = [board[i], board[i+3], board[i+6]];
			if (won(slots))
				return {"result" : TicTacToe.WIN, "player" : slots[0], "slots" : [i, i+3, i+6]};
		}

		// Check Diagonals
		for (let indices of [[0,4,8], [2,4,6]]) {
			let slots = [board[indices[0]], board[indices[1]], board[indices[2]]];
			if (won(slots))
				return {"result" : TicTacToe.WIN, "player" : slots[0], "slots" : indices};
		}

		// Check tie
		const availableSlots = this.getAvailableSlots(board);
		if (availableSlots.length === 0)
			return {"result" : TicTacToe.TIE};

		return {"result" : TicTacToe.CONTINUE, "slots" : availableSlots};

	}

	/**
	 * Reset the board
	 */
	reset() {
		this.initialize();
	}

	/**
	 * Display the board
	 */
	 display() {
	 	for (let i=0; i<this.board.length; i=i+3)
	 		console.log(`|${this.board[i]},${this.board[i+1]},${this.board[i+2]}|`)
	 }
}


// *************************************************************************************
// 
// Gameplay
// 
// *************************************************************************************

function updateFeedback(msg) {
	feedbackBox.textContent = msg;
}

function displayRestartButton(status) {
	if (status)
		restartGameButton.classList.remove("d-none")
	else
		restartGameButton.classList.add("d-none")
}

function clearCells() {
	for (const cell of cells) {
		cell.textContent = "";
	}
}

function play(cell, player) {
	let result;

	try {
		result = GAME.play(parseInt(cell.id), player);
	} catch (err) {
		console.log(err);
		return false;
	}

	// Update the board
	cell.textContent = player;

	// is Game Over
	if (!GAME.gameOver) {
		updateFeedback("Game in progress");
		displayRestartButton(true);
		return false
	}

	let msg = "Game Tie"
	if (result["result"] === TicTacToe.WIN) {
		let name = result["player"] === GAME.humanPlayer ? "Human" : "Computer"
		msg = name + " won!!"
	}

	updateFeedback(msg);
	return true;
}

// *************************************************************************************
// 
// Events
// 
// *************************************************************************************

function cellClicked(e) {
	play(e.target, GAME.humanPlayer);
	if (GAME.gameOver)
		return

	// // Get the next best move for the computer to play;
	const bestSlot = GAME.getNextBestSlot();
	gameOver = play(cells[bestSlot], GAME.computerPlayer);
}

function restartGame(e) {
	GAME.reset();
	updateFeedback("Tic Tac Toe");
	displayRestartButton(false);
	clearCells();
}

// *************************************************************************************
// 
// Get the elements by Id and store them in variables.
// 
// *************************************************************************************
const cells = document.getElementsByClassName("game-cell");
const feedbackBox = document.getElementById("feedback");
const restartGameButton = document.getElementById("restartGameButton");


// *************************************************************************************
// 
// Register Event handlers
// 
// *************************************************************************************
for (const cell of cells) {
	cell.addEventListener("click", cellClicked);
}

restartGameButton.addEventListener("click", restartGame);

// *************************************************************************************
// 
// Initializers
// 
// *************************************************************************************
const GAME = new TicTacToe();
restartGame();
