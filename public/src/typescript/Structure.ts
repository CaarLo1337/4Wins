interface StructureConfig {
    element: HTMLElement;
    rows: number;
    collumns: number;
}

export class Structure {
    element: HTMLElement;
    rows: number;
    collumns: number;
    userRoom: string | undefined;

    constructor(config: StructureConfig) {
        this.element = config.element;
        this.rows = config.rows;
        this.collumns = config.collumns;
    }

    public resetStructure() {
        let rcContainer = document.querySelector('.game__roomcode')!;
        let gsContainer = document.querySelector('.game__gamestatus')!;
        let tokens = document.querySelectorAll('.c-taken, .p-taken'!);
        for (let i = 0; i < tokens.length; i++) {
            tokens[i].classList.remove('p-taken');
            tokens[i].classList.remove('c-taken');
        }

        // this.element.removeChild(rcContainer);
        // this.element.removeChild(gsContainer);
        rcContainer?.remove();
        gsContainer?.remove();
    }

    public createStructure(html: string) {
        const template = document.createElement('template');

        template.innerHTML = html.trim();

        return template.content.firstElementChild;
    }

    public diplayPlayerStatus() {
        let psContainer = this.createStructure(`
        <div class="game__gamestatus">

        </div>
        `);
        this.element.appendChild(psContainer!);
    }

    public displayRoomcode(roomcode: string) {
        let rcContainer = this.createStructure(`
        <div class="game__roomcode">
            <p class="game__roomcode-info">Room: ${roomcode}</p>
        </div>
        `);
        this.element.appendChild(rcContainer!);
    }

    public waitForPlayerBox(append: boolean) {
        if (append) {
            let waitPlayerBox = this.createStructure(`
            <div class="game__waitplayerbox">
                <p class="game__waitplayerbox-info">Wait for second player to connect!</p>
            </div>
            `);
            this.element.appendChild(waitPlayerBox!);
        } else {
            let waitingInfoBox = document.querySelector('.game__waitplayerbox')!;
            this.element.removeChild(waitingInfoBox);
        }
    }

    public showGamemode(gamemode: string) {
        let gamemodeBox = document.createElement('div');
        gamemodeBox.classList.add('game__gamemodebox');
        if (gamemode === 'vsComputer') {
            gamemodeBox.innerHTML = '<p>Player vs. Computer</p>';
        } else if (gamemode === 'vsPlayer') {
            gamemodeBox.innerHTML = '<p>Player vs. Player</p>';
        }
        this.element.appendChild(gamemodeBox);
    }

    public async choseMpRoom(redo: boolean) {
        return new Promise<string>((resolve) => {
            let mpContainer: Element | null;
            if (redo) {
                mpContainer = this.createStructure(`
                <div class="game__mproom">
                    <label class="codeInputLabel">Enter an Roomcode to join or create a Room</label>
                    <label class="codeInputLabel red">*Room is full or your Roomcode is invalid*</label>
                    <div class="mp-form">
                        <input class="codeInput red" maxlength="5" >
                        <button class="game__mproom-btn-mp">START</button>
                    </div>
                </div>
                `);
            } else {
                mpContainer = this.createStructure(`
                <div class="game__mproom">
                    <label class="codeInputLabel">Enter an Roomcode to join or create a Room</label>
                    <div class="mp-form">
                        <input class="codeInput" maxlength="5" required>
                        <button class="game__mproom-btn-mp">START</button>
                    </div>
                </div>
                `);
            }

            this.element.appendChild(mpContainer!);

            let startBtn = document.querySelector('.game__mproom-btn-mp');
            let codeInput = document.querySelector<HTMLInputElement>('.codeInput')!;
            let BtnEvent = function (this: any): void {
                let userRoom = codeInput.value;
                let startMenu = document.querySelector('.game__mproom')!;
                let gameContainer = document.querySelector('.game')!;
                gameContainer.removeChild(startMenu);
                startBtn?.removeEventListener('click', BtnEvent);
                resolve(userRoom);
            };
            startBtn?.addEventListener('click', BtnEvent);
        });
    }

    public async choseGamemode() {
        return new Promise<string>((resolve) => {
            let gmContainer = this.createStructure(`
            <div class="game__start">
                <h1 class="game__start-heading">Connect 4</h1>
                <button class="game__start-btn-sp">Singleplayer</button>
                <button class="game__start-btn-mp">Multiplayer</button>
            </div>
            `);
            this.element.appendChild(gmContainer!);

            let spBtn = document.querySelector('.game__start-btn-sp');
            let mpBtn = document.querySelector('.game__start-btn-mp');
            let titlescreen = document.querySelector('.game__start');
            let gameContainer = document.querySelector('.game');

            let spEvent = function (this: any) {
                gameContainer?.removeChild(titlescreen!);
                spBtn?.removeEventListener('click', spEvent);
                resolve('sp');
            };
            spBtn?.addEventListener('click', spEvent);

            let mpEvent = function (this: any) {
                gameContainer?.removeChild(titlescreen!);
                spBtn?.removeEventListener('click', mpEvent);
                resolve('mp');
            };
            mpBtn?.addEventListener('click', mpEvent);
        });
    }

    public async playButton(create: boolean) {
        return new Promise<string>((resolve) => {
            // Generates the overlay with button and input field
            let startBtnContainer = this.createStructure(`
            <div class="game__start">
                <h1 class="heading">4 Gewinnt</h1>
                <button class="btn">Start Game</button>
                <label class="codeInputLabel">for multiplayer-mode enter a roomcode</label>
                <input class="codeInput" maxlength="5">
            </div>
            `);
            this.element.appendChild(startBtnContainer!);

            let btn = document.querySelector('.btn')!;

            // when room is full the player gets a messagebox that the room he chose is full
            if (create === false) {
                let infoBox = document.createElement('span');
                infoBox.classList.add('roomInfo');
                infoBox.innerHTML = `the selected room is full.<br> please change the roomcode`;
                let startBtnBox = document.querySelector('.game__start');
                startBtnBox?.appendChild(infoBox);
            }

            let codeInput = document.querySelector<HTMLInputElement>('.codeInput')!;
            let BtnEvent = function (this: any): void {
                let userRoom = codeInput.value;
                let startMenu = document.querySelector('.game__start')!;
                let gameContainer = document.querySelector('.game')!;
                gameContainer.removeChild(startMenu);
                btn.removeEventListener('click', BtnEvent);
                resolve(userRoom);
            };
            btn?.addEventListener('click', BtnEvent);
        });
    }

    public generateSettingsOverlay(element: HTMLElement) {
        //settings overlay
        let newSettingsBox = this.createStructure(`
        <div class="game__settings-box"></div>
        `);
        element.appendChild(newSettingsBox!);

        //settings icon
        let settingsBtn = document.createElement('div');
        settingsBtn.classList.add('game__settings-btn');
        let icon = document.createElement('span');
        icon.classList.add('icon');
        icon.classList.add('fa-solid');
        icon.classList.add('fa-gear');

        let settingsBox = document.querySelector<HTMLElement>('.game__settings-box')!;
        settingsBtn.addEventListener('click', function () {
            settingsBox.style.display = settingsBox.style.display === 'block' ? 'none' : 'block';
        });

        settingsBtn.appendChild(icon);
        element.appendChild(settingsBtn);
    }

    private generateBoard(element: HTMLElement) {
        //create backgroundbox
        let bgBox = this.createStructure(`
        <div class="game__backgroundbox">
            <div class="game__backgroundbox-box">
                <div class="box-top"></div>
                <div class="box-bottom"></div>
                <div class="box-left"></div>
                <div class="box-right"></div>
            </div>
        </div>
        `);
        element.appendChild(bgBox!);

        //create pseudoGrid
        let pseudoGrid = document.createElement('div');
        pseudoGrid.classList.add('pseudo__grid');

        for (let i = 0; i < this.collumns; i++) {
            let gridRow = document.createElement('div');
            gridRow.classList.add('pseudo__grid-row');
            gridRow.setAttribute('data-row', i.toString());
            for (let j = 0; j < this.rows; j++) {
                let gridCell = this.createStructure(`
                <div class="pseudo__grid__cell">
                    <div class="pseudo__grid__cell-space"></div>
                </div>
                `);
                gridRow.appendChild(gridCell!);
            }
            pseudoGrid.appendChild(gridRow);
        }
        element.appendChild(pseudoGrid);

        //create realGrid
        let realGrid = document.createElement('div');
        realGrid.classList.add('real__grid');

        for (let i = 0; i < this.collumns; i++) {
            let gridRow = document.createElement('div');
            gridRow.classList.add('real__grid-row');

            for (let j = 0; j < this.rows; j++) {
                let gridCell = this.createStructure(`
                <div class="real__grid__cell">
                    <div class="token"></div>
                </div>
                `);
                gridRow.appendChild(gridCell!);
            }
            realGrid.appendChild(gridRow);
        }

        element.appendChild(realGrid);
    }

    init() {
        this.generateBoard(this.element);
    }
}
