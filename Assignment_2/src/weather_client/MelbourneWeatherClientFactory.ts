import * as Soap from 'soap-as-promised';
import * as chalk from 'chalk';

import { MelbourneWeatherClient } from './SoapMelbourneWeatherClient';
import { WeatherClientFactory } from './WeatherClientFactory';
import { MelbourneWeatherServiceStub } from '../interface/MelbourneWeatherServiceStub';

// TODO: There are a lot of optional settings we can set in this Factory.

/**
 * Builds an async SOAP Client from the provided wsdl file.
 */
class MelbourneWeatherClientFactory implements WeatherClientFactory<MelbourneWeatherClient> {
  public createWeatherClient(): Promise<MelbourneWeatherClient> {
    return new Promise<MelbourneWeatherClient>((resolve, reject) => {
      Soap.createClient('http://viper.infotech.monash.edu.au:8180/axis2/services/MelbourneWeather2?wsdl')
      .then((weatherService: MelbourneWeatherServiceStub) => {
        // weatherService has methods defined in MelbourneWeatherServiceStub.
        const melbourneWeatherClient: MelbourneWeatherClient = new MelbourneWeatherClient(weatherService);
        // TODO: emit good.
        console.log(chalk.cyan('SOAP Client created'));
        resolve(melbourneWeatherClient);
      })
      .catch((error) => {
        // TODO: emit bad.
        console.log(chalk.bgRed('Could not make SOAP Client'));
        reject(error);
      });
    });
  }
}

export {MelbourneWeatherClientFactory};
export default MelbourneWeatherClientFactory;
