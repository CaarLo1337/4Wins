import { CheckBoard } from './CheckBoard';
import { Config } from './config.interface';
import { Minimax } from './Minimax';
import { Sound } from './Sounds';
import { Structure } from './Structure';
import { Audio } from './audio.interface';
import { io, Socket } from 'socket.io-client';

export class Game {
    // constructor types
    element: HTMLElement;
    rows: number;
    collumns: number;
    player: number;
    computer: number;
    playerClass: string;
    computerClass: string;
    isPlayerTurn: number;
    depth: number;
    takenClass: string;
    audio: Audio;
    chosenCollumn: Element[] = [];
    dataRow: number;
    checkBoard: CheckBoard;
    minimax: Minimax;
    board: number[][];
    structure: Structure | undefined;
    socket: Socket;
    userRoom: string | undefined;
    gameMode: string | undefined;
    allPlayers: any;
    thisPlayer: any;
    currentPlayerTurn: number | undefined;
    reset: boolean;
    controller: AbortController | undefined;

    constructor(public config: Config) {
        this.element = config.mainElement;
        this.rows = config.rows;
        this.collumns = config.collums;
        this.player = config.player;
        this.computer = config.computer;
        this.playerClass = config.playerClass;
        this.computerClass = config.computerClass;
        this.isPlayerTurn = config.isPlayerTurn;
        this.depth = config.depth;
        this.audio = config.audio;
        this.chosenCollumn;
        this.dataRow = 0;
        this.takenClass = '';
        //init checkboard
        this.checkBoard = new CheckBoard(this.rows, this.collumns);
        this.board = [];
        //init minimax
        this.minimax = new Minimax(config.depth, this.rows, this.collumns);
        this.socket = io(config.IO_SERVER);
        this.allPlayers = [];
        this.reset = false;
    }

    userConnect() {
        this.socket.once('connect', () => {
            console.log(`You connected with the id: ${this.socket.id}`);
        });
    }

    timer(sec: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, sec);
        });
    }

    awaitClick(): Promise<void> {
        // get all real collumns
        return new Promise((resolve, reject) => {
            this.controller = new AbortController();
            this.controller.signal.addEventListener('abort', () => {
                console.log('awaitClick rejected');
                reject();
            });

            let allRows = document.querySelectorAll('.real__grid-row');

            // transforms the pseudocollumn to the realcollumn
            let saveElementForPlayer = (element: HTMLElement): void => {
                this.dataRow = parseInt(element.dataset.row!);
                this.chosenCollumn = [...allRows[this.dataRow].children].reverse();
                console.log('line');
            };

            // the event that resolves the promise
            let event = function (this: HTMLElement): void {
                saveElementForPlayer(this);
                pseudoRows.forEach((e) => {
                    e.removeEventListener('click', event);
                });
                // clearInterval(myInterval);
                resolve();
            };

            // get all pseudo collumns
            let pseudoRows = document.querySelectorAll('.pseudo__grid-row')!;

            // add an eventlistener for all pseudo collumns
            pseudoRows.forEach((e) => {
                e.addEventListener('click', event);
            });
        });
    }

    getRealComputerRow(randomRow: number) {
        let realRows = document.querySelectorAll('.real__grid-row');
        let currentRow = realRows[randomRow].children;
        let newCurrentRow = [...currentRow];
        newCurrentRow = newCurrentRow.reverse();
        return newCurrentRow;
    }

    async winMatch(winner: number) {
        if (this.gameMode === 'sp') {
            //change pulsshadow to green
            if (winner === this.player) {
                let bgBox = document.querySelector('.game__backgroundbox');
                bgBox?.classList.add('win');

                let allWinningCells = this.checkBoard.getWinningCoins(this.board)!;

                allWinningCells.forEach((element) => {
                    let token = element.querySelector('.token');
                    token?.classList.add('pulse');
                });

                let winningScreen = this.structure?.createStructure(`
                <div class="game__show-winner">
                    <p>You won!</p>
                </div>
                `);
                this.element.appendChild(winningScreen!);

                await new Sound(this.audio).win();
            } else {
                let bgBox = document.querySelector('.game__backgroundbox');
                bgBox?.classList.add('lose');
                let playerToken = document.querySelectorAll('.c-taken');
                console.log(playerToken);

                let allWinningCells = this.checkBoard.getWinningCoins(this.board)!;

                allWinningCells.forEach((element) => {
                    let token = element.querySelector('.token');
                    token?.classList.add('pulse');
                });

                let winningScreen = this.structure?.createStructure(`
                <div class="game__show-winner">
                    <p>You lost!</p>
                </div>
                `);
                this.element.appendChild(winningScreen!);

                await new Sound(this.audio).reset();
            }
        }

        console.log(winner, 'wins the game');
    }

    async chosePlayer() {
        if (this.isPlayerTurn === this.config.player) {
            // Playerturn
            // wait for Playerinput and set dataRow & chosenCollumn
            await this.awaitClick();

            //sets the css class for the coin - player
            this.takenClass = this.playerClass;
        } else {
            // Computerturn

            // generates a random row for the computer
            this.dataRow = this.minimax.bestMove(this.board)!; //Math.floor(Math.random() * 8);
            this.chosenCollumn = this.getRealComputerRow(this.dataRow);
            //sets the css class for the coin - computer
            this.takenClass = this.computerClass;
        }
    }

    switchPlayer() {
        if (this.isPlayerTurn === this.config.player) {
            this.isPlayerTurn = this.config.computer;
        } else {
            this.isPlayerTurn = this.config.player;
        }
    }

    startGameLoop(): void {
        // generates the checkboard
        this.board = this.checkBoard.generateCheckBoard();

        // turn for each player
        const turn = async (): Promise<void> => {
            // //Chose player and wait for input from player
            await this.chosePlayer();

            // loop all rows from the chosen collumn
            for (let i = 0; i < this.chosenCollumn.length; i++) {
                let insideCell = this.chosenCollumn[i].querySelector('.token')!;

                // check if the selected row is full and do turn() again if full
                if ((i === 5 && insideCell.classList.contains(this.playerClass)) || (i === 5 && insideCell.classList.contains(this.computerClass))) {
                    turn();
                    break;
                }

                // check if the current row contains a coin and if not place your coin and finish the turn for the current player
                if (!insideCell.classList.contains(this.computerClass) && !insideCell.classList.contains(this.playerClass)) {
                    //adds class(coin) to the cell
                    insideCell.classList.add(this.takenClass);

                    //play audio for the coindrop
                    await new Sound(this.audio).dropCoin();

                    //put the data for the current player in checkboard
                    this.board = this.checkBoard.putDataInCheckBoard(this.board, i, this.dataRow, this.isPlayerTurn);

                    let result = this.checkBoard.getWinner(this.board);
                    if (result != 0) {
                        this.winMatch(this.isPlayerTurn);
                        break;
                    }

                    // switch the playerturn
                    this.switchPlayer();

                    // start new turn and break the loop
                    turn();
                    break;
                }
            }
        };
        turn();
    }

    async showMultiplayerScreen(redo?: boolean) {
        if (redo) {
            this.userRoom = await this.structure?.choseMpRoom(true);
        } else if (redo === false) {
            this.userRoom = await this.structure?.choseMpRoom(false);
        }

        if (this.userRoom === '') {
            this.showMultiplayerScreen(true);
        } else {
            if (redo !== undefined) {
                let isPlayerInRoom; //true = room is full #### false = room is empty
                await new Promise((resolve) => {
                    this.socket.emit('join', this.userRoom, (response: any) => {
                        isPlayerInRoom = response;
                        resolve(response);
                    });
                });

                if (isPlayerInRoom) {
                    this.showMultiplayerScreen(true);
                }
            }

            this.structure?.displayRoomcode(this.userRoom!);
            await new Promise((resolve) => {
                this.socket.emit('getAllPlayerInRoom', this.userRoom, (response: any) => {
                    this.allPlayers = response;
                    resolve(response);
                });
            });

            if (this.allPlayers.length !== 2) {
                this.structure?.waitForPlayerBox(true);
                await new Promise((resolve) => {
                    this.socket.once('playerJoined', (response: any) => {
                        this.allPlayers = response;
                        this.structure?.waitForPlayerBox(false);
                        resolve(response);
                    });
                });
            }
            this.thisPlayer = this.allPlayers.indexOf(this.socket.id) + 1;

            this.currentPlayerTurn = 1;
            this.setTokenClassForPlayer();
            this.structure?.diplayPlayerStatus();
            this.reset = false;
            this.startMultiplayerGameLoop();
        }
    }

    async showTitlescreen() {
        this.gameMode = await this.structure?.choseGamemode();
        if (this.gameMode === 'sp') {
            // start game against ki
            this.startGameLoop();
        } else if (this.gameMode === 'mp') {
            // connect to server
            this.userConnect();
            this.showMultiplayerScreen(false);
        }
    }

    setTokenClassForPlayer() {
        this.takenClass = this.playerClass;
    }

    async startMultiplayerGameLoop() {
        console.log('init gameloop');
        this.board = this.checkBoard.generateCheckBoard();

        const turn = async () => {
            console.log('startturn');
            console.log(this.thisPlayer);
            if (this.currentPlayerTurn === this.thisPlayer) {
                let statusBox = document.querySelector('.game__gamestatus')!;
                statusBox.innerHTML = `<p class="game__gamestatus-info">Your turn. Set a coin.</p>`;
                await this.awaitClick().catch(() => {
                    console.log('promise rejected');
                });

                if (this.reset === true) return;

                for (let i = 0; i < this.chosenCollumn.length; i++) {
                    let insideCell = this.chosenCollumn[i].querySelector('.token')!;

                    // check if the selected row is full and do turn() again if full
                    if ((i === 5 && insideCell.classList.contains(this.playerClass)) || (i === 5 && insideCell.classList.contains(this.computerClass))) {
                        turn();
                        break;
                    }
                    // check if the current row contains a coin and if not place your coin and finish the turn for the current player
                    if (!insideCell.classList.contains(this.computerClass) && !insideCell.classList.contains(this.playerClass)) {
                        //adds class(coin) to the cell
                        insideCell.classList.add(this.takenClass);

                        //play audio for the coindrop
                        await new Sound(this.audio).dropCoin();

                        this.board = this.checkBoard.putDataInCheckBoard(this.board, i, this.dataRow, this.thisPlayer);

                        this.socket.emit('endTurn', i, this.dataRow);

                        let result = this.checkBoard.getWinner(this.board);

                        if (result != 0) {
                            this.winMatch(result);
                            break;
                        }

                        if (this.currentPlayerTurn == 1) {
                            this.currentPlayerTurn = 2;
                        } else {
                            this.currentPlayerTurn = 1;
                        }
                        turn();
                        break;
                    }
                }
            } else {
                console.log('Warte auf anderen Spieler');
                let statusBox = document.querySelector('.game__gamestatus')!;
                statusBox.innerHTML = `<p class="game__gamestatus-info">It's the opponent's turn. Wait until he places his coin.</p>`;
                let enemyChoice: number[] = [];
                //checks if someone left the game
                await new Promise((resolve, reject) => {
                    this.controller = new AbortController();
                    this.controller.signal.addEventListener('abort', () => {
                        console.log('opponentturn rejected');
                        reject();
                    });
                    this.socket.once('test', (response: any) => {
                        enemyChoice = response;
                        resolve(response);
                    });
                }).catch(() => {
                    console.log('promise rejected');
                });
                if (this.reset === true) return;
                let allRows = document.querySelectorAll('.real__grid-row');
                this.chosenCollumn = [...allRows[enemyChoice[1]].children].reverse();

                let insideCell = this.chosenCollumn[enemyChoice[0]].querySelector('.token')!;

                insideCell.classList.add(this.computerClass);

                //play audio for the coindrop
                await new Sound(this.audio).dropCoin();

                this.board = this.checkBoard.putDataInCheckBoard(this.board, enemyChoice[0], enemyChoice[1], this.currentPlayerTurn!);

                let result = this.checkBoard.getWinner(this.board);

                if (result != 0) {
                    this.winMatch(result);
                    return;
                }

                if (this.currentPlayerTurn == 1) {
                    this.currentPlayerTurn = 2;
                } else {
                    this.currentPlayerTurn = 1;
                }
                turn();
            }
        };
        this.socket.once('playerLeft', () => {
            this.structure?.resetStructure();
            this.currentPlayerTurn = 1;
            this.checkBoard = new CheckBoard(this.rows, this.collumns);
            this.reset = true;
            this.controller!.abort();
            this.showMultiplayerScreen();
        });
        if (this.reset === true) {
            return;
        }
        turn();
    }

    async init() {
        //creates the html structure for the 4 wins game
        this.structure = new Structure({
            element: this.element,
            rows: this.rows,
            collumns: this.collumns,
        });
        this.structure.init();

        await this.showTitlescreen();
        this.structure.generateSettingsOverlay(this.element); // move to end of titlescreen?
    }
}
