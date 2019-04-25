import forOwn from 'lodash/forOwn';
import globalStore from '../../globalStore';
import GraphModel from '../graph/GraphModel';
import * as config from '../config/config';
import constants from '../../commons/constants';
import * as projectResourcesUtils from './projectResourcesUtils';
import * as projectResourcesCompiler from './projectResourcesCompiler';

let pagesGraphModel = globalStore.get('pagesGraphModel');
let flowsGraphModel = globalStore.get('flowsGraphModel');
let userComponentsGraphModel = globalStore.get('userComponentsGraphModel');
let userFunctionsGraphModel = globalStore.get('userFunctionsGraphModel');
let userComponentStoriesGraphModel = globalStore.get('userComponentStoriesGraphModel');

export let projectDisplayName;
let resourcesUpdateHistory;

export function initNewResourcesTrees () {
  // get the directory name as a project name
  const pathParts = config.projectDirPath.split(constants.FILE_SEPARATOR);
  projectDisplayName = pathParts[pathParts.length - 1];
  // initialize new graph objects
  pagesGraphModel = new GraphModel();
  pagesGraphModel.initModel({
    key: constants.GRAPH_MODEL_PAGES_ROOT_KEY,
    type: constants.GRAPH_MODEL_PAGES_ROOT_TYPE,
    props: {
      displayName: 'Pages',
      resourceType: constants.RESOURCE_IN_PAGES_TYPE,
    }
  });
  flowsGraphModel = new GraphModel();
  flowsGraphModel.initModel({
    key: constants.GRAPH_MODEL_FLOWS_ROOT_KEY,
    type: constants.GRAPH_MODEL_FLOWS_ROOT_TYPE,
    props: {
      displayName: 'Flows',
      resourceType: constants.RESOURCE_IN_FLOWS_TYPE,
    }
  });
  userComponentsGraphModel = new GraphModel();
  userComponentsGraphModel.initModel({
    key: constants.GRAPH_MODEL_COMPONENTS_ROOT_KEY,
    type: constants.GRAPH_MODEL_COMPONENTS_ROOT_TYPE,
    props: {
      displayName: 'Components',
      resourceType: constants.RESOURCE_IN_COMPONENTS_TYPE,
    }
  });
  userFunctionsGraphModel = new GraphModel();
  userFunctionsGraphModel.initModel({
    key: constants.GRAPH_MODEL_USER_FUNCTIONS_ROOT_KEY,
    type: constants.GRAPH_MODEL_USER_FUNCTIONS_ROOT_TYPE,
    props: {
      displayName: 'Functions',
      resourceType: constants.RESOURCE_IN_USER_FUNCTIONS_TYPE,
    }
  });
  userComponentStoriesGraphModel = new GraphModel();
  userComponentStoriesGraphModel.initModel({
    key: constants.GRAPH_MODEL_COMPONENT_STORIES_ROOT_KEY,
    type: constants.GRAPH_MODEL_COMPONENT_STORIES_ROOT_TYPE,
    props: {
      displayName: 'Stories',
      resourceType: constants.RESOURCE_IN_COMPONENT_STORIES_TYPE,
    }
  });
  //
  globalStore.set('pagesGraphModel', pagesGraphModel);
  globalStore.set('flowsGraphModel', flowsGraphModel);
  globalStore.set('userComponentsGraphModel', userComponentsGraphModel);
  globalStore.set('userFunctionsGraphModel', userFunctionsGraphModel);
  globalStore.set('userComponentStoriesGraphModel', userComponentStoriesGraphModel);
}

export function resetResourcesTrees() {
  globalStore.clear();
}

function updateResourceTrees (declarationsInFile) {
  let deletedResources = [];
  const { updatedResources, resourcesToDelete } = projectResourcesUtils.updateResourceTree(declarationsInFile);
  // delete at all resources that have empty declarations in the source files
  resourcesToDelete.forEach(resourceToDelete => {
    deletedResources = deletedResources.concat(projectResourcesUtils.eraseResource(resourceToDelete));
  });
  // clean all empty directories
  projectResourcesUtils.cleanAllGraphs();
  return { updatedResources, deletedResources };
}

export function updateResources (declarationsInFiles) {
  let updatedResources = [];
  let deletedResources = [];
  if (declarationsInFiles && declarationsInFiles.length > 0) {
    declarationsInFiles.forEach(declarationsInFile => {
      const {
        updatedResources: newUpdatedResources,
        deletedResources: newDeletedResources,
      } = updateResourceTrees(declarationsInFile);
      updatedResources = [
        ...updatedResources,
        ...newUpdatedResources
      ];
      deletedResources = [
        ...deletedResources,
        ...newDeletedResources
      ];
    });
  }
  let doUpdateAll = projectResourcesCompiler.compileResources();
  return { updatedResources, deletedResources, doUpdateAll };
}

export function getResourceByKey(resourceKey) {
  return projectResourcesUtils.getResource(resourceKey);
}

export function getUserFunctionsTree (startKey = null) {
  return projectResourcesUtils.getResourceTree(constants.RESOURCE_IN_USER_FUNCTIONS_TYPE, startKey);
}

export function getUserComponentsTree (startKey = null) {
  return projectResourcesUtils.getResourceTree(constants.RESOURCE_IN_COMPONENTS_TYPE, startKey);
}

export function getPagesTree (startKey = null) {
  return projectResourcesUtils.getResourceTree(constants.RESOURCE_IN_PAGES_TYPE, startKey);
}

export function getFlowsTree (startKey = null) {
  return projectResourcesUtils.getResourceTree(constants.RESOURCE_IN_FLOWS_TYPE, startKey);
}

export function getUserComponentStoriesTree (startKey = null) {
  return projectResourcesUtils.getResourceTree(constants.RESOURCE_IN_COMPONENT_STORIES_TYPE, startKey);
}

export function getAllPagesList() {
  return projectResourcesUtils.getAllPagesList();
}

export function findResourcesKeysByText(text) {
  return projectResourcesUtils.findResourcesKeysByText(text);
}

export function getSourceCode(resource) {
  return projectResourcesUtils.getResourceSource(resource);
}

export function pushUpdateToResourceHistory(resource, fileObject) {
  if (!resourcesUpdateHistory) {
    resourcesUpdateHistory = {};
  }
  resourcesUpdateHistory[resource.key] = resourcesUpdateHistory[resource.key] || [];
  resourcesUpdateHistory[resource.key].push(fileObject);
  return getResourcesUpdateHistory();
}

export function getResourcesUpdateHistory() {
  const portableResourcesUpdateHistory = {};
  forOwn(resourcesUpdateHistory, (value, key) => {
    portableResourcesUpdateHistory[key] = value ? value.map(i => i.filePath) : [];
  });
  return portableResourcesUpdateHistory;
}

export function popUpdateFromResourceHistory(resource) {
  let fileObject = null;
  if (resourcesUpdateHistory) {
    const resourceHistory = resourcesUpdateHistory[resource.key];
    if (resourceHistory && resourceHistory.length > 0) {
      fileObject = resourceHistory.pop();
    }
  }
  return fileObject;
}