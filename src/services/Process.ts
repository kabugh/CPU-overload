export class Process {
    private power: number;
    private tacts: number;

    constructor(power: number, tacts: number) {
        this.power = power;
        this.tacts = tacts;
    }

    public get getPower(): number {
        return this.power;
    }

    public get getTacts(): number {
        return this.tacts;
    }

    public set setTacts(tacts: number) {
        this.tacts = tacts;
    }

    public doWork(): void {
        this.tacts--;
    }

    public get isDone(): boolean {
        return this.tacts <= 0;
    }
}