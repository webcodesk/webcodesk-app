import { SequentialTaskQueue } from 'sequential-task-queue';
import * as projectManager from '../core/project/projectManager';
import * as projectResourcesManager from '../core/project/projectResourcesManager';
import appWindowMessages from '../commons/appWindowMessages';

// Use sequential queue for accessing graph instance while multiple resources added in parallel
const taskQueue = new SequentialTaskQueue();

export const processMainWindowMessage = ({ messageType, messageData }) => async (dispatch) => {
  if (messageType === appWindowMessages.WATCHER_FILE_WAS_ADDED) {
    const { path } = messageData;
    dispatch('resourceAdded', path);
  } else if (messageType === appWindowMessages.WATCHER_FILE_WAS_CHANGED) {
    const { path } = messageData;
    dispatch('resourceChanged', path);
  } else if (messageType === appWindowMessages.WATCHER_FILE_WAS_REMOVED) {
    const { path } = messageData;
    dispatch('resourceRemoved', path);
  } else if (messageType === appWindowMessages.ROUTER_GO_TO_HOME) {
    dispatch('forwardHome');
  } else if (messageType === appWindowMessages.SHOW_SYSLOG_DIALOG) {
    dispatch('showSyslog');
  } else if (messageType === appWindowMessages.SHOW_SIGN_IN_DIALOG) {
    dispatch('showSignIn');
  } else if (messageType === appWindowMessages.SHOW_SIGN_OUT_DIALOG) {
    dispatch('showSignOut');
  } else if (messageType === appWindowMessages.PROJECT_SERVER_STATUS_RESPONSE) {
    dispatch('projectServerStatus', messageData);
  } else if (messageType === appWindowMessages.PROJECT_SERVER_LOG_RESPONSE) {
    dispatch('projectServerLog', messageData);
  } else if (messageType === appWindowMessages.CONTEXT_MENU_CREATE_NEW_PAGE) {
    const { virtualPath } = messageData;
    dispatch('createNewPage', {virtualPath});
  } else if (messageType === appWindowMessages.CONTEXT_MENU_COPY_PAGE) {
    const { resourceModel, virtualPath } = messageData;
    dispatch('copyPage', {
      resource: projectResourcesManager.getResourceByKey(resourceModel.key),
      virtualPath,
    });
  } else if (messageType === appWindowMessages.CONTEXT_MENU_EDIT_PAGE) {
    // const { resourceModel, virtualPath } = messageData;
    // dispatch('editPage', projectResourcesManager.getResourceByKey(resourceModel.key));
  } else if (messageType === appWindowMessages.CONTEXT_MENU_REMOVE_PAGE) {
    const { resourceModel } = messageData;
    dispatch('removePage', projectResourcesManager.getResourceByKey(resourceModel.key));
  } else if (messageType === appWindowMessages.CONTEXT_MENU_CREATE_NEW_FLOW) {
    const { virtualPath } = messageData;
    dispatch('createNewFlow', {virtualPath});
  } else if (messageType === appWindowMessages.CONTEXT_MENU_COPY_FLOW) {
    const { resourceModel, virtualPath } = messageData;
    dispatch('copyFlow', {
      resource: projectResourcesManager.getResourceByKey(resourceModel.key),
      virtualPath,
    });
  } else if (messageType === appWindowMessages.CONTEXT_MENU_DISABLE_FLOW) {
    const { resourceModel } = messageData;
    dispatch('toggleFlow', { resource: projectResourcesManager.getResourceByKey(resourceModel.key), isDisabled: true});
  } else if (messageType === appWindowMessages.CONTEXT_MENU_ENABLE_FLOW) {
    const { resourceModel } = messageData;
    dispatch('toggleFlow', { resource: projectResourcesManager.getResourceByKey(resourceModel.key), isDisabled: false});
  } else if (messageType === appWindowMessages.CONTEXT_MENU_EDIT_FLOW) {
    // const { resourceModel } = messageData;
    // dispatch('editFlow', projectResourcesManager.getResourceByKey(resourceModel.key));
  } else if (messageType === appWindowMessages.CONTEXT_MENU_REMOVE_FLOW) {
    const { resourceModel } = messageData;
    dispatch('removeFlow', projectResourcesManager.getResourceByKey(resourceModel.key));
  } else if (messageType === appWindowMessages.CONTEXT_MENU_CREATE_NEW_COMPONENT) {
    const { virtualPath } = messageData;
    dispatch('createNewComponent', {virtualPath});
  } else if (messageType === appWindowMessages.CONTEXT_MENU_CREATE_NEW_USER_FUNCTION) {
    const { virtualPath } = messageData;
    dispatch('createNewFunction', {virtualPath});
  }
};

export const readResource = (resourcePath) => (dispatch) => {
  taskQueue.push(async () => {
    try {
      const update = await projectManager.readResource(resourcePath);
      if (update.updatedResources && update.updatedResources.length > 0) {
        dispatch('success');
      }
      if (update.doUpdateAll) {
        dispatch('changedByCompilation');
      }
    } catch (e) {
      // do nothing
    }
  });
};

export const removeResource = (resourcePath) => async (dispatch) => {
  taskQueue.push(async () => {
    const update = await projectManager.removeResource(resourcePath);
    dispatch('success');
    if (update.doUpdateAll) {
      dispatch('changedByCompilation');
    }
  });
};

export const updateResource = (fileObject) => async (dispatch) => {
  taskQueue.push(async () => {
    try {
      const update = await projectManager.updateResource(fileObject.filePath, fileObject.fileData);
      if (update.updatedResources && update.updatedResources.length > 0) {
        dispatch('success');
      }
      if (update.doUpdateAll) {
        dispatch('changedByCompilation');
      }
    } catch (e) {
      console.error('Resource check is failed....', e.message);
    }
  });
};

export const writeEtcFile = ({filePath, fileData}) => async (dispatch) => {
  taskQueue.push(async () => {
    try {
      await projectManager.writeEtcFile(filePath, fileData);
      dispatch('success', {filePath, fileData});
    } catch (e) {
      console.error(`Writing etc file ${filePath}.`, e.message);
      dispatch('exception', e);
    }
  });
};

export const deleteEtcFile = (filePath) => async (dispatch) => {
  taskQueue.push(async () => {
    try {
      await projectManager.deleteEtcFile(filePath);
      dispatch('success', filePath);
    } catch (e) {
      console.error(`Deleting etc file ${filePath}.`, e.message);
      dispatch('exception', e);
    }
  });
};

export const getSyslog = () => async (dispatch) => {
  const sysLog = await projectManager.getSyslog();
  dispatch('sysLog', sysLog);
  dispatch('isOpen', true);
};
