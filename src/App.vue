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
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
        </div>
      </div>
      <div class="buttons__container">
        <button @click="runSimulation">Start</button>
        <button @click="stopSimulation">Stop</button>
      </div>
      <div class="results__container">
        <p v-if="program.displayResults && program.results[0]">
          Średnie obciążenie: {{ program.results[0] | percentage }}
        </p>
        <p v-if="program.displayResults && program.results[1]">
          Średnie odchylenie: {{ program.results[1] | percentage }}
        </p>
        <p v-if="program.queries > 0">
          Ilość zapytań o obciążenie: {{ program.queries }}
        </p>
        <p v-if="program.migrations > 0">
          Ilość migracji: {{ program.migrations }}
        </p>
      </div>
    </div>

    <div class="processors__container">
      <div
        class="processor"
        v-for="(processor, i) in program.processors"
        :key="i"
        :class="{
          light: processor.load < 15,
          moderate: processor.load >= 15 && processor.load < 50,
          high: processor.load >= 50 && processor.load < 80,
          critical: processor.load >= 80
        }"
      >
        <div class="content">
          <p>Procesor: {{ i + 1 }}</p>
          <p>Obciążenie: {{ processor.load }} %</p>
          <p>Procesy: {{ processor.getProcesses.length }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Program } from "./services/Program";

interface Option {
  value: string;
  name: string;
}
@Component({
  filters: {
    percentage: (val: number): string =>
      `${Math.round((val / 100) * 100) / 100} %`
  }
})
export default class App extends Vue {
  options = {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  program: any = {};

  runSimulation() {
    this.program = new Program(
      this.options.numberOfProcesses.value,
      this.options.minProcesses.value,
      this.options.maxProcesses.value,
      false,
      this.options.valueOfP.value,
      this.options.valueOfR.value,
      this.options.numberOfTries.value,
      this.options.valueOfZ.value,
      parseInt(this.chosenMode.value)
    );
    this.program.runSimulation();
  }

  stopSimulation() {
    this.program.stop();
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
