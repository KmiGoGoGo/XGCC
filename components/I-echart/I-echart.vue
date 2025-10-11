<template>
  <div ref="chartContainer" class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';

const chartContainer = ref(null);
const chartCanvas = ref(null);


const initChart = () => {
  // 确保 DOM 更新完成后初始化图表
  nextTick(() => {
    if (chartCanvas.value) {
      const chart = echarts.init(chartCanvas.value);

      const option = {
        tooltip: {
          trigger: 'axis',
          valueFormatter: (value) => Number(value).toFixed(3) + '元',
        },
        xAxis: {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: 'Sales',
            type: 'line',
            data: [820, 932, 901, 934, 1290, 1330, 1320],
            markLine: {
              data: [
                { type: 'average', name: 'Average' },
              ],
            },
          },
        ],
      };

      chart.setOption(option);
    }
  });
};

onMounted(initChart);
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px;
}
</style>