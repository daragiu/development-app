import * as React from 'react';

import { WeatherLocationData } from '../../model/WeatherLocationData';

interface MonitoringItemProps {
  weatherData: WeatherLocationData;
}
class MonitoringItem extends React.Component<MonitoringItemProps, void> {
  public render(): JSX.Element {
    const dataMissingMessage = 'N/A';
    let temperatureDataToRender: string;
    if (
      this.props.weatherData.temperatureData != null && 
      this.props.weatherData.temperatureData.temperature != null &&
      this.props.weatherData.temperatureData.temperature !== ''
    ) {
      const isFloatingPoint: boolean = !isNaN(parseFloat(this.props.weatherData.temperatureData.temperature));
      temperatureDataToRender = 
        `${this.props.weatherData.temperatureData.temperature}${isFloatingPoint ? ' ℃' : ''}`;
    } else {
      temperatureDataToRender = dataMissingMessage;
    }
    let rainfallDataToRender: string;
    if (
      this.props.weatherData.rainfallData != null && 
      this.props.weatherData.rainfallData.rainfall != null && 
      this.props.weatherData.rainfallData.rainfall !== ''
    ) {
      const isFloatingPoint: boolean = !isNaN(parseFloat(this.props.weatherData.rainfallData.rainfall));
      rainfallDataToRender = 
        `${this.props.weatherData.rainfallData.rainfall}${isFloatingPoint ? ' mm' : ''}`;
    } else {
      rainfallDataToRender = dataMissingMessage;  
    }
    return (
      <section className="pad-item-list">
        <h1 className="txt-body-2">{this.props.weatherData.location}</h1>
        {
          this.props.weatherData.rainfallData ? 
          <h2 className="txt-body-1">
            Rainfall: {rainfallDataToRender}
          </h2> : null
        }
        {
          this.props.weatherData.temperatureData ? 
          <h2 className="txt-body-1">
            Temperature: {temperatureDataToRender}
          </h2> : null
        }
      </section>
    );
  }
}
export {MonitoringItem};
export default MonitoringItem;
