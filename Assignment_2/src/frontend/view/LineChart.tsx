import * as Chart from 'chart.js';
import * as React from 'react';

import { Line } from 'react-chartjs-2';
import { MonitoredLocationInformation } from '../model/MonitoredLocationInformation';

interface LineChartProps {
  monitoredLocationInformation: MonitoredLocationInformation;
}

class LineChart extends React.Component<LineChartProps, void> {
  public render(): JSX.Element {
    const rainfallDataPoints: Array<number | null> = [];
    const temperatureDataPoints: Array<number | null> = []; 
    const timestampDataPoints: string[] = [];
    // Loop for all pieces of weatherData (makes up graph data points).
    for (const weatherData of this.props.monitoredLocationInformation.weatherDataList) {
      let timeStamp: string | undefined;

      let rainfallPoint: number | null = null;
      if (this.props.monitoredLocationInformation.monitorRainfall) {        
        // Show rainfall on graph.
        if (weatherData.rainfallData != null && weatherData.rainfallData.rainfall != null) {
          rainfallPoint = parseFloat(weatherData.rainfallData.rainfall);
          if (isNaN(rainfallPoint)) {
            rainfallPoint = null;
          }
          timeStamp = weatherData.rainfallData.timestamp;
        }
      }
      rainfallDataPoints.push(rainfallPoint);  // Can be null, if null breaks graph being joint.

      let temperaturePoint: number | null = null;
      if (this.props.monitoredLocationInformation.monitorTemperature) {
        // Show temperature on graph.
        if (weatherData.temperatureData != null && weatherData.temperatureData.temperature != null) {
          temperaturePoint = parseFloat(weatherData.temperatureData.temperature);
          if (isNaN(temperaturePoint)) {
            temperaturePoint = null;
          }
          timeStamp = weatherData.temperatureData.timestamp;  
        }
      }
      temperatureDataPoints.push(temperaturePoint);  // Can be null, if null breaks graph being joint.
      
      // Note: Assumed for a single weather data location, if a rainfall or temp is provided then 
      // the timestamp must not be null.
      // Additionally at least one of temp or rainfall data must be provided so getting to here
      // means that timeStamp should not be null.
      if (timeStamp == null) {
        console.log('Timestamp is null');
        timeStamp = 'N/A';
      }
      timestampDataPoints.push(timeStamp);
    }
    
    // Note: RGBA is reg green blue alpha, alpha is opacity between 0.0 and 1.0, the higher is more solid.
    // 
    const data: Chart.LinearChartData = {
      labels: timestampDataPoints,
      datasets: [
        {
          label: 'Rainfall',
          fill: false,          
          backgroundColor: 'rgba(0, 0, 240, 0.75)',
          borderColor: 'rgb(0, 0, 240)',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'rgb(0, 0, 240)',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 0,
          pointHoverRadius: 3,
          pointHoverBackgroundColor: 'rgb(0, 0, 240)',
          pointHoverBorderColor: 'rgb(0, 0, 240)',
          pointHoverBorderWidth: 1,
          pointRadius: 1,
          pointHitRadius: 5,
          data: rainfallDataPoints
        },
        {
          label: 'Temperature',
          fill: false,
          lineTension: 0.1,
          backgroundColor: 'rgba(240, 0, 0, 0.75)',
          borderColor: 'rgb(240, 0, 0)',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'rgb(240, 0, 0)',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 0,
          pointHoverRadius: 3,
          pointHoverBackgroundColor: 'rgb(240, 0, 0)',
          pointHoverBorderColor: 'rgb(240, 0, 0)',
          pointHoverBorderWidth: 1,
          pointRadius: 1,
          pointHitRadius: 5,
          data: temperatureDataPoints
        }
      ]
    };
    // TODO: Set axis labels, configure graph so looks nicer.
    const options: Chart.options = {
      responsive: true,
      maintainAspectRatio: true,
      animation : false,
      scales: {
        xAxes: [{
            ticks: {
                autoSkip: true,
                maxRotation: 0,
                minRotation: 0,
                autoSkipPadding: 10
            }
          }]
        }
    };
    
    return <Line 
            data={data}
            options={options}
    />;
  }
}

export default LineChart;
export {LineChart};
