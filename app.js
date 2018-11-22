/* global Board, King, Queen, Bishop, Knight, Rook, Pawn, Game */
/* eslint-disable no-unused-vars, prefer-const */
const board = new Board();
function sq(name) {
  return board.sq(name);
}
let selectedSquare;
let whiteToPlay = true;
const white = [];
const black = [];
const kings = {};
for (const side of [
  { colour: 'white', array: white, pieceRow: 1, pawnRow: 2 },
  { colour: 'black', array: black, pieceRow: 8, pawnRow: 7 }
]) {
  Game.addPiece(side, Rook, 1);
  Game.addPiece(side, Knight, 2);
  Game.addPiece(side, Bishop, 3);
  Game.addPiece(side, Queen, 4);
  kings[side.colour] = Game.addPiece(side, King, 5);
  Game.addPiece(side, Bishop, 6);
  Game.addPiece(side, Knight, 7);
  Game.addPiece(side, Rook, 8);
  for (let i = 0; i < 8; i++) {
    const column = 'ABCDEFGH'[i];
    side.array.push(new Pawn(column + side.pawnRow, side.colour));
  }
}


// Used for testing, moves can be filled with
// chess notation moves to create initial conditions
// for testing.
let moves = [];
// moves = ['d4', 'd5', 'e4', 'e5', 'c3', 'f5', 'Bg5', 'Na6', 'Qa4', 'c6', 'Bb5'];
// moves = ['g3', 'f6', 'Bh3', 'Nh6', 'Nf3', 'g5', 'Be6', 'Bg7'];
// moves = ['e3', 'f6', 'Ke2', 'Kf7', 'Kf3', 'Kg6', 'Kg4'];
// moves = ['e3', 'd5', 'Qf3', 'a6', 'd4', 'Bf5', 'Qd5',
//   'Qd5', 'Bd2', 'Qe4', 'Na3', 'c5', 'Nh3', 'Qh4', 'Rd1', 'Nc6', 'Nf4', 'Nd8', 'g3',
//   'Bg6'];
moves.forEach(move => Game.moveByNotation(move));
