import { Audio } from './audio.interface';

export interface Config {
    rows: number;
    collums: number;
    mainElement: HTMLElement;
    player: number;
    computer: number;
    isPlayerTurn: number;
    playerClass: string;
    computerClass: string;
    audio: Audio;
    depth: number;
    IO_SERVER: string;
}
