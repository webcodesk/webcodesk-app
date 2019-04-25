import { selectDirectoryDialog } from '../core/utils/electronUtils';
import {checkDirIsEmpty, repairPath} from '../core/utils/fileUtils';
import * as exportManager from '../core/export/exportManager';
import * as projectResourcesManager from '../core/project/projectResourcesManager';

export const startExportApp = (helpers) => (dispatch) => {
  dispatch('exportAppHelpers', helpers);
  dispatch('isOpen', true);
};

export const browseDirectory = () => async (dispatch) => {
  selectDirectoryDialog(async (selectedFiles) => {
    if (selectedFiles && selectedFiles.length > 0) {
      const validDirPath = repairPath(selectedFiles[0]);
      try {
        await checkDirIsEmpty(validDirPath);
        dispatch('directoryData', { directoryPath: validDirPath });
      } catch (e) {
        dispatch('directoryData', {
          directoryPath: validDirPath,
          warning: 'Caution: selected directory is not empty, "src", "public", "package.json", ' +
            'and some other directories or files will be rewritten.'
        });
      }
    }
  });
};

export const closeDialog = () => (dispatch) => {
  setTimeout(() => {
    dispatch('isOpen', false);
  }, 300);
};

export const exportApp = ({directoryName, helpers}) => async (dispatch) => {
  dispatch('isOpen', true);
  dispatch('exportStatus', {exportIsRunning: true, text: 'Analysing structure...'});
  try {
    const existing = await exportManager.checkFilesAndDirs(directoryName);
    dispatch('exportStatus', {exportIsRunning: true, text: 'Copying files...'});
    await exportManager.rewriteFilesAndDirs(directoryName, helpers, existing);
    dispatch('exportStatus', {exportIsRunning: true, text: 'Generating app files...'});
    const pagesTree = projectResourcesManager.getPagesTree();
    await exportManager.generateApp(directoryName, {...helpers, ...{pagesTree}});
    dispatch('exportStatus',
      {
        exportIsRunning: false,
        text: `Project has been exported successfully. Check the directory ${directoryName}`
      }
    );
  } catch (error) {
    dispatch('exportStatus', {exportIsRunning: false, text: `Export failed. ${error.message}`});
  }
};
