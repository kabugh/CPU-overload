import { Process } from './Process'
export class Processor {
    private processes: Process[];

    constructor() {
        this.processes = [];
    }

    public get getLoad(): number {
        let sum = 0;
        this.processes.forEach(process => sum += +process.getPower)
        return Math.min(100, sum);
    }

    public workAmount(): number {
        let sum = 0;
        this.processes.forEach(process => sum += +process.getTacts);
        return sum;
    }

    public doWork(): void {
        let powerLeft = 100;
        this.processes.forEach(process => {
            if (
              !(process.getTacts <= 0) &&
              powerLeft >= +process.getPower
            ) {
              process.doWork();
              powerLeft -= process.getPower;
            }
        })
        this.processes.filter(process => !(process.getTacts <= 0));
    }

    public get getProcesses() {
        return this.processes;
    }
}