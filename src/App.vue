<template>
  <div id="app">
    <h3>Symulacja rozproszonego alg. równoważącego obciążenie procesorów</h3>
    <div class="controls__container">
      <div class="inputs__container">
        <div
          class="input__wrapper"
          v-for="(option, index) in Object.values(this.options)"
          :key="index"
        >
          <label for="numberOfProcesses">{{ option.name }}</label>
          <input
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
            <option value="3">Porównaj wszystkie</option>
          </select>
        </div>
      </div>
      <div class="buttons__container">
        <button @click="runSimulation">Start</button>
        <button @click="stopSimulation">Stop</button>
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
              program.displayResults &&
                program.savedResults[j].getMigrations > 0
            "
          >
            <h3>Rezultaty dla strategii {{ j + 1 }}</h3>
            <p>
              Średnie obciążenie:
              {{ program.savedResults[j].getAverageLoad | fixedDecimal }}
            </p>
            <p>
              Średnie odchylenie:
              {{ program.savedResults[j].getAverageBias | fixedDecimal }}
            </p>
            <p>
              Ilość zapytań o obciążenie:
              {{ program.savedResults[j].getQueries }}
            </p>
            <p>
              Ilość migracji:
              {{ program.savedResults[j].getMigrations }}
            </p>
          </div>
        </div>
        <div class="currentDetails" v-if="!program.displayResults">
          <h3 v-if="program.queries > 0 || program.processCounter > 0">
            Symulacja {{ program.chosenMode + 1 }}
          </h3>
          <p v-if="program.queries > 0">
            Ilość zapytań o obciążenie: {{ program.queries }}
          </p>
          <p v-if="program.migrations > 0">
            Ilość migracji: {{ program.migrations }}
          </p>
          <p v-if="program.processCounter > 0">
            Ilość wygenerowanych procesów: {{ this.numberOfProcesses }}
          </p>
          <p v-if="program.processCounter > 0">
            Pozostało procesów: {{ program.processCounter }}
          </p>
        </div>
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
          <p>Procesor: {{ i + 1 }}</p>
          <p>Obciążenie: {{ processor.getLoad }} %</p>
          <p>Procesy: {{ processor.getProcesses.length }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Program } from "./services/Program";
import { Processor } from "./services/Processor";

interface Option {
  value: string;
  name: string;
}
@Component({
  filters: {
    fixedDecimal: (val: number) =>
      `${(Math.round(val * 100) / 100).toFixed(2)} %`
  }
})
export default class App extends Vue {
  options: any = {
    numberOfProcesses: {
      value: 75,
      name: "Ilość procesów"
    },
    minProcesses: {
      value: 50,
      name: "Min procesów"
    },
    maxProcesses: {
      value: 100,
      name: "Max procesów"
    },
    valueOfP: {
      value: 50,
      name: "Wartość P"
    },
    valueOfR: {
      value: 40,
      name: "Wartość R"
    },
    numberOfTries: {
      value: 5,
      name: "Ilość prób dla symulacji 1"
    },
    valueOfZ: {
      value: 0,
      name: "Wartość Z"
    }
  };

  chosenMode: Option = {
    value: "0",
    name: "Wybór symulacji"
  };

  numberOfProcesses = 0;
  compareSimulations = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  program: any = {};

  runSimulation() {
    if (+this.chosenMode.value == 3) {
      this.compareSimulations = true;
    } else {
      this.compareSimulations = false;
    }
    this.program = new Program(
      parseInt(this.options.numberOfProcesses.value),
      parseInt(this.options.minProcesses.value),
      parseInt(this.options.maxProcesses.value),
      this.compareSimulations,
      parseInt(this.options.valueOfP.value),
      parseInt(this.options.valueOfR.value),
      parseInt(this.options.numberOfTries.value),
      parseInt(this.options.valueOfZ.value),
      parseInt(this.chosenMode.value)
    );
    this.numberOfProcesses = this.program.processCounter;
    this.program.runSimulation();
  }

  stopSimulation() {
    this.program.stop();
  }

  showDetails(processor: Processor) {
    console.log(processor);
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
    display: grid;
    grid-template-columns: repeat(2, minmax(10vw, 20vw));
    column-gap: 20px;
    margin: 20px 0;
    button {
      padding: 8px;
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
    .finished {
      @media (min-width: 1000px) {
        column-gap: 4vw;
        grid-template-columns: repeat(3, 1fr);
      }
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
