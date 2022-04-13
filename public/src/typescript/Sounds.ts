import { Audio } from './audio.interface';

export class Sound {
    dropCoinAudio: HTMLAudioElement;
    winAudio: HTMLAudioElement;
    startAudio: HTMLAudioElement;
    resetAudio: HTMLAudioElement;

    constructor(public audio: Audio) {
        this.dropCoinAudio = new Audio(this.audio.dropcoin);
        this.winAudio = new Audio(this.audio.win);
        this.resetAudio = new Audio(this.audio.reset);
        this.startAudio = new Audio(this.audio.start);

        this.dropCoinAudio.volume = this.audio.volume;
        this.winAudio.volume = this.audio.volume;
        this.startAudio.volume = this.audio.volume;
        this.resetAudio.volume = this.audio.volume;
    }

    timer(sec: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, sec);
        });
    }

    async dropCoin() {
        this.dropCoinAudio.play();
        await this.timer(1200);
    }

    async win() {
        this.winAudio.play();
        await this.timer(1200);
    }

    async reset() {
        this.resetAudio.play();
        await this.timer(1200);
    }

    async start() {
        this.startAudio.play();
        await this.timer(1200);
    }
}
