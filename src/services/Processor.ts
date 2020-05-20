import { Process } from './Process'
export class Processor {
    private processes: Process[];

    constructor() {
        this.processes = [];
    }

    public get load(): number {
        let sum = 0;
        this.processes.forEach(process => sum += +process.getRequirement)
        return Math.min(100, sum);
    }

    public workAmount(): number {
        let sum = 0;
        this.processes.forEach(process => sum += +process.getLength);
        return sum;
    }

    public doWork(): void {
        let powerLeft = 100;
        this.processes.forEach(process => {
            if (
              !(process.getLength <= 0) &&
              powerLeft >= +process.getRequirement
            ) {
              process.doWork();
              powerLeft -= process.getRequirement;
            }
        })
        this.processes.filter(process => !(process.getLength <= 0));
    }

    public get getProcesses() {
        return this.processes;
    }
}