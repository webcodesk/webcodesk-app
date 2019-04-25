import { selectDirectoryDialog } from '../core/utils/electronUtils';
import * as projectInstaller from '../core/project/projectInstaller';
import {repairPath} from "../core/utils/fileUtils";

export const browseDirectory = () => (dispatch) => {
  selectDirectoryDialog(async (selectedFiles) => {
    if (selectedFiles && selectedFiles.length > 0) {
      const validDirPath = repairPath(selectedFiles[0]);
      dispatch('directoryData', { directoryPath: validDirPath });
    }
  });
};

export const createNewProjectSubmit = ({name, directoryPath, projectType}) => async (dispatch) => {
  try {
    dispatch('creatingError', null);
    await projectInstaller.createNewProject(
      {destDirPath: directoryPath, projectName: name, projectType},
      (feedback) => {
        if (feedback) {
          const { code } = feedback;
          if (code === 'log') {
            dispatch('installerFeedback', feedback);
          } else if (code === '0') {
            dispatch('newProjectDirData', { selectedDirPath: feedback.newProjectDirPath });
          } else {
            dispatch('installerFeedback', feedback);
            dispatch('creatingError', 'Error creating new project');
          }
        }
      }
    )
  } catch(err) {
    dispatch('creatingError', err.message);
  }
};
