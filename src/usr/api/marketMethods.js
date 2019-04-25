import * as projectManager from '../core/project/projectManager';
import * as marketBoardManager from '../core/market/boardManager';

// export const initMarketBoard = () => async (dispatch) => {
//   dispatch('isLoading', true);
//   dispatch('selectedProject', null);
//   dispatch('error', '');
//   try {
//     const searchTagsList = await marketBoardManager.getSearchTagsList();
//     const componentsList = await marketBoardManager.getTopComponents();
//     dispatch('searchTagsList', searchTagsList);
//     dispatch('componentsList', componentsList);
//   } catch(e) {
//     dispatch('error', e.message);
//   }
//   dispatch('isLoading', false);
// };

export const findComponents = ({searchText, searchLang}) => async (dispatch) => {
  dispatch('isLoading', true);
  dispatch('selectedProject', null);
  dispatch('error', '');
  try {
    let componentsList = [];
    searchText = searchText && searchText.length > 0 ? searchText.trim() : '';
    if (searchText) {
      componentsList = await marketBoardManager.findComponents(searchText, searchLang);
    } else {
      const searchTagsList = await marketBoardManager.getSearchTagsList();
      componentsList = await marketBoardManager.getTopComponents(searchLang);
      dispatch('searchTagsList', searchTagsList);
    }
    dispatch('componentsList', componentsList);
  } catch(e) {
    dispatch('error', e.message);
  }
  dispatch('isLoading', false);
};

export const openMarketBoard = () => dispatch => {
  dispatch('selectedProject', null);
};

export const selectProject = ({projectId, groupName, componentId}) => async dispatch => {
  dispatch('isLoading', true);
  dispatch('error', '');
  try {
    const projectData = await marketBoardManager.getProjectById(projectId);
    const selectedItemData = await marketBoardManager.selectProjectItem(projectData, groupName, componentId);
    dispatch('selectedProject', {projectData, selectedItemData});
  } catch(e) {
    dispatch('error', e.message);
  }
  dispatch('isLoading', false);
};

export const selectProjectItem = ({projectData, groupName, componentId}) => async dispatch => {
  dispatch('isLoading', true);
  dispatch('error', '');
  try {
    const newProjectData = {...projectData};
    const selectedItemData = await marketBoardManager.selectProjectItem(newProjectData, groupName, componentId);
    dispatch('selectedProject', {projectData: newProjectData, selectedItemData});
  } catch(e) {
    dispatch('error', e.message);
  }
  dispatch('isLoading', false);
};

export const startInstallPackage = (selectedItemData) => dispatch => {
  dispatch('isOpen', true);
  dispatch('error', '');
  dispatch('selectedItemData', selectedItemData);
};

export const submitInstallPackage = ({directoryName, selectedItemData}) => async (dispatch) => {
  dispatch('isLoading', true);
  dispatch('error', '');
  try {
    await projectManager.installSelected(selectedItemData, directoryName);
    dispatch('isOpen', false);
    dispatch('success', 'Package has been successfully installed');
  } catch(e) {
    dispatch('error', e.message);
  } finally {
    try {
      await projectManager.removeDownloadDir();
    } catch (e) {
      console.error(e);
    }
    dispatch('isLoading', false);
  }
};