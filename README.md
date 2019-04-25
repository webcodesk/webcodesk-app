# Webcodesk - a rapid development tool for React Web applications

This repository contains the source code of the Webcodesk desktop application.

Learn more about Webcodesk in [Documentation](https://webcodesk.com/documentation).

Download binary executables for your operating system from [Webcodesk site](https://webcodesk.com).

### What's inside?

There are two parts in Webcodesk: an Electron application, and a Single Page Web application.

Used tools and libraries:
* [Electron](https://electronjs.org/) - for cross platform desktop app.
* [electron-builder](https://www.electron.build/) - building the binary executables.
* [Create React App](https://facebook.github.io/create-react-app/) - building a Web app bundle.
* [Material-UI](https://material-ui.com/) - UI components.
* [React App Framework](https://github.com/webcodesk/react-app-framework) - linking UI components with core logic.
* [Babel](https://babeljs.io/) - the source code parsing.
* [D3.js](https://d3js.org/) - the flow diagram presentation.

### The source code structure

* `public` - static files
* `src` - the source code root directory
    * `app` - react-app-framework configuration files
    * `electron` - Electron application files
    * `icons` - icons files
    * `usr`
        * `api` - functions lists used in flows
        * `commons` - global constants files
        * `components` - UI components
        * `core` - core logic implementation 

### How to build the application?

Run commands in the order as they are listed.

### Bootstrap application

* `git clone https://github.com/webcodesk/webcodesk-app.git`
* `cd webcodesk-app`
* `yarn install`

#### Development: run Web application and Electron app

* `yarn build`

> Run this command only if there were any changes in files from the `electron` directory.

* `yarn start`

> This command runs the Webpack development server on 3000 port. 
Any changes in the source code reload the application automatically.

* `yarn electron`

> This command runs the Electron application.

#### Production: create the distribution

* `yarn dist`

> Once the distribution is built successfully, find the application executables in the `dist` directory.

### License

MIT License

Copyright (c) 2019 [Oleksandr (Alex) Pustovalov](https://github.com/ipselon)
