import { Game } from './Game';
import { config } from './config';

(function () {
    //const element = document.querySelector<HTMLElement>('.game')!;
    const game = new Game(config);
    game.init();
})();
