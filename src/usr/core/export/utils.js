import forOwn from 'lodash/forOwn';
import prettier from 'prettier/standalone';
import prettierBabylon from 'prettier/parser-babylon';
import * as constants from '../../commons/constants';
import { path } from '../utils/electronUtils';

export function format(text) {
  return prettier.format(text, { parser: 'babylon', plugins: [prettierBabylon], singleQuote: true });
}

export function getFunctionImportPathByName (functionName) {
  const paths = {};
  const innerPath =
    functionName.replace(
      constants.RESOURCE_NAME_INVALID_SEPARATOR_REGEXP,
      constants.FILE_SEPARATOR
    );
  paths.importName = path().basename(innerPath);
  paths.functionImportPath = path().dirname(innerPath);
  paths.appFunctionImportPath = constants.DIR_NAME_APP +
    constants.FILE_SEPARATOR +
    constants.EXPORT_DIR_NAME_FUNCTIONS +
    constants.FILE_SEPARATOR +
    innerPath;
  return paths;
}

export function getComponentPathsByName (componentName, componentInstance) {
  const paths = {};
  const innerPath =
    componentName.replace(
      constants.RESOURCE_NAME_INVALID_SEPARATOR_REGEXP,
      constants.FILE_SEPARATOR
    );
  paths.componentImportPath = innerPath;
  paths.importName = path().basename(innerPath);
  paths.containerImportPath = constants.DIR_NAME_APP +
    constants.FILE_SEPARATOR +
    constants.EXPORT_DIR_NAME_CONTAINERS +
    constants.FILE_SEPARATOR +
    paths.componentImportPath +
    constants.FILE_SEPARATOR +
    componentInstance;
  return paths;
}

export function getFunctionsImportList (target, importList = []) {
  if (target) {
    const { type, props, events } = target;
    if (type === constants.FRAMEWORK_ACTION_SEQUENCE_USER_FUNCTION_TYPE) {
      const functionPaths = getFunctionImportPathByName(props.functionName);
      let foundFunction = importList.find(i => i.importPath === functionPaths.appFunctionImportPath);
      if (!foundFunction) {
        foundFunction = {
          importPath: functionPaths.appFunctionImportPath,
          importName: `f${importList.length + 1}`,
        };
        importList.push(foundFunction);
      }
    }
    if (events && events.length > 0) {
      events.forEach(event => {
        if (event && event.targets && event.targets.length > 0) {
          event.targets.forEach(eventTarget => {
            importList = getFunctionsImportList(eventTarget, importList);
          });
        }
      });
    }
  }
  return importList;
}

export function getFunctionsList (target, existingList = []) {
  if (target) {
    const { type, props, events } = target;
    if (type === constants.FRAMEWORK_ACTION_SEQUENCE_USER_FUNCTION_TYPE) {
      let foundFunction = existingList.find(i => i === props.functionName);
      if (!foundFunction) {
        existingList.push(props.functionName);
      }
    }
    if (events && events.length > 0) {
      events.forEach(event => {
        if (event && event.targets && event.targets.length > 0) {
          event.targets.forEach(eventTarget => {
            existingList = getFunctionsList(eventTarget, existingList);
          });
        }
      });
    }
  }
  return existingList;
}

export function getPropertiesList(componentProps) {
  const propsList = [];
  if (componentProps) {
    forOwn(componentProps, (propValue, propKey) => {
      propsList.push({
        name: propKey,
        value: propValue,
      })
    });
  }
  return propsList;
}