<script>
import { Bar, mixins } from "vue-chartjs";

export default {
  extends: Bar,
  mixins: [mixins.reactiveProp],
  props: {
    chartData: {
      // eslint-disable-next-line vue/require-prop-type-constructor
      type: Array | Object,
      required: false
    },
    chartTitle: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      chartDetails: {
        labels: ["Simulation 1", "Simulation 2", "Simulation 3"],
        datasets: [
          {
            label: this.chartTitle,
            backgroundColor: "rgba(35, 203, 167, 1)",
            borderColor: "rgba(1, 152, 117, 1)",
            borderWidth: 2,
            hoverBackgroundColor: "rgba(35, 203, 167, 1)",
            hoverBorderColor: "rgba(4, 147, 114, 1)",
            data: this.chartData
          }
        ]
      },
      options: {
        title: {
          display: true,
          text: this.chartTitle,
          lineHeight: 1.4,
          fontStyle: "normal",
          fontSize: 16,
          padding: 20
        },
        maintainAspectRatio: false,
        scales: {
          yAxes: [
            {
              stacked: true,
              gridLines: {
                display: true,
                color: "rgba(255,99,132,0.2)"
              }
            }
          ],
          xAxes: [
            {
              gridLines: {
                display: false
              }
            }
          ]
        },
        legend: {
          display: false
        },
        responsive: true
      }
    };
  },
  mounted() {
    this.renderChart(this.chartDetails, this.options);
  }
};
</script>
