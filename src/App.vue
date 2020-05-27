<template>
  <div id="app">
    <h3>Processors load balancing simulation</h3>
    <div class="controls__container">
      <div class="inputs__container">
        <div
          class="input__wrapper"
          v-for="(option, index) in Object.values(this.options)"
          :key="index"
        >
          <label for="numberOfProcesses">{{ option.name }}</label>
          <input
            v-if="!option.maxValue"
            :name="option.name"
            type="number"
            v-model="option.value"
            :placeholder="option.name"
          />
          <input
            v-else
            :max="option.maxValue"
            :name="option.name"
            type="number"
            v-model="option.value"
            :placeholder="option.name"
          />
        </div>
        <div class="input__wrapper">
          <label for="numberOfProcesses">{{ chosenMode.name }}</label>
          <select id="pet-select" v-model="chosenMode.value">
            <option value="0">1</option>
            <option value="1">2</option>
            <option value="2">3</option>
            <option value="3">Compare simulations</option>
          </select>
        </div>
      </div>
      <div class="buttons__container">
        <button @click="runSimulation">Start</button>
        <button
          @click="stopSimulation"
          v-if="Object.keys(this.program).length > 0 && !program.displayResults"
        >
          Stop
        </button>
      </div>
      <div class="results__container">
        <div
          class="detailedResults__wrapper"
          v-for="(result, j) in program.savedResults"
          :key="j"
        >
          <div
            class="detailedResults"
            v-if="
              program.displayResults && program.savedResults[j].getQueries > 0
            "
          >
            <h3>Results of strategy {{ j + 1 }}</h3>
            <h4 v-if="program.isOverloaded">
              The overload has occured - failed to distribute all the processes
            </h4>
            <p>
              Number of queries:
              {{ program.savedResults[j].getQueries }}
            </p>
            <p>
              Number of migrations:
              {{ program.savedResults[j].getMigrations }}
            </p>
            <p>
              Average load:
              {{ program.savedResults[j].getAverageLoad | fixedDecimal }}
            </p>
            <p>
              Average deviation:
              {{ program.savedResults[j].getAverageBias | fixedDecimal }}
            </p>
            <p>Number of processes: {{ program.savedNumberOfProcesses }}</p>
            <p v-if="program.overloadCounter > 0">
              Number of rejected processes: {{ program.overloadCounter }}
            </p>
          </div>
        </div>
        <div
          class="currentDetails"
          v-if="!program.displayResults && !program.isOverloaded"
        >
          <h3 v-if="program.queries > 0 || program.processCounter > 0">
            Simulation {{ program.chosenMode + 1 }}
          </h3>
          <p v-if="program.queries > 0">
            Number of queries: {{ program.queries }}
          </p>
          <p v-if="program.migrations > 0">
            Number of migrations: {{ program.migrations }}
          </p>
          <p v-if="program.processCounter > 0">
            Number of generated processes: {{ program.savedNumberOfProcesses }}
          </p>
          <p v-if="program.processCounter > 0">
            Processes left: {{ program.processCounter }}
          </p>
        </div>
        <div
          class="currentDetails"
          v-else-if="program.isOverloaded && !program.displayResults"
        >
          <h3>
            The processors are unable to balance so many processes. Entering
            overload mode!
          </h3>
          <p v-if="program.processCounter > 0">
            Number of generated processes: {{ program.savedNumberOfProcesses }}
          </p>
          <p v-if="program.processCounter > 0">
            Processes left to balance: {{ program.processCounter }}
          </p>
          <p v-if="program.overloadCounter > 0">
            Number of rejected processes: {{ program.overloadCounter }}
          </p>
        </div>
      </div>
      <transition
        enter-active-class="enter-active"
        leave-active-class="leave-active"
        @before-enter="beforeEnter"
        @enter="enter"
        @after-enter="afterEnter"
        @before-leave="beforeLeave"
        @leave="leave"
        @after-leave="afterLeave"
      >
        <div
          class="spinner__container"
          v-show="
            Object.keys(this.program).length > 0 &&
              !program.displayResults &&
              !(program.processCounter > 0)
          "
        >
          <p>The processes have been distributed.</p>
          <p>Please wait while the tasks are still being processed.</p>
          <svg
            class="spinner"
            width="35px"
            height="35px"
            viewBox="0 0 66 66"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              class="path"
              fill="none"
              stroke-width="6"
              stroke-linecap="round"
              cx="33"
              cy="33"
              r="30"
            ></circle>
          </svg>
        </div>
      </transition>
    </div>
    <div
      class="charts__container"
      v-if="program.displayResults && compareSimulations"
    >
      <div class="chart__wrapper" v-for="(result, k) in chartResults" :key="k">
        <bar-chart
          :chart-data="result"
          :chart-title="chartTitles[k]"
        ></bar-chart>
      </div>
    </div>
    <div class="processors__container">
      <div
        class="processor"
        v-for="(processor, i) in program.processors"
        @click="showDetails(processor)"
        :key="i"
        :class="{
          idle: processor.getLoad < 5,
          light: processor.getLoad >= 5 && processor.getLoad < 15,
          moderate: processor.getLoad >= 15 && processor.getLoad < 50,
          high: processor.getLoad >= 50 && processor.getLoad < 80,
          critical: processor.getLoad >= 80
        }"
      >
        <div class="content">
          <p>Processor: {{ i + 1 }}</p>
          <p>Current load: {{ processor.getLoad }} %</p>
          <p>Processes: {{ processor.getProcesses.length }}</p>
          <p>Tasks left: {{ processor.getNumberOfTasks }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Vue, Watch } from "vue-property-decorator";
import { Program } from "./services/Program";
import { Processor } from "./services/Processor";
import BarChart from "./Chart.vue";

interface Option {
  value: string;
  name: string;
  maxValue?: number;
}
interface Collection {
  labels: string[];
  datasets: {
    label: string;
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    hoverBackgroundColor: string;
    hoverBorderColor: string;
    data: number[];
  }[];
}

@Component({
  filters: {
    fixedDecimal: (val: number) =>
      `${(Math.round(val * 100) / 100).toFixed(2)} %`
  },
  components: {
    BarChart
  }
})
export default class App extends Vue {
  chartTitles = ["Average Load", "Average Deviation", "Queries", "Migrations"];
  chartResults: Record<string, any>[] = [];

  @Watch("program.displayResults")
  fillChart(): void {
    const restructure = (input = []) =>
      Object.keys(input[0] || {}).map(k =>
        input.map(x => this.roundNumber(x[k]))
      );

    this.chartResults = restructure(this.program.savedResults);
  }

  options: any = {
    numberOfProcesses: {
      value: 75,
      name: "Number of processors"
    },
    minProcesses: {
      value: 50,
      name: "Min processes"
    },
    maxProcesses: {
      value: 100,
      name: "Max processes"
    },
    valueOfP: {
      value: 50,
      name: "Value of P"
    },
    valueOfR: {
      value: 40,
      name: "Value of R"
    },
    numberOfTries: {
      value: 5,
      name: "Number of tries for sim 1"
    },
    overloadCoefficient: {
      value: 0.95,
      name: "Overload coefficient",
      maxValue: 1
    }
  };

  chosenMode: Option = {
    value: "0",
    name: "Choice of simulation"
  };

  compareSimulations = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  program: any = {};

  runSimulation() {
    if (+this.chosenMode.value == 3) {
      this.compareSimulations = true;
    } else {
      this.compareSimulations = false;
    }
    console.log(this.options.overloadCoefficient.value);
    this.program = new Program(
      parseInt(this.options.numberOfProcesses.value),
      parseInt(this.options.minProcesses.value),
      parseInt(this.options.maxProcesses.value),
      this.compareSimulations,
      parseInt(this.options.valueOfP.value),
      parseInt(this.options.valueOfR.value),
      parseInt(this.options.numberOfTries.value),
      parseFloat(this.options.overloadCoefficient.value),
      parseInt(this.chosenMode.value)
    );
    this.program.runSimulation();
  }

  stopSimulation() {
    this.program.stop();
  }

  showDetails(processor: Processor) {
    console.log(processor);
  }

  beforeEnter(element: any) {
    requestAnimationFrame(() => {
      if (!element.style.height) {
        element.style.height = "0px";
      }

      element.style.display = null;
    });
  }

  enter(element: any) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        element.style.height = `${element.scrollHeight}px`;
      });
    });
  }

  afterEnter(element: any) {
    element.style.height = null;
  }

  beforeLeave(element: any) {
    requestAnimationFrame(() => {
      if (!element.style.height) {
        element.style.height = `${element.offsetHeight}px`;
      }
    });
  }

  leave(element: any) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        element.style.height = "0px";
      });
    });
  }

  afterLeave(element: any) {
    element.style.height = null;
  }

  roundNumber(number: number) {
    return (Math.round(number * 100) / 100).toFixed(2);
  }
}
</script>
<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400&display=swap");
body {
  font-family: "Montserrat", sans-serif;
  padding: 4vh;
  margin: 0;
  p {
    margin: 0;
  }
  h3 {
    text-align: center;
  }
}
.enter-active,
.leave-active {
  overflow: hidden;
  transition: height 1s linear;
}
.controls__container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .inputs__container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    @media (min-width: 1000px) {
      grid-template-columns: repeat(4, 1fr);
    }
    column-gap: 4vh;
    .input__wrapper {
      display: flex;
      flex-direction: column;
      padding: 10px;
      label {
        font-size: 14px;
        padding: 5px 0;
      }

      input,
      select,
      option {
        padding: 4px;
        outline: none;
      }
    }
  }
  .buttons__container {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 20px 0;
    button {
      padding: 12px;
      min-width: 10vw;
      margin: 0 4px;
      background-color: black;
      color: white;
      transition: all 0.5s ease-in-out;
      outline: none;
      &:hover {
        background-color: #26c281;
        cursor: pointer;
      }
    }
  }
  .results__container {
    padding: 2vh 0;
    display: grid;
    justify-content: center;
    align-items: center;
    grid-template-columns: 1fr;
    text-align: center;
    p {
      margin: 5px;
    }
    @media (min-width: 1000px) {
      display: flex;
      align-items: center;
      justify-content: center;
      .detailedResults {
        margin: 2vh;
      }
    }
  }
  .spinner__container {
    margin: 2vh 0;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    $offset: 187;
    $duration: 1.4s;
    p {
      margin: 0.5vh 0;
    }
    .spinner {
      margin: 4vh 0 1vh 0;
      animation: rotator $duration linear infinite;
    }

    @keyframes rotator {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(270deg);
      }
    }

    .path {
      stroke-dasharray: $offset;
      stroke-dashoffset: 0;
      transform-origin: center;
      animation: dash $duration ease-in-out infinite,
        colors ($duration * 4) ease-in-out infinite;
    }

    @keyframes colors {
      from {
        stroke: black;
      }

      to {
        stroke: black;
      }
      // 0% {
      //   stroke: #4285f4;
      // }
      // 25% {
      //   stroke: #de3e35;
      // }
      // 50% {
      //   stroke: #f7c223;
      // }
      // 75% {
      //   stroke: #1b9a59;
      // }
      // 100% {
      //   stroke: #4285f4;
      // }
    }

    @keyframes dash {
      0% {
        stroke-dashoffset: $offset;
      }
      50% {
        stroke-dashoffset: $offset/4;
        transform: rotate(135deg);
      }
      100% {
        stroke-dashoffset: $offset;
        transform: rotate(450deg);
      }
    }
  }
}
.charts__container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2vh;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  max-width: 60vw;
  padding: 0 4vh;
  margin: 0 auto;
  @media (min-width: 1400px) {
    grid-template-columns: repeat(2, 1fr);
    max-width: 50vw;
    .chart__wrapper {
      margin: 0 4vw;
    }
  }
}
.processors__container {
  padding: 4vh 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  grid-auto-rows: 1fr;
  grid-gap: 10px;
  > *:first-child {
    grid-row: 1 / 1;
    grid-column: 1 / 1;
  }
  .processor {
    background: cadetblue;
    box-sizing: border-box;
    padding: 2vw;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    font-size: 14px;
    transition: all 0.2s ease-in-out;
    p {
      margin: 0;
      white-space: nowrap;
    }
    &.idle {
      background-color: #2fe197;
    }
    &.light {
      background-color: #26c281;
    }
    &.moderate {
      background-color: #f7ca18;
    }
    &.high {
      background-color: #e74c3c;
    }
    &.critical {
      background-color: #d91e18;
    }
  }
  &::before {
    content: "";
    width: 0;
    padding-bottom: 100%;
    grid-row: 1 / 1;
    grid-column: 1 / 1;
  }
}
</style>
