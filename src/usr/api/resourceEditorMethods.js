import globalStore from '../globalStore';
import * as auth from '../core/config/auth';
import * as projectObjectFactory from '../core/project/projectObjectFactory';
import * as projectFileFactory from '../core/project/projectFileFactory';
import * as projectResourcesManager from '../core/project/projectResourcesManager';
import * as projectManager from '../core/project/projectManager';

const checkMinimalActiveTabsAmount = (resourceEditorTabs) => {
  if (resourceEditorTabs.length > 6) {
    let minTimestamp = Date.now();
    let indexToDelete = -1;
    resourceEditorTabs.forEach((tabObject, index) => {
      if (tabObject.timestamp < minTimestamp) {
        minTimestamp = tabObject.timestamp;
        indexToDelete = index;
      }
    });
    if (indexToDelete >= 0) {
      resourceEditorTabs.splice(indexToDelete, 1);
    }
  }
  return resourceEditorTabs;
};

/**
 *
 * @param resourceKey
 * @returns {Function}
 */
export const openTabWithResourceByKey = (resourceKey) => (dispatch) => {
  let resourceEditorTabs = globalStore.get('resourceEditorTabs') || [];
  let activeEditorTabIndex = globalStore.get('activeEditorTabIndex');
  resourceEditorTabs = checkMinimalActiveTabsAmount(resourceEditorTabs);
  let foundIndex = resourceEditorTabs.findIndex(tabObject => {
    const {resourceObject} = tabObject;
    return resourceObject && resourceObject.key === resourceKey;
  });
  if (foundIndex < 0) {
    const newEditorTabObject = projectObjectFactory.createResourceEditorTabObject(resourceKey);
    if (newEditorTabObject) {
      let foundIndex = resourceEditorTabs.findIndex(tabObject => {
        const {resourceObject} = tabObject;
        return resourceObject && resourceObject.key === newEditorTabObject.key;
      });
      if (foundIndex < 0) {
        const projectSettingsObject = projectManager.getProjectSettings();
        const sourceCode = projectObjectFactory.getResourceSourceCode(newEditorTabObject);
        resourceEditorTabs.push({
          resourceObject: newEditorTabObject,
          timestamp: Date.now(),
          projectSettingsObject,
          sourceCode,
        });
        activeEditorTabIndex = resourceEditorTabs.length - 1;
        resourceEditorTabs = [...resourceEditorTabs];
        dispatch('activeEditorTabIndex', activeEditorTabIndex);
        dispatch('resourceEditorTabs', resourceEditorTabs);
      } else {
        activeEditorTabIndex = foundIndex;
        resourceEditorTabs[foundIndex].timestamp = Date.now();
        dispatch('activeEditorTabIndex', activeEditorTabIndex);
      }
    }
  } else {
    activeEditorTabIndex = foundIndex;
    resourceEditorTabs[foundIndex].timestamp = Date.now();
    dispatch('activeEditorTabIndex', activeEditorTabIndex);
  }
  globalStore.set('resourceEditorTabs', resourceEditorTabs);
  globalStore.set('activeEditorTabIndex', activeEditorTabIndex);

};

/**
 *
 * @param selectedIndex
 * @returns {Function}
 */
export const openTabWithResourceByIndex = (selectedIndex) => (dispatch) => {
  let resourceEditorTabs = globalStore.get('resourceEditorTabs') || [];
  resourceEditorTabs[selectedIndex].timestamp = Date.now();
  globalStore.set('activeEditorTabIndex', selectedIndex);
  globalStore.set('resourceEditorTabs', resourceEditorTabs);
  dispatch('activeEditorTabIndex', selectedIndex);
};

/**
 *
 * @param closingIndex
 * @returns {Function}
 */
export const closeTabWithResourceByIndex = (closingIndex) => (dispatch) => {
  let resourceEditorTabs = globalStore.get('resourceEditorTabs') || [];
  let activeEditorTabIndex = globalStore.get('activeEditorTabIndex');
  if (resourceEditorTabs.length > closingIndex) {
    resourceEditorTabs.splice(closingIndex, 1);
    resourceEditorTabs = [...resourceEditorTabs];
    activeEditorTabIndex = closingIndex > activeEditorTabIndex ? activeEditorTabIndex : activeEditorTabIndex - 1;
    if (activeEditorTabIndex < 0 && resourceEditorTabs.length > 0) {
      activeEditorTabIndex = 0;
    }
    globalStore.set('resourceEditorTabs', resourceEditorTabs);
    globalStore.set('activeEditorTabIndex', activeEditorTabIndex);
    dispatch('resourceEditorTabs', resourceEditorTabs);
    dispatch('activeEditorTabIndex', activeEditorTabIndex);
  }
};

export const updateAllTabs = () => (dispatch) => {
  let activeEditorTabIndex = globalStore.get('activeEditorTabIndex');
  let resourceEditorTabs = globalStore.get('resourceEditorTabs') || [];
  const newResourceEditorTabs = [];
  const activeResourceTab = resourceEditorTabs[activeEditorTabIndex];
  if (resourceEditorTabs && resourceEditorTabs.length > 0) {
    resourceEditorTabs.forEach(resourceEditorTab => {
      const { livePreviewObject, resourceObject } = resourceEditorTab;
      if (resourceObject) {
        const resourceEditorTabObject = projectObjectFactory.createResourceEditorTabObject(resourceObject.key);
        if (resourceEditorTabObject) {
          const projectSettingsObject = projectManager.getProjectSettings();
          const sourceCode = projectObjectFactory.getResourceSourceCode(resourceEditorTabObject);
          newResourceEditorTabs.push({
            resourceObject: resourceEditorTabObject,
            projectSettingsObject,
            timestamp: Date.now(),
            sourceCode
          });
        }
      } else if (livePreviewObject) {
        const projectSettingsObject = projectManager.getProjectSettings();
        newResourceEditorTabs.push({
          livePreviewObject: projectObjectFactory.createResourceEditorLivePreviewTabObject(),
          projectSettingsObject,
          timestamp: Date.now()
        });
      }
    });
  }
  if (activeResourceTab) {
    const foundIndex = newResourceEditorTabs.findIndex(resourceTab => {
      return (resourceTab.livePreviewObject && activeResourceTab.livePreviewObject)
        || (resourceTab.resourceObject && activeResourceTab.resourceObject
          && resourceTab.resourceObject.key === activeResourceTab.resourceObject.key);
    });
    activeEditorTabIndex = foundIndex < 0 ? 0 : foundIndex;
  }
  activeEditorTabIndex = activeEditorTabIndex < newResourceEditorTabs.length ? activeEditorTabIndex : 0;
  globalStore.set('resourceEditorTabs', newResourceEditorTabs);
  globalStore.set('activeEditorTabIndex', activeEditorTabIndex);
  dispatch('activeEditorTabIndex', activeEditorTabIndex);
  dispatch('resourceEditorTabs', newResourceEditorTabs);
};

export const openTabWithLivePreview = () => (dispatch) => {
  let resourceEditorTabs = globalStore.get('resourceEditorTabs') || [];
  let activeEditorTabIndex = globalStore.get('activeEditorTabIndex');
  resourceEditorTabs = checkMinimalActiveTabsAmount(resourceEditorTabs);
  let foundIndex = resourceEditorTabs.findIndex(resourceTab => !!resourceTab.livePreviewObject);
  if (foundIndex < 0) {
    const projectSettingsObject = projectManager.getProjectSettings();
    resourceEditorTabs.push({
      livePreviewObject: projectObjectFactory.createResourceEditorLivePreviewTabObject(),
      projectSettingsObject,
      timestamp: Date.now(),
    });
    activeEditorTabIndex = resourceEditorTabs.length - 1;
    resourceEditorTabs = [...resourceEditorTabs];
    dispatch('activeEditorTabIndex', activeEditorTabIndex);
    dispatch('resourceEditorTabs', resourceEditorTabs);
  } else {
    activeEditorTabIndex = foundIndex;
    dispatch('activeEditorTabIndex', activeEditorTabIndex);
  }
  globalStore.set('resourceEditorTabs', resourceEditorTabs);
  globalStore.set('activeEditorTabIndex', activeEditorTabIndex);
};

export const resourceItemDragStart = (resourceKey) => (dispatch) => {
  const resourceEditorDraggedObject = projectObjectFactory.createResourceEditorDraggedObject(resourceKey);
  dispatch('draggedItem', resourceEditorDraggedObject);
};

export const resourceItemDragEnd = () => (dispatch) => {
  dispatch('draggedItem', null);
};

export const updateResourceByTab = ({resource, data}) => async (dispatch) => {
  const fileObject = projectFileFactory.createFileObjectWithNewData(resource, data);
  if (fileObject && fileObject.filePath && fileObject.fileData) {
    const oldFileObject = projectFileFactory.createFileObject(resource);
    if (oldFileObject && oldFileObject.filePath && oldFileObject.fileData) {
      const updateResourceHistory = projectResourcesManager.pushUpdateToResourceHistory(resource, oldFileObject);
      dispatch('updateResourceHistory', updateResourceHistory);
    }
    dispatch('fileObject', fileObject);
  }
};

export const undoUpdateResourceByTab = (resource) => async (dispatch) => {
  const fileObject = projectResourcesManager.popUpdateFromResourceHistory(resource);
  if (fileObject && fileObject.filePath && fileObject.fileData) {
    const updateResourceHistory = projectResourcesManager.getResourcesUpdateHistory();
    dispatch('updateResourceHistory', updateResourceHistory);
    dispatch('fileObject', fileObject);
  }
};

export const writeResourceSourceCode = ({resource, script}) => async (dispatch) => {
  const fileObject = projectFileFactory.createFileObjectWithNewSourceCode(resource, script);
  if (fileObject && fileObject.filePath && fileObject.fileData) {
    await projectManager.writeSourceFile(fileObject.filePath, fileObject.fileData);
    dispatch('success', 'Source code has been successfully saved');
  }
};

export const openUrlInExternalBrowser = (url) => (dispatch) => {
  projectManager.openUrlInExternalBrowser(url);
};

let publishData = null;

export const checkAuthForPublish = (data) => (dispatch) => {
  // save the resource for the further publishing
  if (data) {
    publishData = data;
  }
  // check the user is authenticated
  const token = auth.getToken();
  if (!token) {
    dispatch('isOpen', true);
  } else {
    dispatch('success', publishData);
  }
};

export const startPublish = (data) => async (dispatch) => {
  // clear middle saved data
  publishData = null;
  if (data) {
    const {resource, image} = data;
    if (resource.isComponent) {
      const fileResource = projectResourcesManager.getResourceByKey(resource.parentKey);
      if (fileResource && fileResource.isFile) {
        const dirResource = projectResourcesManager.getResourceByKey(fileResource.parentKey);
        const preparedData = await projectManager.prepareComponentPackage(
          fileResource.absolutePath,
          dirResource.displayName,
          image
        );
        dispatch('isOpenComponentDialog', true);
        dispatch('dataComponentDialog', preparedData);
      } else {
        throw Error('Component\'s file is not found.');
      }
    } else if (resource.isFunctions) {
      const fileResource = projectResourcesManager.getResourceByKey(resource.parentKey);
      if (fileResource && fileResource.isFile) {
        const dirResource = projectResourcesManager.getResourceByKey(fileResource.parentKey);
        const preparedData = await projectManager.prepareFunctionsPackage(
          fileResource.absolutePath,
          dirResource.displayName
        );
        dispatch('isOpenFunctionsDialog', true);
        dispatch('dataFunctionsDialog', preparedData);
      } else {
        throw Error('Functions\' file is not found.');
      }
    }
  }
};

export const submitPublish = (data) => async (dispatch) => {
  if (data) {
    dispatch('isLoading', true);
    try {
      await projectManager.makePackageFile(data);
      await projectManager.uploadPackage(data, auth.getToken());
      await projectManager.removeUploadDir();
      dispatch('isLoading', false);
      dispatch('isOpen', false);
      dispatch('success', 'Package has been successfully published.')
    } catch (error) {
      dispatch('error', error.message);
      dispatch('isLoading', false);
    }
  }
};

export const cancelPublish = () => async (dispatch) => {
  dispatch('isOpen', false);
  await projectManager.removeUploadDir();
};
