import { Process } from './Process'
export class Processor {
    private processes: Process[];
    private numberOfTasks: number;

    constructor() {
        this.processes = [];
        this.numberOfTasks = 0;
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
        this.numberOfTasks = this.workAmount();
        this.processes.forEach((process, index) => {
            if (
              !(process.getTacts <= 0) &&
              powerLeft >= +process.getPower
            ) {
              process.doWork();
              powerLeft -= process.getPower;
            } else if (process.getTacts <= 0) {
                this.processes.splice(index, 1);
            }
        })
        // Z jakiegos powodu filter nie dziala :v zastapiony splice powyzej
        // this.processes.filter(process => !(process.getTacts <= 0));
    }

    public get getProcesses() {
        return this.processes;
    }

    public get getNumberOfTasks() {
        return this.numberOfTasks;
    }
}