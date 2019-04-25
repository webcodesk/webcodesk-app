import mergeWith from 'lodash/mergeWith';
import isArray from 'lodash/isArray';
import * as projectResourcesUtils from './projectResourcesUtils';
import constants from '../../commons/constants';
import PageModelCompiler from './compiler/PageModelCompiler';
import FlowModelCompiler from './compiler/FlowModelCompiler';
import PageComposerManager from '../pageComposer/PageComposerManager';

const componentModelsMap = new Map();
const userFunctionModelsMap = new Map();
const pageModelsMap = new Map();
const componentInstanceModelsMap = new Map();

function instanceGroupsMerge(objValue, srcValue) {
  if (isArray(objValue)) {
    return objValue.concat(srcValue);
  }
}

function flowsResourceVisitor ({ nodeModel, parentModel }) {
  const result = [];
  if (nodeModel && nodeModel.type === constants.GRAPH_MODEL_FLOW_TYPE) {
    result.push(nodeModel);
  }
  return result;
}

function pagesResourceVisitor ({ nodeModel, parentModel }) {
  const result = [];
  if (nodeModel && nodeModel.type === constants.GRAPH_MODEL_PAGE_TYPE) {
    result.push(nodeModel);
  }
  return result;
}

function componentInstancesResourceVisitor ({ nodeModel, parentModel }) {
  const result = [];
  if (nodeModel && nodeModel.type === constants.GRAPH_MODEL_COMPONENT_INSTANCE_TYPE) {
    result.push(nodeModel);
  }
  return result;
}

function componentsResourceVisitor ({ nodeModel, parentModel }) {
  const result = [];
  if (nodeModel && nodeModel.type === constants.GRAPH_MODEL_COMPONENT_TYPE) {
    result.push(nodeModel);
  }
  return result;
}

function userFunctionsResourceVisitor ({ nodeModel, parentModel }) {
  const result = [];
  if (nodeModel && nodeModel.type === constants.GRAPH_MODEL_USER_FUNCTION_TYPE) {
    result.push(nodeModel);
  }
  return result;
}

export function compileResources () {
  let flowModels;

  const flowsGraphModel =
    projectResourcesUtils.getGraphByResourceType(constants.RESOURCE_IN_FLOWS_TYPE);
  if (flowsGraphModel) {
    flowModels = flowsGraphModel.traverse(flowsResourceVisitor);
  }

  componentModelsMap.clear();
  const componentsGraphModel =
    projectResourcesUtils.getGraphByResourceType(constants.RESOURCE_IN_COMPONENTS_TYPE);
  if (componentsGraphModel) {
    const componentModels = componentsGraphModel.traverse(componentsResourceVisitor);
    if (componentModels && componentModels.length > 0) {
      componentModels.forEach(componentModel => {
        if (componentModel.props) {
          const { props: { componentName } } = componentModel;
          componentModelsMap.set(componentName, componentModel);
        }
      });
    }
  }

  userFunctionModelsMap.clear();
  const userFunctionsGraphModel =
    projectResourcesUtils.getGraphByResourceType(constants.RESOURCE_IN_USER_FUNCTIONS_TYPE);
  if (userFunctionsGraphModel) {
    const userFunctionModels = userFunctionsGraphModel.traverse(userFunctionsResourceVisitor);
    if (userFunctionModels && userFunctionModels.length > 0) {
      userFunctionModels.forEach(userFunctionModel => {
        if (userFunctionModel.props) {
          const { props: { functionName } } = userFunctionModel;
          userFunctionModelsMap.set(functionName, userFunctionModel);
        }
      });
    }
  }

  let changesCounter = 0;

  pageModelsMap.clear();
  componentInstanceModelsMap.clear();
  const pagesGraphModel = projectResourcesUtils.getGraphByResourceType(constants.RESOURCE_IN_PAGES_TYPE);
  if (pagesGraphModel) {

    const componentInstanceModels = pagesGraphModel.traverse(componentInstancesResourceVisitor);
    if (componentInstanceModels && componentInstanceModels.length > 0) {
      componentInstanceModels.forEach(componentInstanceModel => {
        if (componentInstanceModel.props) {
          const { props: { componentName, componentInstance } } = componentInstanceModel;
          componentInstanceModelsMap.set(`${componentName}_${componentInstance}`, componentInstanceModel);
        }
      });
    }

    let pageErrorsCount = 0;
    const pageModels = pagesGraphModel.traverse(pagesResourceVisitor);
    if (pageModels && pageModels.length > 0) {

      let componentInstanceGroupsMap = {};
      pageModels.forEach(pageModel => {
        componentInstanceGroupsMap = mergeWith(
          componentInstanceGroupsMap,
          new PageComposerManager(pageModel.props.componentsTree).getInstancesListGrouped(),
          instanceGroupsMerge
        );
      });

      const pageModelCompiler = new PageModelCompiler({
        componentModelsMap, componentInstanceGroupsMap,
      });

      pageModels.forEach(pageModel => {
        if (pageModel.props) {
          const { props: { pagePath } } = pageModel;
          pageModelsMap.set(pagePath, pageModel);
        }
        const { changesCount, errorsCount } = pageModelCompiler.compile(pageModel.props.componentsTree);
        changesCounter += changesCount;
        pageErrorsCount += errorsCount;
        if (errorsCount > 0 || changesCount > 0) {
          pagesGraphModel.mergeNode(pageModel.key, { props: { hasErrors: errorsCount > 0 } });
          const parentKeys = pagesGraphModel.getAllParentKeys(pageModel.key);
          if (parentKeys && parentKeys.length > 0) {
            parentKeys.forEach(parentKey => {
              pagesGraphModel.mergeNode(parentKey, { props: { hasErrors: errorsCount > 0 } });
            });
          }
        }
      });
    }
    pagesGraphModel.mergeNode(pagesGraphModel.getRootKey(), { props: { hasErrors: pageErrorsCount > 0 } });

  }

  let flowErrorsCount = 0;
  if (flowModels && flowModels.length > 0) {
    // let flowGraphModel;
    const flowModelCompiler = new FlowModelCompiler({
      componentModelsMap,
      componentInstanceModelsMap,
      userFunctionModelsMap,
      pageModelsMap
    });
    flowModels.forEach(flowModel => {
      if (flowModel.props) {
        const { changesCount, errorsCount } = flowModelCompiler.compile(flowModel.props.flowTree);
        changesCounter += changesCount;
        flowErrorsCount += errorsCount;
        if (errorsCount > 0 || changesCount > 0) {
          flowsGraphModel.mergeNode(flowModel.key, { props: { hasErrors: errorsCount > 0 } });
          const parentKeys = flowsGraphModel.getAllParentKeys(flowModel.key);
          if (parentKeys && parentKeys.length > 0) {
            parentKeys.forEach(parentKey => {
              flowsGraphModel.mergeNode(parentKey, { props: { hasErrors: errorsCount > 0 } });
            });
          }
        }
      }
    });
  }
  // set the root key status with errors
  flowsGraphModel.mergeNode(flowsGraphModel.getRootKey(), { props: { hasErrors: flowErrorsCount > 0 } });

  componentModelsMap.clear();
  userFunctionModelsMap.clear();
  pageModelsMap.clear();
  componentInstanceModelsMap.clear();

  return changesCounter > 0;
}