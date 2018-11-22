/* global King */
/* global Dom, sq, board, whiteToPlay, selectedSquare */
/* eslint-disable no-unused-vars, no-global-assign */
class Game {
  static addPiece(side, piece, column) {
    const columnLetter = 'ABCDEFGH'[column - 1];
    const newPiece = new piece(columnLetter + side.pieceRow, side.colour);
    side.array.push(newPiece);
    return newPiece;
  }

  static isMyTurn(piece) {
    return piece.colour === (whiteToPlay ? 'white' : 'black');
  }

  static currentTurnColour() {
    return whiteToPlay ? 'white' : 'black';
  }

  static opponentColour() {
    return whiteToPlay ? 'black' : 'white';
  }

  static move(piece, square) {
    const moved = piece.attemptMoveTo(square);
    selectedSquare = null;
    if (moved) {
      this.finishMove();
    }
  }

  static finishMove() {
    Dom.togglePlayer();
    const whiteCheckmate = Game.isCheckmate('white');
    const blackCheckmate = Game.isCheckmate('black');
    if (whiteCheckmate || blackCheckmate) {
      Dom.message('Checkmate ' + (whiteCheckmate ? 'black' : 'white') + ' wins.');
    }
  }

  static isInCheck(colour) {
    const king = board
      .piecesByColour(colour)
      .find(piece => piece instanceof King);
    return !!king.square.isThreatenedBy(king.opponentColour).length;
  }

  static isCheckmate(colour) {
    if (!Game.isInCheck('white') && !Game.isInCheck('black')) {
      Dom.showHint(false);
      return false;
    }
    Dom.showHint(true);
    Dom.message('Check');
    return !Game.movesPreventingCheck(colour).length;
  }

  static movesPreventingCheck(colour) {
    return board.piecesByColour(colour)
      .map(piece => {
        return {
          piece,
          preventCheck: Game.pieceMovesPreventingCheck(piece)
        };
      })
      .filter(pieceMoves => pieceMoves.preventCheck.length);
  }

  static pieceMovesPreventingCheck(piece) {
    return piece.availableSquares()
      .filter(square => {
        return Game.simulateMove(piece, square, () => !Game.isInCheck(piece.colour));
      });
  }

  static giveHint() {
    Game.movesPreventingCheck(Game.currentTurnColour()).forEach(hint => {
      hint.piece.square.highlight(2);
      hint.preventCheck.forEach(square => square.highlight());
    });
  }

  static simulateMove(piece, square, outcomeFunction) {
    const currentSquare = piece.square;
    const pieceAtMoveSquare = square.piece;
    piece.moveTo(square);
    const outcome = outcomeFunction();
    piece.moveTo(currentSquare);
    if (pieceAtMoveSquare) {
      square.setPiece(pieceAtMoveSquare);
    }
    return outcome;
  }

  static moveByNotation(notation) {
    // Be5
    const square = sq(notation.slice(-2));
    const pieceName = notation.length === 2 ? 'p' : notation[0];
    const piece = board
      .piecesByColour(Game.currentTurnColour())
      .filter(piece => piece.name.toLowerCase() === pieceName.toLowerCase())
      .find(piece => piece.availableSquares().includes(square));
    if (piece) {
      Game.move(piece, square);
    }
  }

  static handleNotation(event) {
    event.preventDefault();
    const $input = this.querySelector('input');
    const notation = $input.value;
    Game.moveByNotation(notation);
    $input.value = '';
  }
}
