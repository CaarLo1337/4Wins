import { Config } from './config.interface';

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

    private createStructure(html: string) {
        const template = document.createElement('template');

        template.innerHTML = html.trim();

        return template.content.firstElementChild;
    }

    public waitForPlayerBox(append: boolean) {
        if (append) {
            let waitPlayerBox = this.createStructure(`
            <div class="game__waitplayerbox">
                <p>Wait for second player</p>
            </div>
            `);
            this.element.appendChild(waitPlayerBox!);
        } else {
            let waitingInfoBox = document.querySelector(
                '.game__waitplayerbox'
            )!;
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

    public async playButton(create: boolean) {
        return new Promise<string>((resolve) => {
            // start button overlay

            if (create) {
                let startBtnContainer = this.createStructure(`
                <div class="game__start">
                    <h1 class="heading">4 Gewinnt</h1>
                    <button class="btn">Start Game</button>
                    <label class="codeInputLabel">for multiplayer-mode enter a roomcode</label>
                    <input class="codeInput" maxlength="5">
                </div>
                `);

                this.element.appendChild(startBtnContainer!);
            }

            let btn = document.querySelector('.btn')!;

            if (!create) {
                let infoBox = document.createElement('span');
                infoBox.classList.add('roomInfo');
                infoBox.innerHTML = `the selected room is full.<br> please change the roomcode`;
                let startBtnBox = document.querySelector('.game__start');
                startBtnBox?.appendChild(infoBox);
                //btn.parentElement!.classList.remove('hidden');
            }

            let codeInput =
                document.querySelector<HTMLInputElement>('.codeInput')!;
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
        //FIXME: use createStructure()
        let settingsBox = document.createElement('div');
        settingsBox.classList.add('settings-box');

        element.appendChild(settingsBox);

        //settings icon
        let settingsBtn = document.createElement('div');
        settingsBtn.classList.add('settings-btn');
        let icon = document.createElement('span');
        icon.classList.add('icon');
        icon.classList.add('fa-solid');
        icon.classList.add('fa-gear');

        settingsBtn.addEventListener('click', function () {
            settingsBox.style.display =
                settingsBox.style.display === 'block' ? 'none' : 'block';
        });

        settingsBtn.appendChild(icon);
        element.appendChild(settingsBtn);
    }

    private generateBoard(element: HTMLElement) {
        //FIXME: use createStructure()
        //create backgroundbox
        let bgBox = document.createElement('div');
        bgBox.classList.add('game__backgroundbox');

        let bgInnerBox = document.createElement('div');
        bgInnerBox.classList.add('game__backgroundbox-box');

        let boxTop = document.createElement('div');
        let boxBottom = document.createElement('div');
        let boxLeft = document.createElement('div');
        let boxRight = document.createElement('div');
        boxTop.classList.add('box-top');
        boxBottom.classList.add('box-bottom');
        boxLeft.classList.add('box-left');
        boxRight.classList.add('box-right');

        bgInnerBox.append(boxTop, boxBottom, boxLeft, boxRight);

        bgBox.appendChild(bgInnerBox);
        element.appendChild(bgBox);

        //create pseudoGrid
        let pseudoGrid = document.createElement('div');
        pseudoGrid.classList.add('pseudo__grid');

        for (let i = 0; i < this.collumns; i++) {
            let gridRow = document.createElement('div');
            gridRow.classList.add('pseudo__grid-row');
            gridRow.setAttribute('data-row', i.toString());

            for (let j = 0; j < this.rows; j++) {
                let gridCell = document.createElement('div');
                gridCell.classList.add('pseudo__grid__cell');

                let cellSpace = document.createElement('div');
                cellSpace.classList.add('pseudo__grid__cell-space');

                gridCell.appendChild(cellSpace);
                gridRow.appendChild(gridCell);
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
                let gridCell = document.createElement('div');
                gridCell.classList.add('real__grid__cell');

                let token = document.createElement('div');
                token.classList.add('token');

                gridCell.appendChild(token);
                gridRow.appendChild(gridCell);
            }
            realGrid.appendChild(gridRow);
        }

        element.appendChild(realGrid);
    }

    init() {
        this.generateBoard(this.element);
    }
}

//slider höhe bei mobile dem bild anpassen
