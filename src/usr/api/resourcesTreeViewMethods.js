import globalStore from '../globalStore';
import { sendAppWidowMessage } from '../core/utils/electronUtils';
import * as projectObjectFactory from '../core/project/projectObjectFactory';
import * as projectFileFactory from '../core/project/projectFileFactory';
import appWindowMessages from '../commons/appWindowMessages';
import * as projectManager from '../core/project/projectManager';
import * as projectResourcesManager from '../core/project/projectResourcesManager';
import {testReservedName} from "../core/utils/textUtils";
import * as constants from "../commons/constants";
import * as scaffoldManager from '../core/scaffold/scaffoldManager';

export const updateResourcesTreeView = () => (dispatch) => {
  const resourcesTreeViewObject = projectObjectFactory.createResourcesTreeViewObject();
  dispatch('resourcesTreeViewObject', resourcesTreeViewObject);
};

export const selectResourceByKey = ({resourceKey, virtualPath}) => (dispatch) => {
  const selectedResource = projectResourcesManager.getResourceByKey(resourceKey);
  if (selectedResource && selectedResource.isDirectory) {
    virtualPath = virtualPath && virtualPath.length > 0
      ? `${virtualPath}${constants.FILE_SEPARATOR}${selectedResource.displayName}`
      : selectedResource.displayName;
  }
  dispatch('selectedResourceKey', resourceKey);
  dispatch('selectedResource', selectedResource);
  dispatch('selectedVirtualPath', virtualPath);
  dispatch('selected', {resource: selectedResource, virtualPath});
};

export const removeSelectedResource = () => (dispatch) => {
  dispatch('selectedResourceKey', null);
  dispatch('selectedResource', null);
  dispatch('selectedVirtualPath', '');
};

export const findResourcesByText = (text) => (dispatch) => {
  const foundKeys = projectResourcesManager.findResourcesKeysByText(text);
  let foundKeysObject = foundKeys.reduce((acc, value) => {
    return {...acc, ...{[value]: true}};
  }, {});
  dispatch('foundResourceKeys', foundKeysObject);
  const keysToExpand = {};
  foundKeys.forEach(foundKey => {
    const pageResource = projectResourcesManager.getResourceByKey(foundKey);
    pageResource.allParentKeys.forEach(parentKey => {
      keysToExpand[parentKey] = true;
    });
  });
  let expandedResourceKeys = globalStore.get('expandedResourceKeys') || {};
  expandedResourceKeys = {...expandedResourceKeys, ...keysToExpand};
  globalStore.set('expandedResourceKeys', expandedResourceKeys);
  dispatch('expandedResourceKeys', expandedResourceKeys);
};

export const cancelFindResourcesByText = () => (dispatch) => {
  dispatch('foundResourceKeys', {});
};

export const findResourcesByEditorRequest = (text) => (dispatch) => {
  dispatch('searchText', text);
  findResourcesByText(text)(dispatch);
};

export const showContextMenu = ({resource, virtualPath}) => (dispatch) => {
  // we have to pass only serializable plain object
  sendAppWidowMessage(
    appWindowMessages.CONTEXT_MENU_RESOURCE_TREE_VIEW_ITEM,
    {resourceModel: resource.compactModel, virtualPath}
  );
};

export const createNewPageStart = ({virtualPath}) => (dispatch) => {
  dispatch('dirPath', virtualPath);
  dispatch('isDialogOpen', true);
};

export const createNewPageSubmit = (options) => async (dispatch) => {
  const { pageName, directoryName } = options;
  if (testReservedName(pageName)) {
    throw Error(`${pageName} is a reserved name.`);
  }
  const fileObject =
    projectFileFactory.createNewPageFileObject(pageName, directoryName);
  const isAlreadyExists =
    await projectManager.checkResourceExists(fileObject.filePath);
  if (isAlreadyExists) {
    throw Error('The page with the equal path already exists.');
  }
  const newResources = await projectManager.updateResource(fileObject.filePath, fileObject.fileData);
  if (newResources.updatedResources && newResources.updatedResources.length > 0) {
    const newResource = newResources.updatedResources[0];
    dispatch('resourceUpdatedSuccessfully');
    if (newResource && newResource.hasChildren) {
      const pageResource = projectResourcesManager.getResourceByKey(newResource.childrenKeys[0]);
      dispatch('selectedResourceKey', pageResource.key);
      dispatch('selectedResource', pageResource);
      const keysToExpand = {};
      pageResource.allParentKeys.forEach(parentKey => {
        keysToExpand[parentKey] = true;
      });
      let expandedResourceKeys = globalStore.get('expandedResourceKeys') || {};
      expandedResourceKeys = {...expandedResourceKeys, ...keysToExpand};
      globalStore.set('expandedResourceKeys', expandedResourceKeys);
      dispatch('expandedResourceKeys', expandedResourceKeys);
    }
  }
  dispatch('isDialogOpen', false);
  dispatch('fileObject', fileObject);
};

export const copyPageStart = ({resource, virtualPath}) => (dispatch) => {
  dispatch('resource', resource);
  dispatch('dirPath', virtualPath);
  dispatch('isDialogOpen', true);
};

export const copyPageSubmit = ({resource, name, directoryName}) => async (dispatch) => {
  if (testReservedName(name)) {
    throw Error(`${name} is a reserved name.`);
  }
  const fileObject =
    projectFileFactory.createCopyPageFileObject(resource, name, directoryName);
  const isAlreadyExists =
    await projectManager.checkResourceExists(fileObject.filePath);
  if (isAlreadyExists) {
    throw Error('The page with the equal path already exists.');
  }
  const newResources = await projectManager.updateResource(fileObject.filePath, fileObject.fileData);
  if (newResources.updatedResources && newResources.updatedResources.length > 0) {
    const newResource = newResources.updatedResources[0];
    dispatch('resourceUpdatedSuccessfully');
    if (newResource && newResource.hasChildren) {
      const pageResource = projectResourcesManager.getResourceByKey(newResource.childrenKeys[0]);
      dispatch('selectedResourceKey', pageResource.key);
      dispatch('selectedResource', pageResource);
      const keysToExpand = {};
      pageResource.allParentKeys.forEach(parentKey => {
        keysToExpand[parentKey] = true;
      });
      let expandedResourceKeys = globalStore.get('expandedResourceKeys') || {};
      expandedResourceKeys = {...expandedResourceKeys, ...keysToExpand};
      globalStore.set('expandedResourceKeys', expandedResourceKeys);
      dispatch('expandedResourceKeys', expandedResourceKeys);
    }
  }
  dispatch('isDialogOpen', false);
  dispatch('fileObject', fileObject);
};

export const removePageStart = (resource) => (dispatch) => {
  let resourceToDelete = resource;
  if (resourceToDelete && resourceToDelete.isPage) {
    // we can delete only file
    resourceToDelete = projectResourcesManager.getResourceByKey(resource.parentKey);
  }
  dispatch('resource', resourceToDelete);
  dispatch('resourceName', resource.displayName);
  dispatch('isDialogOpen', true);
};

export const removePageSubmit = (resource) => async (dispatch) => {
  if (resource && resource.absolutePath) {
    dispatch('deleteFilePath', resource.absolutePath);
  }
  dispatch('isDialogOpen', false);
};

export const createNewFlowStart = ({virtualPath}) => (dispatch) => {
  dispatch('dirPath', virtualPath);
  dispatch('isDialogOpen', true);
};

export const createNewFlowSubmit = ({name, directoryName}) => async (dispatch) => {
  if (testReservedName(name)) {
    throw Error(`${name} is a reserved name.`);
  }
  const fileObject =
    projectFileFactory.createNewFlowFileObject(name, directoryName);
  const isAlreadyExists =
    await projectManager.checkResourceExists(fileObject.filePath);
  if (isAlreadyExists) {
    throw Error('The page with the equal path already exists.');
  }
  const newResources = await projectManager.updateResource(fileObject.filePath, fileObject.fileData);
  if (newResources.updatedResources && newResources.updatedResources.length > 0) {
    const newResource = newResources.updatedResources[0];
    dispatch('resourceUpdatedSuccessfully');
    if (newResource.hasChildren) {
      const flowResource = projectResourcesManager.getResourceByKey(newResource.childrenKeys[0]);
      dispatch('selectedResourceKey', flowResource.key);
      dispatch('selectedResource', flowResource);
      const keysToExpand = {};
      flowResource.allParentKeys.forEach(parentKey => {
        keysToExpand[parentKey] = true;
      });
      let expandedResourceKeys = globalStore.get('expandedResourceKeys') || {};
      expandedResourceKeys = {...expandedResourceKeys, ...keysToExpand};
      globalStore.set('expandedResourceKeys', expandedResourceKeys);
      dispatch('expandedResourceKeys', expandedResourceKeys);
    }
  }
  dispatch('isDialogOpen', false);
  dispatch('fileObject', fileObject);
};

export const copyFlowStart = ({resource, virtualPath}) => (dispatch) => {
  dispatch('resource', resource);
  dispatch('dirPath', virtualPath);
  dispatch('isDialogOpen', true);
};

export const copyFlowSubmit = ({resource, name, directoryName}) => async (dispatch) => {
  if (testReservedName(name)) {
    throw Error(`${name} is a reserved name.`);
  }
  const fileObject = projectFileFactory.createCopyFlowFileObject(resource, name, directoryName);
  const isAlreadyExists =
    await projectManager.checkResourceExists(fileObject.filePath);
  if (isAlreadyExists) {
    throw Error('The page with the equal path already exists.');
  }
  const newResources = await projectManager.updateResource(fileObject.filePath, fileObject.fileData);
  if (newResources.updatedResources && newResources.updatedResources.length > 0) {
    const newResource = newResources.updatedResources[0];
    dispatch('resourceUpdatedSuccessfully');
    if (newResource.hasChildren) {
      const flowResource = projectResourcesManager.getResourceByKey(newResource.childrenKeys[0]);
      dispatch('selectedResourceKey', flowResource.key);
      dispatch('selectedResource', flowResource);
      const keysToExpand = {};
      flowResource.allParentKeys.forEach(parentKey => {
        keysToExpand[parentKey] = true;
      });
      let expandedResourceKeys = globalStore.get('expandedResourceKeys') || {};
      expandedResourceKeys = {...expandedResourceKeys, ...keysToExpand};
      globalStore.set('expandedResourceKeys', expandedResourceKeys);
      dispatch('expandedResourceKeys', expandedResourceKeys);
    }
  }
  dispatch('isDialogOpen', false);
  dispatch('fileObject', fileObject);
};

export const removeFlowStart = (resource) => (dispatch) => {
  let resourceToDelete = resource;
  if (resourceToDelete && resourceToDelete.isFlow) {
    // we can delete only file
    resourceToDelete = projectResourcesManager.getResourceByKey(resource.parentKey);
  }
  dispatch('resource', resourceToDelete);
  dispatch('resourceName', resource.displayName);
  dispatch('isDialogOpen', true);
};

export const removeFlowSubmit = (resource) => async (dispatch) => {
  if (resource && resource.absolutePath) {
    dispatch('deleteFilePath', resource.absolutePath);
  }
  dispatch('isDialogOpen', false);
};

export const createNewComponentStart = ({virtualPath}) => (dispatch) => {
  dispatch('dirPath', virtualPath);
  dispatch('isDialogOpen', true);
};

export const createNewComponentSubmit = (options) => async (dispatch) => {
  const {name, directoryName, fileExtension, componentScaffold} = options;
  if (testReservedName(name)) {
    throw Error(`${name} is a reserved name.`);
  }
  await scaffoldManager.generateComponentScaffold(name, directoryName, fileExtension, componentScaffold);
  dispatch('isDialogOpen', false);
};

export const createNewFunctionsStart = ({virtualPath}) => (dispatch) => {
  dispatch('dirPath', virtualPath);
  dispatch('isDialogOpen', true);
};

export const createNewFunctionsSubmit = (options) => async (dispatch) => {
  const {
    name,
    directoryName,
    fileExtension,
    functionsVariants,
    valueType
  } = options;
  if (testReservedName(name)) {
    throw Error(`${name} is a reserved name.`);
  }
  await scaffoldManager.generateFunctionsScaffold(
    name, directoryName, fileExtension, functionsVariants, valueType
  );
  dispatch('isDialogOpen', false);
};

export const toggleFlow = ({resource, isDisabled}) => async (dispatch) => {
  const fileObject = projectFileFactory.createFileObject(resource, { isDisabled });
  const newResources = await projectManager.updateResource(fileObject.filePath, fileObject.fileData);
  if (newResources.updatedResources && newResources.updatedResources.length > 0) {
    dispatch('resourceUpdatedSuccessfully');
  }
  dispatch('fileObject', fileObject);
};

export const toggleExpandedResourceKey = (key) => (dispatch) => {
  let expandedResourceKeys = globalStore.get('expandedResourceKeys') || {};
  expandedResourceKeys = {...expandedResourceKeys, ...{[key]: !expandedResourceKeys[key]}};
  globalStore.set('expandedResourceKeys', expandedResourceKeys);
  dispatch('expandedResourceKeys', expandedResourceKeys);
};

export const getProjectServerStatus = () => (dispatch) => {
  projectManager.getProjectServerStatus();
};

export const getProjectServerLog = () => (dispatch) => {
  projectManager.getProjectServerLog();
};

export const getProjectSettings = () => (dispatch) => {
  dispatch('projectSettings', projectManager.getProjectSettings());
};

export const startProjectServer = () => dispatch => {
  projectManager.startProjectServer();
};

export const stopProjectServer = () => dispatch => {
  projectManager.stopProjectServer();
};

export const restartProjectServer = () => dispatch => {
  projectManager.stopProjectServer();
  projectManager.startProjectServer();
};

export const setProjectServerPort = (newPort) => async (dispatch) => {
  const newProjectSettings = await projectManager.mergeProjectSettings({port: newPort});
  projectManager.stopProjectServer();
  projectManager.startProjectServer();
  dispatch('projectSettings', newProjectSettings);
  setTimeout(() => {
    dispatch('doUpdateAll');
  }, 10000);
};

export const openMarket = () => async (dispatch) => {
  dispatch('isOpen', true);
};
