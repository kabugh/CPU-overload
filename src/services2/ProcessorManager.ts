import { FirstStrategy } from './FirstStrategy';
import { SecondStrategy } from './SecondStrategy';
import { ThirdStrategy } from './ThirdStrategy';
import { Processor } from './Processor';
import { Process } from './Process';

export class ProcessorManager {
    private numberOfProcessors: number;
    private minProcesses: number;
    private maxProcesses: number;
    private compareStrategies: boolean;
    private valueOfP: number;
    private valueOfR: number;
    private numberOfTries: number;
    private chosenMode: number;

    private strategies: (FirstStrategy | SecondStrategy | ThirdStrategy)[];
    private displayResults: boolean;
    private steps: number;
    private processCounter: number;
    private interval: any;


    constructor(
        numberOfProcessors: number,
        minProcesses: number,
        maxProcesses: number,
        compareStrategies: boolean,
        valueOfP: number,
        valueOfR: number,
        numberOfTries: number,
        chosenMode: number
    ) {
        // dynamic parameters of a simulation
        this.numberOfProcessors = numberOfProcessors;
        this.minProcesses = minProcesses;
        this.maxProcesses = maxProcesses;
        this.compareStrategies = compareStrategies;
        this.valueOfP = valueOfP;
        this.valueOfR = valueOfR;
        this.numberOfTries = numberOfTries;
        this.chosenMode = chosenMode;

        this.strategies = [];
        this.strategies.push(new FirstStrategy(numberOfTries, valueOfP));
        this.strategies.push(new SecondStrategy(valueOfP));
        this.strategies.push(new ThirdStrategy(valueOfP, valueOfR));
        this.displayResults = false;
        this.steps = 0;
        this.processCounter = ProcessorManager.getRandomInt(
          this.minProcesses,
          this.maxProcesses + 1
        );
        this.generateProcessors(numberOfProcessors);
    }

    private runSimulation(): void {
    this.prepareSimulation();
    this.interval = setInterval(() => {
        this.step();
    }, 200);
    }

    private stop(): void {
        clearInterval(this.interval);
    }

    private prepareSimulation(): void {
        this.strategies = [];
        this.strategies.push(new FirstStrategy(this.numberOfTries, this.valueOfP));
        this.strategies.push(new SecondStrategy(this.valueOfP));
        this.strategies.push(new ThirdStrategy(this.valueOfP, this.valueOfR));
        this.displayResults = false;
        this.steps = 0;
        this.processCounter = ProcessorManager.getRandomInt(
          this.minProcesses,
          this.maxProcesses + 1
        );
        this.generateProcessors(this.numberOfProcessors);
    }

    private generateProcessors(numberOfProcessors: number): void {
        for (let i = 0; i < numberOfProcessors; i++) {
            const processor = new Processor(i);
            for (const strategy of this.strategies)
                strategy.addProcessor(new Processor(processor.getId));
        }
    }

    private step(): void {
        if (this.processCounter > 0) {
            // const count: number = Math.min(this.processCounter, randomGeneration.Next(10));
            const count: number = Math.min(
                this.processCounter,
                ProcessorManager.getRandomInt(0, 10)
            );
            for (let i = 0; i < count; i++) {
                const process: Process = new Process(
                    ProcessorManager.getRandomInt(1, 50),
                    ProcessorManager.getRandomInt(1, 100)
                );
                this.strategies.forEach(strategy => strategy.addProcess(process));
                this.processCounter--;
            }
        }

        this.strategies.forEach(strategy => strategy.step());

        if (this.steps % 25 == 0) {
            this.strategies.forEach(strategy => strategy.saveLoads());
        }

        this.steps++;
    }
    public static getRandomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    public static roundNumber(number: number) {
        return Math.round(number * 100) / 100;
    }
}