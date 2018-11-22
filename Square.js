/* global board,King,handleSquareClick */
/* eslint-disable no-unused-vars */

class Square {
  constructor(row, column, isWhite, domElement) {
    this.row = row;
    this.column = column;
    this.name = 'ABCDEFGH'.charAt(column - 1) + row;
    this.isWhite = isWhite;
    this.colour = isWhite ? 'white' : 'black';
    domElement.classList.add(this.colour);
    domElement.addEventListener('click', handleSquareClick(this));
    this.domElement = domElement;
  }

  highlight(level) {
    const el = this.domElement;
    level = level || 1;
    el.classList.add(`highlight${level}`);
    setTimeout(() => {
      el.classList.remove(`highlight${level}`);
    }, 2000);
  }

  isDiagonalFrom(square) {
    return Math.abs(this.row - square.row) === Math.abs(this.column - square.column);
  }

  isStraightLineFrom(square) {
    return this.row - square.row === 0 || this.column - square.column === 0;
  }

  isNeighbourOf(square) {
    return Math.max(Math.abs(this.row - square.row), Math.abs(this.column - square.column)) === 1;
  }

  isKnightsMoveFrom(square) {
    return (Math.abs(this.row - square.row) === 2
      && Math.abs(this.column - square.column) === 1) ||
      (Math.abs(this.row - square.row) === 1
        && Math.abs(this.column - square.column) === 2);
  }

  isBelow(square) {
    return this.row - square.row > 0;
  }

  isAbove(square) {
    return this.row - square.row < 0;
  }

  hasOpponentOf(piece) {
    return this.piece && this.piece.colour !== piece.colour;
  }

  hasOpponentKing(piece) {
    return this.hasOpponentOf(piece) && this.piece instanceof King;
  }

  hasTeamMateOf(piece) {
    return this.piece && this.piece.colour === piece.colour;
  }

  overlapsWith(square) {
    return this.row === square.row && this.column === square.column;
  }

  routeTo(square2) {
    const squaresTo = this.squaresTo(square2);
    const squares = [];
    for (let i = 0; i < squaresTo.length; i++) {
      const square = squaresTo[i];
      if (square.piece && this.piece) {
        if (square.piece.colour !== this.piece.colour) {
          squares.push(square);
        }
        break;
      } else {
        squares.push(square);
      }
    }
    return squares;
  }

  nextSquareTowards(currentSquare, square2) {
    const changeInRow = (square2.row > currentSquare.row) ? 1 :
      (square2.row < currentSquare.row) ? -1 : 0;
    const changeInColumn = (square2.column > currentSquare.column) ? 1 :
      (square2.column < currentSquare.column) ? -1 : 0;
    return board.squareAt(currentSquare.row + changeInRow, currentSquare.column + changeInColumn);
  }

  squaresTo(square2) {
    if (!this.isDiagonalFrom(square2) && !this.isStraightLineFrom(square2)) return [];
    const squares = [];
    let square = this;
    while(!square.overlapsWith(square2)) {
      square = this.nextSquareTowards(square, square2);
      squares.push(square);
    }
    return squares;
  }

  routeIsBlockedTo(square) {
    return !this.routeTo(square).includes(square);
  }

  clear() {
    this.piece.square = null;
    this.piece = null;
    this.render();
  }

  setPiece(piece) {
    piece.square = this;
    this.piece = piece;
    this.render();
  }

  isThreatenedBy(colour) {
    // TODO: This is broken!
    return board
      .piecesByColour(colour)
      // This is important because King threatens King threatens King....
      .filter(piece => !(piece instanceof King))
      .filter(piece => piece.isThreateningSquares().includes(this));
  }
}
