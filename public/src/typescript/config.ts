import { Config } from './config.interface';

export const config: Config = {
    rows: 6,
    collums: 8,
    mainElement: document.querySelector<HTMLElement>('.game')!,
    player: 1,
    computer: 2,
    isPlayerTurn: 1,
    playerClass: 'p-taken',
    computerClass: 'c-taken',
    audio: {
        reset: '/public/dist/sound/mixkit-classic-short-alarm-993.wav',
        win: '/public/dist/sound/mixkit-melodic-bonus-collect-1938.wav',
        dropcoin: '/public/dist/sound/8tcu2-vb9d8.wav',
        start: '/public/dist/sound/mixkit-arcade-player-select-2036.wav',
        volume: 0.4,
    },
    depth: 4,
};
