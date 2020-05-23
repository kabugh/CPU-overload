import {
    Processor
} from './Processor';
import {
    Process
} from './Process'
import { Strategy } from './Strategy';
export class Program {
    private numberOfProcessors: number;
    private minProcesses: number;
    private maxProcesses: number;
    private valueOfP: number;
    private valueOfR: number;
    private numberOfTries: number;
    private overloadCoefficient: number;
    private chosenMode: number;
    private displayResults: boolean;

    private processors: Processor[];
    private results: number[];
    private compareStrategies: boolean;
    private stepLock: number;
    private processCounter: number;
    private generationLock: number;
    private queries: number;
    private migrations: number;
    private steps: number;
    private load: number[];
  
    private savedNumberOfProcesses: number;
    private savedResults: Strategy[];
    private isOverloaded: boolean;
    private overloadCounter: number;
    private interval: any;

    constructor(
        numberOfProcessors: number,
        minProcesses: number,
        maxProcesses: number,
        compareStrategies: boolean,
        valueOfP: number,
        valueOfR: number,
        numberOfTries: number,
        overloadCoefficient: number,
        chosenMode: number
    ) {
        // dynamic parameters of a simulation
        this.numberOfProcessors = numberOfProcessors;
        this.minProcesses = minProcesses;
        this.maxProcesses = maxProcesses;
        this.valueOfP = valueOfP;
        this.valueOfR = valueOfR;
        this.numberOfTries = numberOfTries;
        this.overloadCoefficient = overloadCoefficient;
        this.chosenMode = chosenMode;

        if (this.chosenMode > 2) this.chosenMode = 0;
        this.displayResults = false;
        this.queries = 0;
        this.migrations = 0;
        this.steps = 0;
        this.load = [];
        this.stepLock = 0;
        this.generationLock = 0;
        this.processCounter = this.getRandomInt(
            this.minProcesses,
            this.maxProcesses + 1
        );
        this.savedNumberOfProcesses = this.processCounter;
        this.savedResults = [new Strategy(), new Strategy(), new Strategy()];
        this.results = [];
        this.compareStrategies = compareStrategies;
        this.isOverloaded = false;
        this.overloadCounter = 0;

        this.processors = [];
        for (let i = 0; i < numberOfProcessors; i++)
            this.processors.push(new Processor());
    }
    public runSimulation(): void {
        this.prepareSimulation();
        this.interval = setInterval(() => {
            this.timerTick();
        }, 200);
    }

    public stop(): void {
        clearInterval(this.interval);
        this.displayResults = true;
          if (!this.compareStrategies) {
                console.log(
                  "Average load: " +
                    this.savedResults[0].getAverageLoad
                );
                console.log(
                  "Average deviation: " + this.savedResults[0].getAverageBias
                );
                console.log("Queries: " + this.savedResults[0].getQueries);
                console.log("Migrations: " + this.savedResults[0].getMigrations);
          } else {
            let counter = 0;
            this.savedResults.forEach(strategy => {
                  console.log(
                    `${counter + 1}. Average load: ` + strategy.getAverageLoad
                  );
                  console.log("Average deviation: " + strategy.getAverageBias);
                  console.log("Queries: " + strategy.getQueries);
                  console.log("Migrations: " + strategy.getMigrations);
                  counter++;
                })
            }
    }

    private prepareSimulation(): void {
        this.displayResults = false;
        this.queries = 0;
        this.migrations = 0;
        this.steps = 0;
        this.load = [];
        this.stepLock = 0;
        this.generationLock = 0;
        this.processCounter = this.getRandomInt(
            this.minProcesses,
            this.maxProcesses + 1
        );
        this.savedNumberOfProcesses = this.processCounter;
        this.isOverloaded = false;
        this.overloadCounter = 0;

        this.processors = [];
        for (let i = 0; i < this.numberOfProcessors; i++)
            this.processors.push(new Processor());
    }
  
    private repeatSimulation(): void {
      this.displayResults = false;
      this.queries = 0;
      this.migrations = 0;
      this.steps = 0;
      this.load = [];
      this.stepLock = 0;
      this.generationLock = 0;
      this.processCounter = this.savedNumberOfProcesses;
      this.results = [];
      this.isOverloaded = false;
      this.overloadCounter = 0;

      this.processors = [];
      for (let i = 0; i < this.numberOfProcessors; i++)
        this.processors.push(new Processor());
    }

    public timerTick(): void {
        if (!this.isDone()) {
            this.step();
        }
    }

    private isDone() {
        let isDone = true;
        this.processors.forEach((p) => {
            if (p.getLoad != 0) isDone = false;
        });
        return isDone && this.processCounter == 0;
    }

    public firstStrategy(process: Process) {
        let triesLeft: number = this.numberOfTries;
        let isDone = false;
        while (triesLeft-- > 0 && !isDone) {
            // access random processor
            const send: number = this.getRandomInt(0, this.processors.length);
            const target: Processor = this.processors[send];
            this.queries++;
            if (target.getLoad < this.valueOfP && (target.getLoad + process.getPower <= 100)) {  //overload
              target.getProcesses.push(process);
              this.migrations++;
              isDone = true;
            } else if (!(target.getLoad + process.getPower <= 100)) {
              this.queries++;
              // this.overloadCounter++;
              // if more than half of the processors get overloaded - the overload mode is turned on
              if (
                this.overloadCounter >
                this.overloadCoefficient * this.numberOfProcessors
              ) {
                this.isOverloaded = true;
              }
            }
        }
        if (!isDone) {
            const which: number = this.getRandomInt(0, this.processors.length);
            const processor: Processor = this.processors[which];
            this.queries++;
            if (processor.getLoad + process.getPower <= 100) //overload
                processor.getProcesses.push(process);
            else {
              this.overloadCounter++;
              if (
                this.overloadCounter >
                this.overloadCoefficient * this.numberOfProcessors
              ) {
                this.isOverloaded = true;
              }
            }    
        }
    }

    public secondStrategy(process: Process) {
        const which: number = this.getRandomInt(0, this.processors.length);
        const processor: Processor = this.processors[which];
        this.queries++;
        if (processor.getLoad >= this.valueOfP) {
          let allBusy = true;
          for (let j = 0; j < this.processors.length && allBusy; j++) {
            this.queries++;
            if (+this.processors[j].getLoad < this.valueOfP) allBusy = false;
          }
          if (!allBusy) {
            let randomIndex = 0;
            do {
              randomIndex = this.getRandomInt(0, this.processors.length);
              this.queries++;
            } while (+this.processors[randomIndex].getLoad >= this.valueOfP);
            this.processors[randomIndex].getProcesses.push(process);
            this.migrations++;
          } else {
            this.queries++;
            if (processor.getLoad + process.getPower <= 100) {
              processor.getProcesses.push(process);
            } else {
              this.overloadCounter++;
              if (
                this.overloadCounter >
                this.overloadCoefficient * this.numberOfProcessors
              ) {
                this.isOverloaded = true;
              }
            }
          } 
        } else {
          this.queries++;
          if (processor.getLoad + process.getPower <= 100) {
              processor.getProcesses.push(process);
          } else {
            this.overloadCounter++;
            if (
              this.overloadCounter >
              this.overloadCoefficient * this.numberOfProcessors
            ) {
              this.isOverloaded = true;
            }
          }
        }
    }


    public thirdStrategyProcess(process: Process): void {
        if (process != null) {
            const which: number = this.getRandomInt(0, this.processors.length);
            const processor: Processor = this.processors[which];
            this.queries++;
            if (processor.getLoad + process.getPower <= 100) {
              processor.getProcesses.push(process);
            } else {
              this.overloadCounter++;
              if (
                this.overloadCounter >
                this.overloadCoefficient * this.numberOfProcessors
              ) {
                this.isOverloaded = true;
              }
            }
        }
        for (let j = 0; j < this.processors.length; j++)
            this.thirdStrategyProcessor(this.processors[j]);
    }

    public thirdStrategyProcessor(processor: Processor): void {
        if (
          processor.getLoad < this.valueOfR &&
          processor.getLoad < this.valueOfP
        ) {
          const ask = new Set<number>();
          let q = this.getRandomInt(0, this.processors.length);
          while (q-- > 0) {
            const randomIndex: number = this.getRandomInt(
              0,
              this.processors.length
            );
            if (this.processors[randomIndex] != processor) ask.add(randomIndex);
          }
          ask.forEach((randomIndex) => {
            this.queries++;
            while (
              this.processors[randomIndex].getLoad >= this.valueOfP &&
              processor.getLoad < this.valueOfP
            ) {
              const index: number = this.getRandomInt(
                0,
                this.processors[randomIndex].getProcesses.length
              );

              const process: Process = this.processors[randomIndex]
                .getProcesses[index];
              this.queries++;
              if (processor.getLoad + process.getPower <= 100) {
                this.processors[randomIndex].getProcesses.splice(index, 1);
                processor.getProcesses.push(process);
                this.migrations++;
              } else {
                this.overloadCounter++;
                if (
                  this.overloadCounter >
                  this.overloadCoefficient * this.numberOfProcessors
                ) {
                  this.isOverloaded = true;
                }
              }
            }
          });
        }
    }

    private step(): void {
        const mode = this.chosenMode;
        this.generationLock--;
        if (this.processCounter > 0 && this.generationLock <= 0) {
            const count: number = Math.min(
                this.processCounter,
                this.getRandomInt(0, 10)
            );
            for (let i = 0; i < count; i++) {
                const process: Process = new Process(
                    this.getRandomInt(1, 50),
                    this.getRandomInt(1, 100)
                );
                    if (mode == 0) this.firstStrategy(process);
                    else if (mode == 1) this.secondStrategy(process);
                    else this.thirdStrategyProcess(process);        

                this.processCounter--;
            }
            this.generationLock += this.getRandomInt(0, 3);
        }

        this.steps++;

        this.processors.forEach((processor) => {
            this.load.push(processor.getLoad / 100);
            processor.doWork();
        });
        // if (this.isDone() || this.processCounter == 0) {
        if (this.isDone()) {
            let biasAverage = 0;
            this.load.forEach((d) => (biasAverage += d));
            biasAverage /= this.load.length;

            const averageLoad: number = biasAverage * 10000;
            for (let i = 0; i < this.load.length; i++)
                this.load[i] = Math.abs(this.load[i] - biasAverage);

            let bias = 0;
            this.load.forEach((d) => (bias += d * 10000));
            bias /= this.load.length;

            this.savedResults[mode].averageLoad = this.roundNumber(averageLoad) / 100;
            this.savedResults[mode].averageBias = this.roundNumber(bias) / 100;
            this.savedResults[mode].queries = this.roundNumber(
              this.queries
            );
            this.savedResults[mode].migrations = this.roundNumber(
              this.migrations
            );
            if (
              !this.compareStrategies ||
              (this.compareStrategies && mode == 2)
            )
              this.stop();
            else if (this.compareStrategies) {
              this.repeatSimulation();
              if (this.chosenMode == 0)
                this.chosenMode = 1;
              else if (this.chosenMode == 1)
                this.chosenMode = 2;
            }
        }
    }

    private getRandomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    private roundNumber(number: number) {
        return Math.round(number * 100) / 100;
    }
}