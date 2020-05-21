import { Process } from './Process'
export class Processor {
    private processes: Process[];
    private id: number;
    private load: number;
    private static ID = 0;

    constructor(id?: number) {
        this.processes = [];
        this.id = id || Processor.ID++;
        this.load = 0;
    }

    public calculateLoad(): void {
        this.processes.forEach(process => this.load += process.getPower)
        // return Math.min(100, this.load);
    }
    
    public step(): void {
        if (this.processes.length > 0) {
            const p: Process = this.processes[0];
            p.doWork();
            if (p.getTacts <= 0)
                this.processes.splice(0, 1);
            this.calculateLoad();
        }
    }

    public removeProcess(): Process {
        const p: Process = this.processes[0];
        this.processes.splice(1, 0);
        return p;
    }

    public addProcess(p: Process): void {
        this.processes.push(p);
    }

    public get getLoad(): number {
        return this.load;
    }

    public get getProcesses() {
        return this.processes;
    }

    public get getId() {
        return this.id;
    }
}