/* global board, Dom, Game, board */
/* eslint-disable no-unused-vars */
class Piece {
  constructor(squareName, colour, symbol, name) {
    this.square = board.sq(squareName);
    this.square.piece = this;
    this.row = this.square.row;
    this.column = this.square.column;
    this.name = name;
    this.colour = colour;
    this.opponentColour = colour === 'white' ? 'black' : 'white';
    this.symbol = symbol;
    this.square.render();
    this.hasMoved = false;
  }

  availableSquares() {
    return board.filter(square => this.squareIsAvailable(square));
  }

  attemptMoveTo(square) {
    if (Game.isInCheck(this.colour) && !Game.pieceMovesPreventingCheck(this).includes(square)) {
      Dom.message('This move does not prevent check');
      return false;
    }
    const moveResultsInCheck = Game
      .simulateMove(this, square, () => Game.isInCheck(this.colour));
    if (this.squareIsAvailable(square) && moveResultsInCheck) {
      Dom.message('You cannot move into check');
      return false;
    }
    if (this.squareIsAvailable(square)) {
      Dom.message('Move ' + this.symbol + ' to ' + square.name);
      if (square.hasOpponentOf(this)) {
        this.takes(square.piece);
      }
      this.moveTo(square);
      this.hasMoved = true;
      return true;
    }
    return false;
  }

  moveTo(square) {
    this.square.clear();
    square.setPiece(this);
  }

  canMove() {
    return !!this.availableSquares().length;
  }

  takes(piece) {
    Dom.message(`${this.colour}
      <span class="symbol">${this.symbol}</span>
      takes ${piece.colour}
      <span class="symbol">${piece.symbol}</span>!`);
  }

  isThreatenedBy() {
    return board
      .opponentsOf(this)
      .filter(piece => piece.availableSquares().includes(this.square));
  }

  isThreatened() {
    return this.isThreatenedBy().length;
  }

  isThreateningSquares() {
    return this.availableSquares();
  }
}

class King extends Piece {
  constructor(squareName, colour) {
    super(squareName, colour, '♚', 'K');
  }

  squareIsAvailable(square) {
    const castlingDestinations = board
      .piecesByColour(this.colour)
      .filter(piece => piece instanceof Rook && this.canCastle(piece))
      .map(piece => this.castlingDestinations(piece).king);
    const neighbouringSquares = board
      .filter(sq => sq.isNeighbourOf(square));
    return castlingDestinations.includes(square)
      || (square.isNeighbourOf(this.square)
        && !neighbouringSquares.find(sq => sq.hasOpponentKing(this))
      && !this.square.routeIsBlockedTo(square)
      && !square.isThreatenedBy(this.opponentColour).length);
  }

  hasOpponentKing(square) {
    return square.piece && square.piece instanceof King
      && square.piece.colour === this.opponentColour;
  }

  rookToCastleWithToReach(square) {
    return board
      .piecesByColour(this.colour)
      .filter(piece => piece instanceof Rook && this.canCastle(piece))
      .find(piece => this.castlingDestinations(piece).king === square);
  }

  castle(rook) {
    if (this.canCastle(rook)) {
      const destinations = this.castlingDestinations(rook);
      this.moveTo(destinations.king);
      rook.moveTo(destinations.rook);
      Dom.message(this.colour + ' castles');
      return true;
    }
  }

  castlingDestinations(rook) {
    if (rook.column === 8) {
      // King's side
      return {
        king: board.squareAt(this.row, 7),
        rook: board.squareAt(this.row, 6)
      };
    } else if (rook.column === 1) {
      // Queen's side
      return {
        king: board.squareAt(this.row, 3),
        rook: board.squareAt(this.row, 4)
      };
    }
  }

  attemptMoveTo(square) {
    const rookToCastleWith = this.rookToCastleWithToReach(square);
    if (rookToCastleWith) {
      // Square is available via castling
      return this.castle(rookToCastleWith);
    } else {
      // Square is available normally
      return super.attemptMoveTo(square);
    }
  }

  canCastle(rook) {
    // Is the rook of the right colour?
    if (this.colour !== rook.colour) return false;
    // Has either piece moved?
    if (this.hasMoved || rook.hasMoved) return false;
    // Are any of the intervening squares threatened?
    const opponentColour = this.opponentColour;
    if (this.square.routeTo(rook.square).some(square =>
      square.isThreatenedBy(opponentColour).length)) return false;
    // Are any of the intervening squares occupied?
    if (this.square.squaresTo(rook.square).filter(square =>
      square.piece !== rook).some(square => square.piece)) return false;
    return true;
  }
}

class Queen extends Piece {
  constructor(squareName, colour) {
    super(squareName, colour, '♛', 'Q');
  }

  squareIsAvailable(square) {
    return (
      square.isDiagonalFrom(this.square) || square.isStraightLineFrom(this.square)
    ) && !this.square.routeIsBlockedTo(square);
  }
}

class Bishop extends Piece {
  constructor(squareName, colour) {
    super(squareName, colour, '♝', 'B');
  }

  squareIsAvailable(square) {
    return (
      square.isDiagonalFrom(this.square)
    ) && !this.square.routeIsBlockedTo(square);
  }
}

class Knight extends Piece {
  constructor(squareName, colour) {
    super(squareName, colour, '♞', 'N');
  }

  squareIsAvailable(square) {
    return square.isKnightsMoveFrom(this.square) && !square.hasTeamMateOf(this);
  }
}

class Rook extends Piece {
  constructor(squareName, colour) {
    super(squareName, colour, '♜', 'R');
  }

  squareIsAvailable(square) {
    return (
      square.isStraightLineFrom(this.square)
    ) && !this.square.routeIsBlockedTo(square);
  }
}

class Pawn extends Piece {
  constructor(squareName, colour) {
    super(squareName, colour, '♟', 'p');
  }

  squareIsAvailable(square) {
    const here = this.square;
    let isAvailable = this.squareIsForwardOf(square);
    if (this.hasMoved) {
      isAvailable = isAvailable
        && square.isNeighbourOf(here);
    } else {
      isAvailable = isAvailable
      && here.routeTo(square).length <= 2;
    }
    isAvailable = isAvailable
      && (
        (square.isStraightLineFrom(here) && !square.piece)
        || (this.isThreatening(square) && square.hasOpponentOf(this))
      );
    return isAvailable && !here.routeIsBlockedTo(square);
  }

  squareIsForwardOf(square) {
    switch(this.colour) {
      case 'black':
        return square.isAbove(this.square);
      case 'white':
        return square.isBelow(this.square);
    }
  }

  isThreatening(square) {
    return this.squareIsForwardOf(square)
      && square.isDiagonalFrom(this.square)
      && square.isNeighbourOf(this.square);
  }

  isThreateningSquares() {
    // TODO: Finish this. Which squares is this pawn threatening?
    return board.filter(square => this.isThreatening(square));
  }
}
