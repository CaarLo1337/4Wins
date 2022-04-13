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
        this.socket = io('http://localhost:3000/');
        this.allPlayers = [];
    }

    userConnect() {
        this.socket.on('connect', () => {
            console.log(`You connected with the id: ${this.socket.id}`);
        });
    }

    timer(sec: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, sec);
        });
    }

    // userJoinRoom() {
    //     console.log('user joins room');
    // }

    awaitClick(): Promise<void> {
        return new Promise((resolve) => {
            // get all real collumns
            let allRows = document.querySelectorAll('.real__grid-row');

            // transforms the pseudocollumn to the realcollumn
            let saveElementForPlayer = (element: HTMLElement): void => {
                this.dataRow = parseInt(element.dataset.row!);
                this.chosenCollumn = [
                    ...allRows[this.dataRow].children,
                ].reverse();
            };

            // the event that resolves the promise
            let event = function (this: HTMLElement): void {
                saveElementForPlayer(this);
                pseudoRows.forEach((e) => {
                    e.removeEventListener('click', event);
                });
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

    winMatch(winner: number) {
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
                if (
                    (i === 5 &&
                        insideCell.classList.contains(this.playerClass)) ||
                    (i === 5 &&
                        insideCell.classList.contains(this.computerClass))
                ) {
                    turn();
                    break;
                }

                // check if the current row contains a coin and if not place your coin and finish the turn for the current player
                if (
                    !insideCell.classList.contains(this.computerClass) &&
                    !insideCell.classList.contains(this.playerClass)
                ) {
                    //adds class(coin) to the cell
                    insideCell.classList.add(this.takenClass);

                    //play audio for the coindrop
                    await new Sound(this.audio).dropCoin();

                    //put the data for the current player in checkboard
                    this.board = this.checkBoard.putDataInCheckBoard(
                        this.board,
                        i,
                        this.dataRow,
                        this.isPlayerTurn
                    );

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

    async initRoom(initStructure: boolean) {
        this.userRoom = await this.structure?.playButton(initStructure);
        let isPlayerInRoom;
        if (this.userRoom === '') {
            //console.log('user plays against computer');

            this.gameMode = 'vsComputer';
        } else {
            //sends join request to the server for the chosen room number
            //console.log(`request to join room: ${this.userRoom}`);

            await new Promise((resolve) => {
                this.socket.emit('join', this.userRoom, (response: any) => {
                    console.log(response);
                    isPlayerInRoom = response;
                    resolve(response);
                });
            });

            if (isPlayerInRoom) {
                //console.log('do it again');
                await this.initRoom(false);
            } else {
                this.gameMode = 'vsPlayer';
            }
        }
    }

    setTokenClassForPlayer() {
        this.takenClass = this.playerClass;
    }

    async startMultiplayerGameLoop() {
        const turn = async () => {
            if (this.currentPlayerTurn === this.thisPlayer) {
                console.log(`Du bist am zug, Spieler ${this.thisPlayer}`);

                await this.awaitClick();

                for (let i = 0; i < this.chosenCollumn.length; i++) {
                    let insideCell =
                        this.chosenCollumn[i].querySelector('.token')!;

                    // check if the selected row is full and do turn() again if full
                    if (
                        (i === 5 &&
                            insideCell.classList.contains(this.playerClass)) ||
                        (i === 5 &&
                            insideCell.classList.contains(this.computerClass))
                    ) {
                        turn();
                        break;
                    }
                    // check if the current row contains a coin and if not place your coin and finish the turn for the current player
                    if (
                        !insideCell.classList.contains(this.computerClass) &&
                        !insideCell.classList.contains(this.playerClass)
                    ) {
                        //adds class(coin) to the cell
                        insideCell.classList.add(this.takenClass);

                        //play audio for the coindrop
                        await new Sound(this.audio).dropCoin();

                        //TODO: set checkboard
                        //TODO: check for winner

                        console.log(i);
                        console.log(this.dataRow);
                        this.socket.emit('endTurn', i, this.dataRow);

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

                let enemyChoice: number[] = [];
                await new Promise((resolve) => {
                    this.socket.once('test', (response: any) => {
                        enemyChoice = response;
                        resolve(response);
                    });
                });
                let allRows = document.querySelectorAll('.real__grid-row');
                this.chosenCollumn = [
                    ...allRows[enemyChoice[1]].children,
                ].reverse();

                let insideCell =
                    this.chosenCollumn[enemyChoice[0]].querySelector('.token')!;

                insideCell.classList.add(this.computerClass);

                //play audio for the coindrop
                await new Sound(this.audio).dropCoin();
                if (this.currentPlayerTurn == 1) {
                    this.currentPlayerTurn = 2;
                } else {
                    this.currentPlayerTurn = 1;
                }
                turn();
            }
        };
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

        this.userConnect();

        await this.initRoom(true);

        if (this.gameMode === 'vsComputer') {
            this.structure.showGamemode(this.gameMode);
            this.startGameLoop();
        } else if (this.gameMode === 'vsPlayer') {
            //console.log('player vs player');
            this.structure.showGamemode(this.gameMode);

            await new Promise((resolve) => {
                this.socket.emit(
                    'getAllPlayerInRoom',
                    this.userRoom,
                    (response: any) => {
                        this.allPlayers = response;
                        resolve(response);
                    }
                );
            });

            if (this.allPlayers.length !== 2) {
                this.structure.waitForPlayerBox(true);
                await new Promise((resolve) => {
                    this.socket.on('playerJoined', (response: any) => {
                        this.allPlayers = response;
                        this.structure?.waitForPlayerBox(false);
                        resolve(response);
                    });
                });
            }
            this.thisPlayer = this.allPlayers.indexOf(this.socket.id) + 1;
            this.currentPlayerTurn = 1;
            //TODO: start gameloop for multiplayer here

            this.setTokenClassForPlayer();
            this.startMultiplayerGameLoop();
        }
        this.structure.generateSettingsOverlay(this.element);
    }
}

//TODO: Hintergrund Grün wenn man gewinnt
//TODO: replace socket.on with socket.once
//TODO: add listener for player disconnect in multiplayergame
