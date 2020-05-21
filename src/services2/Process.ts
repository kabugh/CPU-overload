export class Process {
    private id: number;
    private power: number;
    private tacts: number;

    constructor(power: number, tacts: number, id?: number) {
        this.power = power;
        this.tacts = tacts;
        this.id = id || 0;
    }

    public get getId(): number {
        return this.id;
    }

    public get getPower(): number {
        return this.power;
    }

    public get getTacts(): number {
        return this.tacts;
    }

    public doWork(): void {
        this.tacts--;
    }
}