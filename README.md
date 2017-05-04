# FIT3077 Full Lambda Assignment 2
## Student details
### Patrick Shaw
- **Student email:** psha67@student.monash.edu
- **Student ID:** 26898187
### David Lei
- **Student email:** dlei7@student.monash.edu
- **Student ID:** 26029391

## Prerequisites
 - [Node.js ~v6.9.1](https://nodejs.org/en/): A JavaScript runtime. The code base should be relatively independant of the Node.js version being run.
 - [Yarn](https://yarnpkg.com/lang/en/) (Optional but highly recommended): Depedency management software that typically outperforms npm at installation speed.

## Tested envionments
 - Windows 10 Home (OS Build 14393.1066)
 - OS X El Captain 10.11.6

## Installation instructions
1. Open up a terminal.
2. Navigation to the *Assignment_2* directory.
2. Run `npm install`. If you have yarn installed you can use `yarn install`. Wait for all the node packages to finish downloading.
3. Run `npm run backend-start`. Wait for the the *'Webpack configuration complete'* message to be printed to the console.
4. Open up another terminal.
5. Run `npm run frontend-start`. Wait for Webpack to finish again.
6. Open a browser.
7. Type into the URL bar: *'localhost:3000'*.

**Note:** You MUST wait for the backend's compilation to finish before running `npm run frontend-start`. This is an issue with having two Webpack builds running at the same time in the same folder with similar configurations. It is assumed that a solution to this problem is out of scope for this assignment.

## Why do we have a backend server
We use [Node.js](https://nodejs.org/en/) to provide our own API to frontend applications, as opposed to the frontend application communicating with the SOAP client directly. Despite the added latency, there are a plethora of reasons for doing this:
 - **Removes frontend polling all-together:** Polling is inefficient and poorly scales with high frequency polling (a potential change to the requirements in stage 2). By adding rolling our own API, we are able to leverage [WebSocket](https://en.wikipedia.org/wiki/WebSocket) which removes the need for frontend clients to poll all together. This is far more efficient when compared to high frequency polling.
 - **Minimizes traffic directed at the SOAP service:** One of the objectives of assignment was to *"minimize the network traffic generated by your system: don�t access the web service more
than is absolutely necessary"*. Our server acts as a cache for the SOAP service's data, allowing users to frontend clients to retrieve data witout the need to retrieve data from the SOAP service at all. **This means that the amount of traffic directed at the SOAP service is independent of the number of frontend cleints**. Real world APIs also often have a limit on the number of requests that can be made to their service per hour. Our implementation circumnavigates this issue.
 - **Changes are invisible to the client:** Changes in the `WeatherClient` are transparent to frontend clients. This is particularly useful when constantly switching between `MelbourneWeatherClient` and `TestWeatherClient`.
 - **Potentially less computationally intensive for poor-performing devices:** Less logic on the frontend means that simpler devices can use the application without lag.

## Engineering philosophies and patterns used
 - **[The observer pattern](https://en.wikipedia.org/wiki/Observer_pattern):** The observer pattern was used for on click events and in the `LocationMonitoringManager` & `SessionMonitoringManager`. Our observer pattern mimics the [Android SDK's implementation of the observer pattern](https://developer.android.com/guide/topics/ui/ui-events.html#EventListeners).
 - **[Factory pattern](https://en.wikipedia.org/wiki/Factory_method_pattern):** We use the factory pattern to allow the `FullLambdaWeatherService` to create a `WeatherClient` from a `WeatherClientFactory` so that the service does not need to know underlying steps to create the client. Retry-client-creation functionality will be written into the `FullLambdaWeatherService` as an example of using the pre-existing factory code to potentially build multiple `Promise<WeatherClient>`s.
 - **Seperate GUI and logic**: We almost totally avoid any logic on the frontend of our code project. This allows us to provide functionality that is independant of the user's interface. In fact, the only frontend class that performs limited controller functionality is the `WeatherPageContainer` which links the view to the [socket.io](https://socket.io) API. All other frontend classes concern themselves with rendering the DOM in a particular way.
 - **[MVC (Model, view, controller)](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller):** The model, view and controller (as previously discussed) are seperated. The `WeatherPageContainer` determines how inputs are interpreted, all other `React.Component`s serve as view type classes. All business type logic is handled by the backend server.
 - **Use [dependency injection](https://en.wikipedia.org/wiki/Dependency_injection):** [Gregory Kick's Java Dagger 2 video](https://www.youtube.com/watch?v=oK_XtfXPkqw) explains dependency injection quite well. As a an example of the benefits of dependency injection in our own code; `WeatherClient` is passed into the `FullLambdaWeatherService`'s constructor. This allows us to swap out the `MelbourneWeatherClient` with a `TestWeatherClient` which allows for easier debugging.
 - **[Composition over inheritance](https://en.wikipedia.org/wiki/Composition_over_inheritance):** Self explanatory. This mentality is typically considered to enable more flexibility in code. An example of this was our choice to compose the `LocationItem` of a `GenericListItem` rather than inheriting from it.

## Guidelines
 - **JavaScript guidelines:** [Air BnB's JavaScript Style guide](https://github.com/airbnb/javascript#strings).
 - **Design guidelines:** [Material Design](https://material.io/guidelines/material-design/introduction.html)
 - **Linters:** [TSLint](https://palantir.github.io/tslint/)
 - **Git patterns:** See *Git guidelines*
 - **Language:** American English
### Current loggin guidelines
- **Green text:** successful
- **Red text:** error information
- **Cyan text:** important information
- **Purple text:** parameterized information
- **White text:** General/other

### Git patterns
The development-master pattern is used in conjuction with feature branches. Code is merged (usually) via pull requests.

**master:** The development branch should be merged into this branch whenever a new version/set of features, ideally bug free, have been completed.

**development:** Features should be merged into this branch once implemented. This branch should maintain transpilability and compilability. Known bugs are allowed to be merged into this branch. Developers can work on the development branch for minor changes to the codebase.

**Feature branches**: Feature branches contain major refactored code or implementations of new functionality. Code from feature branches should be merged into the development via pull requests.

## Technology stack
### Languages & syntax choices
#### TypeScript
<img src="https://d1xwtr0qwr70yv.cloudfront.net/assets/tech/typescript-475eac4492db9bf211eed586f3d76c2d.svg" width ="200" />
A superset of JavaScript that allows the use of static typing, interfaces and classes. Developed by Microsoft. 

##### Differences to Java
 - Interfaces can have variables. These variables are passed onto the implementer of the interface.
 - Variables do not necessarily have to be typed. This allows compatibility with JavaScript packages that do not provide types.
 - Optional parameters are supported in TypeScript. This renders the [Builder](https://en.wikipedia.org/wiki/Builder_pattern) pattern somewhat redundent and is thus not used in our code base.
 - `readonly` is supported in TypeScript. We use this `public readonly` over [accessor methods](https://en.wikipedia.org/wiki/Mutator_method), in all 'model data' type object.

### ECMAScript 2015
<img src="https://esdiscuss.org/static/5.4.0/logo.svg" height="200" />
6th major release of the ECMAScript. A standardized JavaScript language (it is a dialect of ES6). Provides us with classes and the core features of OO langages (E.g. classes).

### JSX Harmony
JSX harmony is a language primarily built for React.
The language was primarily used to make React components easier to read and faster to write.

### SASS & CSS Modules
<img src="http://sass-lang.com/assets/img/logos/logo-b6e1ef6e.svg" height="200" />
SASS is effectively an extension of CSS3.
We used SASS over plain CSS3 simply for SASS's variable constants feature.

## Frameworks & libraries we use
### React
<img src="https://d1xwtr0qwr70yv.cloudfront.net/assets/tech/react-7b90239e805d8b06ca263be745f8ad5f.svg" height="200" />
A a declarative and flexible JavaScript library for building user interfaces developed by Facebook.

## Node.js
<img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Node.js_logo_2015.svg" height="200" />
Node.js is a server framework built from Chrome's JavaScript V8 engine.
It was chosen for a number of reasons.

## Babel
<img src="https://babeljs.io/images/logo.svg" height="200"/>
Babel essentially allows developers to transpile newer and alternative versions of JavaScript into older, more widely supported versions of JavaScript.
We were not unsure of whether the markers' used modern browsers so Babel ensured application compatiblity with their browsers.

## Webpack
<img src="https://worldvectorlogo.com/logos/webpack.svg" height="200"/>
Webpack was used to tie all together and bundle the backend and frontend applications each into single JavaScript files.
In addition, Webpack was used as a means of hot module replacement which was handy for frontend development.

## Frameworks & libraries we decided against
### Redux
<img src="http://javascript.tutorialhorizon.com/files/2016/06/redux-logo.png" height="200"/>
Redux is an exellent framework for managing state in an application and works well with React.
However, Redux has a functional programming based nature which didn't fit in with the assignment (object oriented assignment). 

### React Router
<img src="https://cdn.worldvectorlogo.com/logos/react-router.svg" height="200"/>
React Router allows easy management of routes/url navigation. 
The assignment only really required a single page and browser history management was out of scope.
