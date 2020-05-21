import { Processor } from './Processor';
import { Process } from './Process';
import { ProcessorManager } from './ProcessorManager';

export class FirstStrategy {
    private numberOfTries: number;
    private valueOfP: number;
    private processors: Processor[];

    private loads: Array<Array<number>>;
    private averageLoad: number;
    private queries: number;
    private migrations: number;

    constructor(numberOfTries: number, valueOfP: number) {
        this.numberOfTries = numberOfTries;
        this.valueOfP = valueOfP;

        this.processors = [];
        this.loads = [];
        this.averageLoad = 0;
        this.queries = 0;
        this.migrations = 0;
    }

    public addProcessor(p: Processor): void {
        this.processors.push(p);
    }

    public addProcess(p: Process): void {
        const newProcess = new Process(p.getPower, p.getTacts, p.getId);
        const processorId = ProcessorManager.getRandomInt(0, this.processors.length);
        const x: Processor = this.processors[processorId];
        for (let i = 0; i < this.numberOfTries; i++) {
            let id;
            while ((id = ProcessorManager.getRandomInt(0, this.processors.length)) == processorId);
            this.queries++;
            if (this.processors[id].getLoad < this.valueOfP) {
                this.migrations++;
                this.processors[id].addProcess(newProcess);
                return;
            }
        }
        x.addProcess(newProcess);
    }

    public step(): void {
        this.processors.forEach(processor => processor.step());
        this.calculateAverageLoad();
    }

    public calculateAverageLoad(): void {
        if (this.loads.length > 0) {
            let sum = 0;
            let amount = 0;
            this.loads.forEach(load => {
                load.forEach(i => {
                    sum += i; amount++;
                })
            })
        }
    }

    public getCurrentAverageLoad(): number {
        if (this.processors.length > 0) {
            let sum = 0;
            this.processors.forEach(processor => sum += processor.getLoad);
            return sum / this.processors.length;
        }
        return 0;
    }

    public getCurrentAverageDeviation(): number {
        if (this.processors.length > 0) {
            let average = 0;
            this.processors.forEach(processor => average += processor.getLoad);

            average /= this.processors.length;

            let sum = 0;
            this.processors.forEach(processor => sum += Math.abs(average - processor.getLoad));

            return sum /= this.processors.length;
        }
        return 0;
    }

    public saveLoads(): void {
        this.loads.push([]);
        console.log(this.loads);
        this.processors.forEach(processor => this.loads[this.loads.length - 1].push(processor.getLoad));
    }

    public getAverageDeviation(): number {
        if (this.loads.length > 0) {
            const deviations: number[] = [];
            this.loads.forEach(load => {
                let average = 0;
                load.forEach(i => average += i);

                average /= load.length;

                let sum = 0;
                load.forEach(i => sum += Math.abs(average - i));

                deviations.push(sum / load.length);
            });

            let sum = 0;
            deviations.forEach(i => sum += i);

            return sum / deviations.length;  
        }
        return 0;
    }

    public get getAverageLoad(): number {
        return this.averageLoad;
    }

    public get getQueries(): number {
        return this.queries;
    }

    public get getMigrations(): number {
        return this.migrations;
    }

    public get getProcessors(): Processor[] {
        return this.processors;
    }
}