import { CheckBoard } from './CheckBoard';

export class Minimax {
    scores = {
        1: 100000,
        2: -100000,
    };

    constructor(
        public depth: number,
        public rows: number,
        public collumns: number
    ) {}

    bestMove(checkBoard: number[][]) {
        let bestScore = -Infinity;
        let move;
        let temp;

        for (let i = 0; i < this.collumns; i++) {
            temp = this.findSpace(i, checkBoard);
            if (temp >= 0) {
                checkBoard[temp][i] = 2;

                let score = this.minimax(checkBoard, this.depth, false, 1);

                checkBoard[temp][i] = 0;

                //console.log(score);
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    }

    findSpace(x: number, checkBoard: number[][]) {
        for (let y = this.rows - 1; y >= 0; y--) {
            if (checkBoard[y][x] == 0) {
                return y;
            }
        }
        return -1;
    }

    countPieces(
        i: number,
        j: number,
        i2: number,
        j2: number,
        player: number,
        board: number[][]
    ) {
        let pieces = 0;
        for (i; i < i2; i++) {
            for (j; j < j2; j++) {
                if (board[i][j] == player) {
                    pieces += 1;
                }
            }
        }
        return pieces;
    }

    countDiagonal(
        i: number,
        j: number,
        direction: number,
        player: number,
        board: number[][]
    ) {
        let pieces = 0;

        for (let x = 0; x < 4; x++) {
            if (direction == 1) {
                if (i + x < this.rows && j + x < this.collumns) {
                    if (board[i + x][j + x] == player) {
                        pieces += 1;
                    }
                }
            } else {
                if (i + x < this.rows && j - x < this.collumns && j - x > 0) {
                    if (board[i + x][j - x] == player) {
                        pieces += 1;
                    }
                }
            }
        }
        return pieces;
    }

    score_position(computer: number, player: number, board: number[][]) {
        let score = 0;
        for (let i = 1; i < this.rows; i++) {
            for (let j = 1; j < this.collumns; j++) {
                if (
                    (this.countPieces(i, j, i + 4, j, computer, board) == 3 &&
                        this.countPieces(i, j, i + 4, j, 0, board) == 1) ||
                    (this.countPieces(i, j, i, j + 4, computer, board) == 3 &&
                        this.countPieces(i, j, i, j + 4, 0, board) == 1) ||
                    (this.countDiagonal(i, j, 0, computer, board) == 3 &&
                        this.countDiagonal(i, j, 1, 0, board) == 1)
                ) {
                    score += 1000;
                }
                if (
                    (this.countPieces(i, j, i + 4, j, computer, board) == 2 &&
                        this.countPieces(i, j, i + 4, j, 0, board) == 2) ||
                    (this.countPieces(i, j, i, j + 4, computer, board) == 2 &&
                        this.countPieces(i, j, i, j + 4, 0, board) == 2) ||
                    (this.countDiagonal(i, j, 0, computer, board) == 2 &&
                        this.countDiagonal(i, j, 1, 0, board) == 2)
                ) {
                    score += 10;
                }

                if (
                    (this.countPieces(i, j, i + 4, j, computer, board) == 1 &&
                        this.countPieces(i, j, i + 4, j, 0, board) == 3) ||
                    (this.countPieces(i, j, i, j + 4, computer, board) == 1 &&
                        this.countPieces(i, j, i, j + 4, 0, board) == 3) ||
                    (this.countDiagonal(i, j, 0, computer, board) == 1 &&
                        this.countDiagonal(i, j, 1, 0, board) == 3)
                ) {
                    score += 1;
                }

                if (
                    (this.countPieces(i, j, i + 4, j, player, board) == 3 &&
                        this.countPieces(i, j, i + 4, j, 0, board) == 1) ||
                    (this.countPieces(i, j, i, j + 4, player, board) == 3 &&
                        this.countPieces(i, j, i, j + 4, 0, board) == 1) ||
                    (this.countDiagonal(i, j, 0, player, board) == 3 &&
                        this.countDiagonal(i, j, 1, 0, board) == 1)
                ) {
                    score -= 1000;
                }

                if (
                    (this.countPieces(i, j, i + 4, j, player, board) == 2 &&
                        this.countPieces(i, j, i + 4, j, 0, board) == 2) ||
                    (this.countPieces(i, j, i, j + 4, player, board) == 2 &&
                        this.countPieces(i, j, i, j + 4, 0, board) == 2) ||
                    (this.countDiagonal(i, j, 0, player, board) == 2 &&
                        this.countDiagonal(i, j, 1, 0, board) == 2)
                ) {
                    score -= 10;
                }

                if (
                    (this.countPieces(i, j, i + 4, j, player, board) == 1 &&
                        this.countPieces(i, j, i + 4, j, 0, board) == 3) ||
                    (this.countPieces(i, j, i, j + 4, player, board) == 1 &&
                        this.countPieces(i, j, i, j + 4, 0, board) == 3) ||
                    (this.countDiagonal(i, j, 0, player, board) == 1 &&
                        this.countDiagonal(i, j, 1, 0, board) == 3)
                ) {
                    score -= 1;
                }
            }
        }
        return score;
    }

    minimax(
        board: number[][],
        depth: number,
        isMaximizing: boolean,
        nr_moves: number
    ) {
        let result = new CheckBoard(this.rows, this.collumns).getWinner(board);

        if (result == 2) {
            return this.scores[1] - 20 * nr_moves;
        }
        if (result == 1) {
            return this.scores[2] - 20 * nr_moves;
        }

        if (result == -1) {
            return 0 - 50 * nr_moves;
        }

        if (depth == 0) {
            return this.score_position(2, 1, board);
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < this.collumns; i++) {
                let temp = this.findSpace(i, board);

                if (temp < this.collumns && temp > -1) {
                    board[temp][i] = 2;
                    //console.log(Config.CHECKBOARD);
                    let score = this.minimax(
                        board,
                        depth - 1,
                        false,
                        nr_moves + 1
                    );

                    board[temp][i] = 0;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < this.collumns; i++) {
                let temp = this.findSpace(i, board);

                if (temp < this.collumns && temp > -1) {
                    board[temp][i] = 1;

                    let score = this.minimax(
                        board,
                        depth - 1,
                        true,
                        nr_moves + 1
                    );

                    board[temp][i] = 0;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }
}
