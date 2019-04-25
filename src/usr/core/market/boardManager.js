import forOwn from 'lodash/forOwn';
import orderBy from 'lodash/orderBy';
import * as restClient from '../utils/restClient';
import * as constants from '../../commons/constants';

export async function getTopComponents(searchLang) {
  let topComponentsList = await restClient.get(`/public/components/top?lang=${searchLang}`);
  topComponentsList = orderBy(topComponentsList, ['downloadCount'], ['desc']);
  return topComponentsList;
}

export async function findComponents(searchText, searchLang) {
  let componentsList = await restClient.get(`/public/components/find?searchText=${searchText}&lang=${searchLang}`);
  componentsList = orderBy(componentsList, ['downloadCount'], ['desc']);
  return componentsList;
}

export async function getSearchTagsList() {
  let searchTagsList = await restClient.get('/public/components/tags');
  searchTagsList = orderBy(searchTagsList, ['value'], ['asc']);
  return searchTagsList;
}

export async function getProjectById(projectId) {
  let marketProjectViewData = {};
  const projectData = await restClient.get(`/public/project?projectId=${projectId}`);
  // const projectData = preloadProject;
  if (projectData) {
    const {marketProject, marketComponents, userAccount} = projectData;
    marketProjectViewData = {
      projectId: marketProject.id,
      name: marketProject.name,
      license: marketProject.license,
      repoUrl: marketProject.repoUrl,
      demoUrl: marketProject.demoUrl,
      owner: {
        userId: userAccount.id,
        firstName: userAccount.firsName,
        lastName: userAccount.lastName,
      },
      groups: {}
    };
    if (marketComponents && marketComponents.length > 0) {
      let foundGroup;
      marketComponents.forEach(marketComponentItem => {
        foundGroup = marketProjectViewData.groups[marketComponentItem.group];
        if (foundGroup) {
          foundGroup.components.push({
            ...marketComponentItem,
            license: marketProject.license,
            repoUrl: marketProject.repoUrl,
            demoUrl: marketProject.demoUrl,
          });
        } else {
          foundGroup = {
            name: marketComponentItem.group,
            projectId: marketComponentItem.projectId,
            components: [
              {
                ...marketComponentItem,
                license: marketProject.license,
                repoUrl: marketProject.repoUrl,
                demoUrl: marketProject.demoUrl,
              }
            ]
          };
          marketProjectViewData.groups[marketComponentItem.group] = foundGroup;
        }
      });
    }
  }
  return marketProjectViewData;
}

export async function selectProjectItem(marketProject, group = undefined, componentId = undefined) {
  let foundProject = marketProject;
  let foundGroup;
  let foundComponent;
  let components = [];
  let readmeText;
  if (group) {
    foundGroup = foundProject.groups[group];
    if (foundGroup) {
      if (componentId) {
        components = components.concat(foundGroup.components.filter(i => i.id === componentId));
        if (components.length > 0) {
          foundComponent = components[0];
          try {
            readmeText = await restClient.get(
              `/storage/${foundProject.owner.userId}/${foundProject.name}/${foundGroup.name}/${constants.FILE_NAME_README}`
            );
          } catch (e) {
            readmeText = 'No README.md found';
          }
        }
      } else {
        components = components.concat(foundGroup.components);
      }
    }
  } else {
    forOwn(foundProject.groups, (groupItem) => {
      components = components.concat(groupItem.components);
    });
  }
  const result = {
    components,
    userId: foundProject.owner.userId,
    projectId: foundProject.projectId,
    projectName: foundProject.name,
  };
  if (foundGroup) {
    result.groupName = foundGroup.name;
    if (foundComponent) {
      result.componentId = foundComponent.id;
      result.componentName = foundComponent.name;
      result.componentType = foundComponent.type;
      result.readmeText = readmeText;
    }
  }
  return result;
}