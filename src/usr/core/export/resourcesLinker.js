import forOwn from 'lodash/forOwn';
import values from 'lodash/values';
import * as constants from '../../commons/constants';
import { getComponentPathsByName, getFunctionsImportList, getPropertiesList } from './utils';

function findForwardPathInProperties (targetProperties, forwardPath) {
  let foundProperty = null;
  if (targetProperties) {
    let targetValues;
    let foundTargetValue;
    forOwn(targetProperties, (value, prop) => {
      targetValues = values(value);
      foundTargetValue = targetValues.find(i => i.populatePath === forwardPath);
      if (foundTargetValue) {
        foundProperty = foundTargetValue;
      }
    });
  }
  return foundProperty;
}

function getPagesComponentInstances(componentTreeNode, targetProperties) {
  let result = [];
  if (componentTreeNode) {
    const {type, props, children} = componentTreeNode;
    let componentInstanceItem;
    if (type === constants.PAGE_COMPONENT_TYPE && props) {
      componentInstanceItem = {
        componentKey: `${props.componentName}_${props.componentInstance}`,
        componentName: props.componentName,
        componentInstance: props.componentInstance,
        initialState: props.initialState
      };
      const { importName, componentImportPath, containerImportPath } =
        getComponentPathsByName(props.componentName, props.componentInstance);
      componentInstanceItem.importName = importName;
      componentInstanceItem.componentImportPath = componentImportPath;
      componentInstanceItem.containerImportPath = containerImportPath;
      componentInstanceItem.propsList =
        getPropertiesList(targetProperties[componentInstanceItem.componentKey]);
      result.push(componentInstanceItem);
    }
    if (children && children.length > 0) {
      children.forEach(child => {
        result = result.concat(getPagesComponentInstances(child, targetProperties));
      });
    }
  }
  return result;
}

function getPageList (pageNode, targetProperties) {
  let result = [];
  if (pageNode) {
    const { type, props, children } = pageNode;
    if (type === constants.GRAPH_MODEL_PAGE_TYPE) {
      const foundTargetPropertyToForward =
        findForwardPathInProperties(targetProperties, props.pagePath);
      const importName =
        `${props.pagePath.replace(constants.FILE_SEPARATOR_REGEXP, constants.RESOURCE_NAME_VALID_SEPARATOR)}_page`;
      const pageItem = {
        importPath: constants.DIR_NAME_APP +
          constants.FILE_SEPARATOR +
          constants.EXPORT_DIR_NAME_PAGES +
          constants.FILE_SEPARATOR +
          props.pagePath +
          constants.FILE_SEPARATOR +
          'Page',
        importName,
        metaData: props.metaData,
        pagePath: foundTargetPropertyToForward
          ? `/${props.pagePath}/:parameter?`
          : `/${props.pagePath}`,
        chunkName: importName,
        isNoMatch: props.pageName === 'noMatch',
        isMain: props.pagePath.indexOf('main') === 0,
        componentInstances: getPagesComponentInstances(props.componentsTree, targetProperties),
        componentsTree: props.componentsTree
      };
      result.push(pageItem);
    }
    if (children && children.length > 0) {
      children.forEach(child => {
        result = result.concat(getPageList(child, targetProperties));
      });
    }
  }
  return result;
}

function setPages(pageList) {
  const pages = { pageList };
  pageList.forEach(pageItem => {
    if (pageItem && pageItem.isMain) {
      pages.mainPage = pageItem;
    }
    if (pageItem && pageItem.isNoMatch) {
      pages.noMatchPage = pageItem;
    }
  });
  if (!pages.mainPage && pageList.length > 0) {
    pages.mainPage = pageList[0];
    pageList[0].isMain = true;
  }
  return pages;
}

function combineAllComponentInstances(actionSequences, targetProperties, pagesComponentInstances) {
  if (actionSequences) {
    forOwn(actionSequences, (value, prop) => {
      if (value) {
        const { componentName, componentInstance } = value;
        if (componentName && componentInstance) {
          // this is a page component, and not a page
          value.functionsList = getFunctionsImportList(value);
          value.propsList = getPropertiesList(targetProperties[prop]);
          const { importName, componentImportPath, containerImportPath } =
            getComponentPathsByName(value.componentName, value.componentInstance);
          value.importName = importName;
          value.componentImportPath = componentImportPath;
          value.containerImportPath = containerImportPath;
        }
      }
    });
    if (pagesComponentInstances && pagesComponentInstances.length > 0) {
      pagesComponentInstances.forEach(pageComponentInstance => {
        if (!actionSequences[pageComponentInstance.componentKey]) {
          actionSequences[pageComponentInstance.componentKey] = {
            componentName: pageComponentInstance.componentName,
            componentInstance: pageComponentInstance.componentInstance,
            initialState: pageComponentInstance.initialState,
            propsList: [].concat(pageComponentInstance.propsList),
            functionsList: [],
            importName: pageComponentInstance.importName,
            componentImportPath: pageComponentInstance.componentImportPath,
            containerImportPath: pageComponentInstance.containerImportPath,
          }
        } else {
          actionSequences[pageComponentInstance.componentKey].initialState =
            pageComponentInstance.initialState;
        }
      });
    }
  }
  return actionSequences;
}

export function getResources (pagesTree, actionSequences, targetProperties) {
  const pageList = getPageList(pagesTree, targetProperties);
  let pagesComponentInstances = [];
  pageList.forEach(pageItem => {
    pagesComponentInstances = pagesComponentInstances.concat(pageItem.componentInstances);
  });
  return {
    pages: setPages(pageList),
    componentInstances: combineAllComponentInstances(actionSequences, targetProperties, pagesComponentInstances),
  };
}