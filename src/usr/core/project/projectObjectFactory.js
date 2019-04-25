import lowerFirst from 'lodash/lowerFirst';
import * as projectResourcesManager from './projectResourcesManager';
import constants from '../../commons/constants';

export function createResourcesTreeViewObject() {
  // Obtain model trees from the graphs
  // UserFunctions tree starts from "usr" directory we may omit that key on the tree view
  const userFunctionsRoot = projectResourcesManager.getResourceByKey(constants.GRAPH_MODEL_USER_FUNCTIONS_ROOT_KEY);

  const userFunctions = {...userFunctionsRoot.model};
  const userFunctionsBranch = projectResourcesManager.getUserFunctionsTree(constants.GRAPH_MODEL_DIR_USR_KEY);
  if (userFunctionsBranch && userFunctionsBranch.children) {
    userFunctions.children = userFunctionsBranch.children;
  }
  // UserComponents tree starts from "usr" directory we may omit that key on the tree view
  const userComponentsRoot = projectResourcesManager.getResourceByKey(constants.GRAPH_MODEL_COMPONENTS_ROOT_KEY);
  const userComponents = {...userComponentsRoot.model};
  const userComponentsBranch = projectResourcesManager.getUserComponentsTree(constants.GRAPH_MODEL_DIR_USR_KEY);
  if (userComponentsBranch && userComponentsBranch.children) {
    userComponents.children = userComponentsBranch.children;
  }
  // Pages tree starts from "etc/pages" directory we may omit that key on the tree view
  const pagesRoot = projectResourcesManager.getResourceByKey(constants.GRAPH_MODEL_PAGES_ROOT_KEY);
  const pages = {...pagesRoot.model};
  const pagesBranch = projectResourcesManager.getPagesTree(constants.GRAPH_MODEL_DIR_ETC_PAGES_KEY);
  if (pagesBranch && pagesBranch.children) {
    pages.children = pagesBranch.children;
  }
  // Flows tree starts from "etc/flows" directory
  const flowsRoot = projectResourcesManager.getResourceByKey(constants.GRAPH_MODEL_FLOWS_ROOT_KEY);
  const flows = {...flowsRoot.model};
  const flowsBranch = projectResourcesManager.getFlowsTree(constants.GRAPH_MODEL_DIR_ETC_FLOWS_KEY);
  if (flowsBranch && flowsBranch.children) {
    flows.children = flowsBranch.children;
  }

  return {
    flows,
    pages,
    userComponents,
    userFunctions,
  }
}

export function createResourceEditorTabObject(resourceKey) {
  const resource = projectResourcesManager.getResourceByKey(resourceKey);
  if (resource && !resource.isEmpty) {
    if (resource.isComponent || resource.isPage || resource.isFlow || resource.isFunctions) {
      return resource;
    } else if (resource.isComponentInstance || resource.isFlowComponentInstance) {
      const componentResource = projectResourcesManager.getResourceByKey(resource.componentName);
      if (componentResource && componentResource.isComponent) {
        return componentResource;
      }
    } else if (resource.isFlowPage) {
      const pageResource = projectResourcesManager.getResourceByKey(resource.pagePath);
      if (pageResource && pageResource.isPage) {
        return pageResource;
      }
    } else if (resource.isUserFunction) {
      const functionsResource = projectResourcesManager.getResourceByKey(resource.parentKey);
      if (functionsResource && functionsResource.isFunctions) {
        return functionsResource;
      }
    } else if (resource.isFlowUserFunction) {
      const userFunctionResource = projectResourcesManager.getResourceByKey(resource.functionName);
      if (userFunctionResource && userFunctionResource.isUserFunction) {
        const functionsResource = projectResourcesManager.getResourceByKey(userFunctionResource.parentKey);
        if (functionsResource && functionsResource.isFunctions) {
          return functionsResource;
        }
      }
    }
  }
  return null;
}

export function getResourceSourceCode(resource) {
  let fileResource;
  if (resource) {
    if (resource.isComponent || resource.isFunctions) {
      fileResource = projectResourcesManager.getResourceByKey(resource.parentKey);
    }
  }
  if (fileResource && fileResource.isFile) {
    return projectResourcesManager.getSourceCode(fileResource);
  }
  return null;
}

export function createResourceEditorLivePreviewTabObject() {
  return {
    key: '__livePreview__',
    type: constants.RESOURCE_EDITOR_TAB_LIVE_PREVIEW_TYPE,
    title: 'Live Preview',
    pages: projectResourcesManager.getAllPagesList()
  };
}

export function createResourceEditorDraggedObject(resourceKey) {
  const resource = projectResourcesManager.getResourceByKey(resourceKey);

  // draggable object should be serializable in order to pass it by messaging
  const draggableObject = resource.model;
  // enrich component model with the new default component instance name
  if (resource.isComponent) {
    draggableObject.props.componentInstance = lowerFirst(resource.displayName);
  } else if (resource.isComponentInstance || resource.isFlowComponentInstance) {
    const componentResource = projectResourcesManager.getResourceByKey(resource.componentName);
    if (componentResource) {
      draggableObject.props.properties = componentResource.properties;
    }
  } else if (resource.isFlowUserFunction) {
    const userFunctionResource = projectResourcesManager.getResourceByKey(resource.functionName);
    if (userFunctionResource) {
      draggableObject.props.dispatches = userFunctionResource.dispatches;
    }
  }
  return draggableObject;
}
