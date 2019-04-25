import forOwn from 'lodash/forOwn';
import template from 'lodash/template';
import { repairPath } from '../../utils/fileUtils';
import { path } from '../../utils/electronUtils';
import * as constants from '../../../commons/constants';
import { format } from '../utils';

let storeDirPath;

const storeFileContent = `
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducer';
let composeWithDevTools;
if (process.env.NODE_ENV !== 'production') {
  const developmentOnly = require('redux-devtools-extension/developmentOnly');
  composeWithDevTools = developmentOnly.composeWithDevTools;
}

export function configureStore(initialState, helpersConfig) {
  const middleware = [thunk.withExtraArgument(helpersConfig)];
  let enhancer;

  if (process.env.NODE_ENV !== 'production') {

    const composeEnhancers = composeWithDevTools({});

    // https://redux.js.org/docs/api/applyMiddleware.html
    enhancer = composeEnhancers(applyMiddleware(...middleware));
  } else {
    enhancer = applyMiddleware(...middleware);
  }

  // https://redux.js.org/docs/api/createStore.html
  return createStore(rootReducer, initialState, enhancer);
}
`;

function generateReduxStore() {
  const fileObject = {};
  try {
    const storeFilePath = repairPath(path().join(storeDirPath, 'store.js'));
    const fileData = format(storeFileContent);
    fileObject.filePath = storeFilePath;
    fileObject.fileData = fileData;
  } catch (e) {
    console.error(`Can not create store.js file: ${e.message}`);
  }
  return fileObject;
}

const reducerFileContent = `
export default function universalReducer (state = {}, action) {
  const { payload, type } = action;
  return { ...state, ...{ [type]: { ...state[type], ...payload } } };
};
`;

function generateReduxReducer() {
  const fileObject = {};
  try {
    const reducerFilePath = repairPath(path().join(storeDirPath, 'reducer.js'));
    const fileData = format(reducerFileContent);
    fileObject.filePath = reducerFilePath;
    fileObject.fileData = fileData;
  } catch (e) {
    console.error(`Can not create reducer.js file: ${e.message}`);
  }
  return fileObject;
}

const initialStateFileContent = `
export default <%= JSON.stringify(data) %>;
`;

function generateInitialState(componentInstances) {
  const fileObject = {};
  try {
    const initialStateFilePath = repairPath(path().join(storeDirPath, 'initialState.js'));
    const initialStateData = {};
    forOwn(componentInstances, componentInstance => {
      initialStateData[`${componentInstance.componentName}_${componentInstance.componentInstance}`] =
        componentInstance.initialState;
    });
    const text = template(initialStateFileContent)({ data: initialStateData });
    const fileData = format(text);
    fileObject.filePath = initialStateFilePath;
    fileObject.fileData = fileData;
  } catch (e) {
    console.error(`Can not create initialState.js file: ${e.message}`);
  }
  return fileObject;
}

export function generate(destDirPath, resources) {
  const fileList = [];
  const { componentInstances } = resources;
  storeDirPath = repairPath(path().join(
    destDirPath,
    constants.DIR_NAME_SRC,
    constants.DIR_NAME_APP,
    constants.EXPORT_DIR_NAME_STORE
  ));
  fileList.push(generateReduxStore());
  fileList.push(generateReduxReducer());
  fileList.push(generateInitialState(componentInstances));
  return fileList;
}
