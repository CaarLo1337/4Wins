export class CheckBoard {
    checkboard: number[][] = [];
    constructor(public rows: number, public collumns: number) {}

    generateCheckBoard() {
        let checkBoard = [];
        for (let i = 0; i < this.rows; i++) {
            checkBoard.push([0]);
            for (let j = 0; j < this.collumns; j++) {
                checkBoard[i][j] = 0;
            }
        }
        return checkBoard;
    }

    putDataInCheckBoard(checkboard: number[][], level: number, row: number, user: number) {
        let reverseBoard = checkboard.reverse();
        reverseBoard[level][row] = user;
        return reverseBoard.reverse();
    }

    p(y: number, x: number) {
        if (y < 0 || x < 0 || y >= this.rows || x >= this.collumns) {
            return '0';
        } else {
            return this.checkboard[y][x];
        }
    }
    getWinningCoins(checkBoard: number[][]) {
        this.checkboard = checkBoard;
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.collumns; x++) {
                if (this.p(y, x) != 0 && this.p(y, x) == this.p(y, x + 1) && this.p(y, x) == this.p(y, x + 2) && this.p(y, x) == this.p(y, x + 3)) {
                    //console.log('winner horizontal');

                    let allCoins = [];
                    for (let i = 0; i < 4; i++) {
                        let collumn = document.querySelectorAll('.real__grid-row')[x + i];
                        let allRowsInCollumn = collumn.children;
                        allCoins.push(allRowsInCollumn[y]);
                    }

                    console.log(allCoins, 'hori');

                    return allCoins;
                }
                if (this.p(y, x) != 0 && this.p(y, x) == this.p(y + 1, x) && this.p(y, x) == this.p(y + 2, x) && this.p(y, x) == this.p(y + 3, x)) {
                    //console.log('winner vertical');
                    console.log(y, x);

                    let allCoins = [];
                    for (let i = 0; i < 4; i++) {
                        let collumn = document.querySelectorAll('.real__grid-row')[x];
                        let allRowsInCollumn = collumn.children;
                        allCoins.push(allRowsInCollumn[y + i]);
                    }

                    console.log(allCoins, 'verti');

                    return allCoins;
                }
                for (let d = -1; d <= 1; d += 2) {
                    if (this.p(y, x) != 0 && this.p(y, x) == this.p(y + 1 * d, x + 1) && this.p(y, x) == this.p(y + 2 * d, x + 2) && this.p(y, x) == this.p(y + 3 * d, x + 3)) {
                        //console.log('winner diagonal');
                        let allCoins = [];
                        for (let i = 0; i < 4; i++) {
                            let collumn = document.querySelectorAll('.real__grid-row')[x + i];
                            let allRowsInCollumn = collumn.children;
                            allCoins.push(allRowsInCollumn[y + i * d]);
                        }

                        console.log(allCoins, 'diag');

                        return allCoins;
                    }
                }
            }
        }
    }

    getWinner(checkBoard: number[][]): number {
        this.checkboard = checkBoard;
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.collumns; x++) {
                if (this.p(y, x) != 0 && this.p(y, x) == this.p(y, x + 1) && this.p(y, x) == this.p(y, x + 2) && this.p(y, x) == this.p(y, x + 3)) {
                    //console.log('winner horizontal');
                    return this.checkboard[y][x];
                }
                if (this.p(y, x) != 0 && this.p(y, x) == this.p(y + 1, x) && this.p(y, x) == this.p(y + 2, x) && this.p(y, x) == this.p(y + 3, x)) {
                    //console.log('winner vertical');
                    return this.checkboard[y][x];
                }
                for (let d = -1; d <= 1; d += 2) {
                    if (this.p(y, x) != 0 && this.p(y, x) == this.p(y + 1 * d, x + 1) && this.p(y, x) == this.p(y + 2 * d, x + 2) && this.p(y, x) == this.p(y + 3 * d, x + 3)) {
                        //console.log('winner diagonal');
                        return this.checkboard[y][x];
                    }
                }
            }
        }
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.collumns; x++) {
                if (this.p(y, x) == 0) {
                    //console.log('Nope');
                    return 0;
                }
            }
        }
        console.log('Tie -1');
        return -1;
    }
}
