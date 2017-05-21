import * as React from 'react';
import * as SocketIo from 'socket.io-client';

import { AppState } from '../model/AppState';
import { MonitorMetadata } from '../../model/MonitorMetadata';
import { MonitoredLocationInformation } from '../model/MonitoredLocationInformation';
import { OnLocationItemClickedObserver } from '../observers/OnLocationItemClickedObserver';
import { OnMonitoringItemClickedObserver } from '../observers/OnMonitoringItemClickedObserver';
import { RequestResponse } from '../../model/RequestResponse';
import SocketKeys from '../../socket.io/socket-keys';
import { WeatherLocationData } from '../../model/WeatherLocationData';
import { WeatherPage } from '../view/WeatherPage';

/**
 * Decides how the current state of the frontend application is manipulated, which, in turn, causes a 
 * re-render of certain components in the DOM.
 * This is a recommended design pattern provided by Redux (as an example for when you don't use the Redux library) 
 * and React.
 * The class acts as a controller in that it coordinates the events of view objects and the interaction to the 
 * backend API.
 * 
 * TODO: this.state points to an AppState object and is no the same as the react state.
 */
class WeatherPageContainer extends React.Component<{}, AppState> {
  private onLocationsListRainfallItemClicked: OnLocationItemClickedObserver;
  private onLocationsListTemperatureItemClicked: OnLocationItemClickedObserver;
  private onMonitoringListGraphItemClicked: OnMonitoringItemClickedObserver;

  constructor(props: {}) {
    super(props);
    // Start the state off with a bunch of empty lists.
    this.state = new AppState([], new Map<string, MonitoredLocationInformation>(), false);
  }

  public componentDidMount(): void {
    const that: WeatherPageContainer = this;
    // Connects to the port that the backend is listening on.
    // Triggers io.on('connection')'s callback
    const socket: SocketIOClient.Socket = SocketIo.connect('http://127.0.0.1:8080');

    // Create on click monitor listeners
    // TODO: Rename it?
    this.onMonitoringListGraphItemClicked = new class implements OnMonitoringItemClickedObserver {
      public onItemClicked(location: string) {
        const monitoredLocationInformation: MonitoredLocationInformation | undefined = 
          that.state.weatherDataMap.get(location);
        if (monitoredLocationInformation != null) { 
          const newMonitoredLocationInformation: MonitoredLocationInformation = new MonitoredLocationInformation(
            monitoredLocationInformation.weatherDataList, 
            monitoredLocationInformation.monitorRainfall,
            monitoredLocationInformation.monitorTemperature,
            !monitoredLocationInformation.monitorGraph
          );
          // Update WeatherDataMap.
          that.state.weatherDataMap.set(location, newMonitoredLocationInformation);
          that.setState({ weatherDataMap: that.state.weatherDataMap });  // Make react re-render.
          
        } else {
          console.error(`Error: monitoredLocationInformation could not be found for ${location}`);
        }
      }

    }();
    
    // Observer that is triggered when rainfall button is clicked for a location.
    // Either toggles it on or off.
    this.onLocationsListRainfallItemClicked = new class implements OnLocationItemClickedObserver {
      public onItemClicked(location: string, selected: boolean): void {
        // selected is the previous state, weather the button was previously selected or not.
        // If not selected before then selected will be false, we pass in !selected to make it true
        // so we render that component.
        const originalData: MonitoredLocationInformation | undefined = that.state.weatherDataMap.get(location);
        let newData: MonitoredLocationInformation;
        if (originalData == null) {
          // First time it is selected.
          newData = new MonitoredLocationInformation([], !selected, false);
        } else {
          newData = new MonitoredLocationInformation(
            originalData.weatherDataList, 
            !selected,
            originalData.monitorTemperature,
            originalData.monitorGraph
          );
        }

        // Add new data to the state in AppState weatherMap in memory.
        that.state.weatherDataMap.set(location, newData);
        // Makes react render the new state.
        that.setState({
          weatherDataMap: that.state.weatherDataMap
        });

        that.onMonitorSelected(
          socket, 
          location,
          SocketKeys.addRainfallMonitor, 
          SocketKeys.removeRainfallMonitor,
          selected
        );
      }
    }();

    this.onLocationsListTemperatureItemClicked = new class implements OnLocationItemClickedObserver {
      public onItemClicked(location: string, selected: boolean): void {
        const originalData: MonitoredLocationInformation | undefined = that.state.weatherDataMap.get(location);
        let newData: MonitoredLocationInformation;
        if (originalData == null) {
          newData = new MonitoredLocationInformation([], false, !selected);
        } else {
          newData = new MonitoredLocationInformation(
            originalData.weatherDataList, 
            originalData.monitorRainfall,
            !selected,
            originalData.monitorGraph
          );
        }
        that.state.weatherDataMap.set(location, newData);
        that.setState({
          weatherDataMap: that.state.weatherDataMap
        });
        that.onMonitorSelected(
          socket,
          location,
          SocketKeys.addTemperatureMonitor,
          SocketKeys.removeTemperatureMonitor,
          selected
        );
      }
    }();

    // Initialize the socket end points for rainfall monitor.
    this.initializeMonitoringSocketEndPoint(
      socket, 
      SocketKeys.addRainfallMonitor, 
      SocketKeys.removeRainfallMonitor,
      // (removedLocation: string, weatherData: WeatherLocationData) => {
      //   return new WeatherLocationData(removedLocation, undefined, weatherData.temperatureData);
      // }
    );
    
    // Initialize the socket end points for temperature monitor.
    this.initializeMonitoringSocketEndPoint(
      socket, 
      SocketKeys.addTemperatureMonitor, 
      SocketKeys.removeTemperatureMonitor,
      // (removedLocation: string, weatherData: WeatherLocationData) => {
      //   return new WeatherLocationData(removedLocation, weatherData.rainfallData, undefined);
      // }
    );

    socket.on(SocketKeys.successfulServerSetup, (connectedToServer: boolean) => {
      // Remove the 'waiting for client connection' view once the server has set itself up.
      // Assign MelbourneWeather2 successful connection status.
      console.log(`Successful connection to server: ${connectedToServer}`);
      this.setState({ connectedToServer });
    });

    socket.on(SocketKeys.retrievedLocations, (locations: string[]) => {
      // We were given a list of locations. Let React know that we may need to re-render.
      // Used to determine what gets rendered on the sidebar.
      this.setState({ locations });
    });

    socket.on(SocketKeys.replaceWeatherData, (weatherLocationDataList: WeatherLocationData[]) => {
      // We received some fresh weather data.
      // Tell React that we may need to re-render
      // Handle updates for cards and adding a new data point to graphs.
      // Use to determine what cards are rendered and what information is in them (textual, graphical)
      // and for rainfall and/or temperature.
      const timeStamp: string = new Date().toString();
      console.log('Received weather location data at time: ' + timeStamp);
      console.log(weatherLocationDataList);
        
      const newWeatherDataMap: Map<string, MonitoredLocationInformation> = that.state.weatherDataMap;
      
      // Loop for each WeatherLocationData object sent by backend.
      for (const weatherLocationData of weatherLocationDataList) {
        let monitoredLocationInformation: MonitoredLocationInformation | undefined = newWeatherDataMap
          .get(weatherLocationData.location);
        if (monitoredLocationInformation == null) {
          monitoredLocationInformation = new MonitoredLocationInformation(
            [], 
            weatherLocationData.rainfallData != null, 
            weatherLocationData.temperatureData != null
          );
          newWeatherDataMap.set(weatherLocationData.location, monitoredLocationInformation);
        }
        // Add this weatherLocationData received to array of weatherLocationData.
        monitoredLocationInformation.weatherDataList.push(weatherLocationData);
      }
      // Tell react to re-render.
      this.setState({ weatherDataMap: newWeatherDataMap });
    });
  }

  public onMonitorSelected(
    socket: SocketIOClient.Socket,
    location: string,
    addMonitorEvent: string, 
    removeMonitorEvent: string,
    selected: boolean
  ): void {
    // The backend speaks in MonitorMetadata objects, so create one.
    const monitor: MonitorMetadata = new MonitorMetadata(location);
    if (selected) {
      // We're unselecting a location so emit to remove the monitor
      socket.emit(removeMonitorEvent, monitor);
    } else {
      // We're selecting a location so emit to add the monitor
      socket.emit(addMonitorEvent, monitor);
    }
}

  private initializeMonitoringSocketEndPoint(
    socket: SocketIOClient.Socket,
    addMonitorEvent: string,
    removeMonitorEvent: string,
    // filterWeatherLocationData: (location: string, weatherData: WeatherLocationData) => WeatherLocationData
  ): void {
    socket.on(addMonitorEvent, (addMonitorResponse: RequestResponse<WeatherLocationData>) => {
      // First, make sure we didn't receive an error
      if (addMonitorResponse.error == null) {
        // Good, we didn't receive an error, add the new weather data into our state's weather hash map.
        const newWeatherData: WeatherLocationData = addMonitorResponse.data;
        const weatherDataMap: Map<string, MonitoredLocationInformation> = this.state.weatherDataMap;
        // newWeatherData.location should exist.

        const monitoringData: MonitoredLocationInformation | undefined = weatherDataMap.get(newWeatherData.location);
        if (monitoringData != null) {
          weatherDataMap.set(newWeatherData.location, monitoringData);
          monitoringData.weatherDataList.push(newWeatherData);
        } else {
          console.error('Could not find monitoring data');
        }
        this.setState({ weatherDataMap });
      } else {
        console.error(addMonitorResponse.error);
      }
    });
    
    socket.on(removeMonitorEvent, (removeMonitorResponse: RequestResponse<WeatherLocationData>) => {
      // Make sure we didn't receive an error when we tried to remove the monitor
      if (removeMonitorResponse.error == null) {
        // Delete monitoring card here, make sure to do so in render part as well.
        const removedMonitor = removeMonitorResponse.data;
        const weatherDataMap: Map<string, MonitoredLocationInformation> = this.state.weatherDataMap;
        const monitoredLocationInformation: MonitoredLocationInformation | undefined = 
          weatherDataMap.get(removedMonitor.location);
        if (monitoredLocationInformation != null) {
          if (!monitoredLocationInformation.monitorRainfall && !monitoredLocationInformation.monitorTemperature) {
            // Nothing to monitor, data for this isn't getting fetched from backend.
            // Delete card by deleting info form weatherDataMap.
            weatherDataMap.delete(removedMonitor.location);
            // Re-render.
            this.setState({ weatherDataMap });
          } // Implicit else: Has meaningful data in card, don't remove.
        } else {
          console.error(`Error: monitoredLocationInformation could not be found for ${removedMonitor}`);
        }
      } else {
        // Log error.
        console.error(removeMonitorResponse.error);
      }
  
      // TODO: This? Why don't we remove the monitor part here.
      // Remove on backend, just re-render?
    });
  }
  
  public render(): JSX.Element {
    // console.log(this.state.weatherDataMap);
    return (
      this.state.connectedToServer ?
      (
        <WeatherPage 
          appCurrentState={this.state}
          onLocationRainfallItemClickedObserver={this.onLocationsListRainfallItemClicked}
          onLocationTemperatureItemClickedObserver={this.onLocationsListTemperatureItemClicked}
          onMonitoringListGraphItemClicked={this.onMonitoringListGraphItemClicked}
        />
      ) : 
      (
        <h1 className='error'>
            WeatherMelbourne2 WSDL connection unsuccessful. 
            Make sure your device is connected to the internet and 
            http://viper.infotech.monash.edu.au:8180/axis2/services/MelbourneWeather2?wsdl is available.
        </h1>
      )
    );
  }
}

export {WeatherPageContainer};
export default WeatherPageContainer;
