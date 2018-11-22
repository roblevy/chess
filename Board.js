/* global Piece, Square */
class Board {
  constructor() {
    this.board = [];
    this.constructBoard();
  }

  constructBoard() {
    let isWhite = false;
    const $board = document.getElementById('board');
    const $columnLabels = document.getElementById('column-labels');
    $columnLabels.classList.add('row');
    for (let i = 0; i < 8; i++) {
      const $row = document.createElement('div');
      $row.classList = 'row';
      // Column labels
      const $columnLabel = document.createElement('div');
      $columnLabel.classList = 'square label';
      $columnLabel.textContent = 'ABCDEFGH'[i];
      $columnLabels.appendChild($columnLabel);
      // Row labels
      const $rowLabel = document.createElement('div');
      $rowLabel.classList = 'square label';
      $rowLabel.textContent = i + 1;
      $row.appendChild($rowLabel);
      for (let j = 0; j < 8; j++) {
        const $square = document.createElement('div');
        $square.classList = 'square';
        this.board.push(new Square(i + 1, j + 1, isWhite, $square));
        isWhite = !isWhite;
        $row.appendChild($square);
      }
      $board.appendChild($row);
      isWhite = !isWhite;
    }
  }

  filter(callback) {
    return this.board.filter(callback);
  }

  sq(name) {
    return this.board.find(square => square.name.toLowerCase() === name.toLowerCase());
  }

  squareAt(row, column) {
    return this.board.find(square => square.row === row && square.column === column);
  }

  opponentsOf(piece) {
    return this.piecesByColour(piece.isWhite ? 'black' : 'white');
  }

  piecesByColour(colour) {
    return this.board
      .filter(square => square.piece && square.piece.colour === colour)
      .map(square => square.piece);
  }
}
