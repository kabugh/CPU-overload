import { Processor } from './Processor';
import { Process } from './Process'
export class Program {
         private numberOfProcessors: number;
         private minProcesses: number;
         private maxProcesses: number;
         private valueOfP: number;
         private valueOfR: number;
         private numberOfTries: number;
         private valueOfZ: number;
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

         private interval: any;

         constructor(
           numberOfProcessors: number,
           minProcesses: number,
           maxProcesses: number,
           compareStrategies: boolean,
           valueOfP: number,
           valueOfR: number,
           numberOfTries: number,
           valueOfZ: number,
           chosenMode: number
         ) {
           // dynamic parameters of a simulation
           this.numberOfProcessors = numberOfProcessors;
           this.minProcesses = minProcesses;
           this.maxProcesses = maxProcesses;
           this.valueOfP = valueOfP;
           this.valueOfR = valueOfR;
           this.numberOfTries = numberOfTries;
           this.valueOfZ = valueOfZ;
           this.chosenMode = chosenMode;

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
           this.results = [];
           this.compareStrategies = compareStrategies;

           this.processors = [];
           for (let i = 0; i < numberOfProcessors; i++)
             this.processors.push(new Processor());
         }
         public runSimulation(): void {
           this.prepareSimulation();
           this.interval = setInterval(() => {
             this.timerTick();
           }, 200);
          // for(let i = 0; i < 10; i++)
          //   this.timerTick()
         }

         public stop(): void {
           clearInterval(this.interval);
           this.displayResults = true;
           if (this.results.length > 0) {
             console.log(
               "Średnie obciążenie procesorów: " + this.results[0] / 100.0
             );
             console.log(
               "Średnie odchylenie: " + this.results[1] / 100.0
             );
             console.log("Zapytań o obciążenie: " + this.results[2]);
             console.log("Migracje: " + this.results[3]);
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
           this.results = [];

           this.processors = [];
           for (let i = 0; i < this.numberOfProcessors; i++)
             this.processors.push(new Processor());
         }

         public timerTick(): void {
           if (this.stepLock-- <= 0 && !this.isDone()) {
             this.step();
             const trackBarSpeed = 10;
             const maxtrackBarSpeed = 10;
             this.stepLock =
               (Math.sqrt(120) - Math.sqrt(trackBarSpeed - 1)) * 2;
             if (trackBarSpeed == maxtrackBarSpeed) this.stepLock = 0;
           }
         }

         private getMode(): number {
           return this.chosenMode;
         }

         private isDone() {
           let isDone = true;
           this.processors.forEach((p) => {
             if (p.load != 0) isDone = false;
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
             if (target.load < this.valueOfP) {
               target.getProcesses.push(process);
               this.migrations++;
               isDone = true;
             }
           }
           if (!isDone) {
             const which: number = this.getRandomInt(0, this.processors.length);
             const processor: Processor = this.processors[which];
             processor.getProcesses.push(process);
           }
         }

         public secondStrategy(process: Process) {
           const which: number = this.getRandomInt(0, this.processors.length);
           const processor: Processor = this.processors[which];
           if (processor.load >= this.valueOfP) {
             let allBusy = true;
             for (let j = 0; j < this.processors.length && allBusy; j++) {
               this.queries++;
               if (+this.processors[j].load < this.valueOfP) allBusy = false;
             }
             if (!allBusy) {
               let randomIndex = 0;
               do {
                 randomIndex = this.getRandomInt(0, this.processors.length);
                 this.queries++;
               } while (+this.processors[randomIndex].load >= this.valueOfP);
               this.processors[randomIndex].getProcesses.push(process);
               this.migrations++;
             } else processor.getProcesses.push(process);
           } else processor.getProcesses.push(process);
         }

         public thirdStrategy(): void {
           for (let j = 0; j < this.processors.length; j++)
             this.thirdStrategyProcessor(this.processors[j]);
         }

         public thirdStrategyProcess(process: Process): void {
           if (process != null) {
             const which: number = this.getRandomInt(0, this.processors.length);
             const processor: Processor = this.processors[which];
             processor.getProcesses.push(process);
           }
           for (let j = 0; j < this.processors.length; j++)
             this.thirdStrategyProcessor(this.processors[j]);
         }

         public thirdStrategyProcessor(processor: Processor): void {
           if (
             processor.load < this.valueOfR &&
             processor.load < this.valueOfP
           ) {
             const ask = new Set<number>();
             let q = this.getRandomInt(0, this.processors.length);
             while (q-- > 0) {
               const randomIndex: number = this.getRandomInt(
                 0,
                 this.processors.length
               );
               if (this.processors[randomIndex] != processor)
                 ask.add(randomIndex);
             }
             ask.forEach((randomIndex) => {
               this.queries++;
               while (
                 this.processors[randomIndex].load >= this.valueOfP &&
                 processor.load < this.valueOfP
               ) {
                 const index: number = this.getRandomInt(
                   0,
                   this.processors[randomIndex].getProcesses.length
                 );
                 const process: Process = this.processors[randomIndex]
                   .getProcesses[index];
                 this.processors[randomIndex].getProcesses.splice(index, 1);
                 processor.getProcesses.push(process);
                 this.migrations++;
               }
             });
           }
         }

         private step(): void {
           const mode = this.getMode();
           this.generationLock--;
           if (this.processCounter > 0 && this.generationLock <= 0) {
             // const count: number = Math.min(this.processCounter, randomGeneration.Next(10));
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
             const previousLoad: number = processor.load;
             this.load.push(processor.load / 100);
             processor.doWork();
             if (mode == 2 && processor.load != previousLoad)
               this.thirdStrategy();
           });
           if (this.isDone() || this.processCounter == 0) {
          //  if (this.isDone()) {
             let biasAverage = 0;
             this.load.forEach((d) => (biasAverage += d));
             biasAverage /= this.load.length;

             const averageLoad: number = biasAverage * 10000;
             for (let i = 0; i < this.load.length; i++)
               this.load[i] = Math.abs(this.load[i] - biasAverage);

             let bias = 0;
             this.load.forEach((d) => (bias += d * 10000));
             bias /= this.load.length;

             this.results[0] = this.roundNumber(averageLoad);
             this.results[1] = this.roundNumber(bias);
             this.results[2] = this.roundNumber(this.queries);
             this.results[3] = this.roundNumber(this.migrations);
             this.stop();
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

