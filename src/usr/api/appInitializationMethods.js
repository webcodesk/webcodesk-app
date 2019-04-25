import * as storage from '../core/config/storage';

let electron;
if (window.require) {
  electron = window.require('electron');
}

export const initApplication = () => (dispatch) => {
  if (electron) {
    electron.ipcRenderer.on('mainWindowMessage', (event, message) => {
      if (message) {
        const {type: messageType, payload: messageData} = message;
        dispatch('mainWindowMessage', {messageType, messageData});
      }
    });
  } else {
    console.error('IPC Controller works only in electron environment');
  }
};

export const readRecentProjects = () => async (dispatch) => {
  const recentProjects = await storage.getRecentProjects();
  dispatch('recentProjects', recentProjects);
  if (recentProjects && recentProjects.length > 0) {
    dispatch('theLastProject', recentProjects[0]);
  }
  dispatch('success');
};

export const removeRecentProject = (dirPath) => async (dispatch) => {
  const recentProjects = await storage.removeRecentProject(dirPath);
  dispatch('recentProjects', recentProjects);
};

export const showErrorNotification = (error) => (dispatch) => {
  const message = error && error.message;
  if (message && message.length > 0) {
    dispatch('notification', {message, options: {variant: 'error', autoHideDuration: 5000}})
  }
};

export const showMultipleErrorsNotification = (errors) => (dispatch) => {
  if (errors && errors.length > 0) {
    errors.forEach(error => {
      const message = error && error.message;
      if (message && message.length > 0) {
        dispatch('notification', {message, options: {variant: 'error', autoHideDuration: 5000}})
      }
    });
  }
};

export const showSuccessNotification = (message) => (dispatch) => {
  if (message && message.length > 0) {
    dispatch('notification', {message, options: {variant: 'success', autoHideDuration: 4000}})
  }
};

export const showInformationNotification = (message) => (dispatch) => {
  if (message && message.length > 0) {
    dispatch('notification', {message, options: {variant: 'info', autoHideDuration: 4000}})
  }
};
