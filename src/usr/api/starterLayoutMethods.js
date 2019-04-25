import globalStore from '../globalStore';
import { selectDirectoryDialog } from '../core/utils/electronUtils';
import * as projectManager from '../core/project/projectManager';
import * as storage from '../core/config/storage';
import * as auth from "../core/config/auth";
import * as restClient from "../core/utils/restClient";
import * as constants from '../commons/constants';

export const selectDirPathInDialog = () => async (dispatch) => {
  // Open native file dialog
  selectDirectoryDialog(async (selectedFiles) => {
    if (selectedFiles && selectedFiles.length > 0) {
      try {
        await projectManager.testProjectConfiguration(selectedFiles[0]);
        dispatch('selectedDirData', { selectedDirPath: selectedFiles[0] });
      } catch (e) {
        dispatch('error', {message: e.message});
      }
    }
  });
};

export const testError = (error) => dispatch => {
  if (error && error.message) {
    dispatch('success', error);
  }
};

export const openExistingProject = (dirPath) => async (dispatch) => {
  globalStore.clear();
  await projectManager.initProjectConfiguration(dirPath);
  // dispatch('infoMessage', 'Reading source files. Please wait...');
  await projectManager.watchUsrSourceDir();
  await storage.addProjectToRecentProjects(dirPath);
  projectManager.startProjectServer();
  dispatch('success');
  // dispatch('successMessage', 'Project initialised successfully');
};

export const closeExistingProject = () => dispatch => {
  globalStore.clear();
  dispatch('activeEditorTabIndex', -1);
  dispatch('resourceEditorTabs', []);
  dispatch('selectedResourceKey', null);
  dispatch('selectedResource', null);
  dispatch('selectedVirtualPath', '');
  projectManager.stopWatchUsrSourceDir();
  dispatch('success');
  projectManager.stopProjectServer();
};

export const getInfo = () => async dispatch => {
  await auth.init();
  try {
    const applicationInfo = await restClient.get('/public/application-info');
    dispatch('applicationInfo', applicationInfo);
  } catch (e) {
    // do nothing;
  }
  // const welcomeInfo = await storage.getWelcomeInfo();
  // dispatch('showWelcomeDialog', welcomeInfo ? welcomeInfo.showWelcomeDialog : true);
};

export const showTutorial = (doNotShowAgain) => async (dispatch) => {
  projectManager.openUrlInExternalBrowser(constants.URL_WEBCODESK_TUTORIAL);
  if (doNotShowAgain) {
    await storage.saveWelcomeInfo({showWelcomeDialog: !doNotShowAgain});
  }
  dispatch('showWelcomeDialog', false);
};

export const closeWelcome = (doNotShowAgain) => async (dispatch) => {
  if (doNotShowAgain) {
    await storage.saveWelcomeInfo({showWelcomeDialog: !doNotShowAgain});
  }
  dispatch('showWelcomeDialog', false);
};
