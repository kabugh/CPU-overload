export class Process {
    private requirement: number;
    private length: number;

    constructor(requirement: number, length: number) {
    this.requirement = requirement;
    this.length = length;
    }

    public get getRequirement(): number {
    return this.requirement;
    }

    public get getLength(): number {
    return this.length;
    }

    public set setLength(length: number) {
        this.length = length;
    }

    public doWork(): void {
        this.length--;
    }

    public get isDone(): boolean {
        return length <= 0;
    }
}