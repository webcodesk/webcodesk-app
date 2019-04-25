import cloneDeep from 'lodash/cloneDeep';
import sortBy from 'lodash/sortBy';
import constants from '../../commons/constants';
import { getParticleName } from '../utils/textUtils';

export function createFunctionsModels (modelKey, declarationsInFile, displayName) {
  const result = [];
  const functionsKey = `${modelKey}_functions`;
  const functionsModel = {
    key: functionsKey,
    type: constants.GRAPH_MODEL_FUNCTIONS_TYPE,
    props: {
      resourceType: declarationsInFile.resourceType,
      displayName,
      functionsDescriptions: [],
    },
    children: [],
  };
  declarationsInFile.declarations.forEach(functionDeclaration => {
    const { functionName, parameters, dispatches, comments } = functionDeclaration;
    const canonicalFunctionName = `${modelKey}${constants.MODEL_KEY_SEPARATOR}${functionName}`;
    let sortedDispatches = [];
    if (dispatches && dispatches.length > 0) {
      sortedDispatches = dispatches.sort((a, b) => a.name.localeCompare(b.name));
    }
    sortedDispatches.push({
      name: 'caughtException',
      comments: [
        'A dispatch is added automatically to each function. ' +
        'The dispatch is triggered with the error object ' +
        'when the function does not catch error thrown during the function execution.'
      ]
    });
    functionsModel.props.functionsDescriptions.push({
      displayName: functionName,
      comments,
    });
    functionsModel.children.push({
      key: canonicalFunctionName,
      type: constants.GRAPH_MODEL_USER_FUNCTION_TYPE,
      props: {
        resourceType: declarationsInFile.resourceType,
        name: functionName,
        displayName: functionName,
        functionName: canonicalFunctionName,
        dispatches: sortedDispatches,
        parameters,
        comments
      }
    });
  });
  functionsModel.props.functionsDescriptions =
    sortBy(functionsModel.props.functionsDescriptions, ['displayName']);
  result.push(functionsModel);
  return result;
}

export function createComponentsModels (modelKey, declarationsInFile) {
  const result = [];
  declarationsInFile.declarations.forEach(componentDeclaration => {
    const { componentName, properties, comments } = componentDeclaration;
    // const canonicalComponentName = `${modelKey}${constants.MODEL_KEY_SEPARATOR}${componentName}`;
    const canonicalComponentName = modelKey;
    let sortedProperties = [];
    if (properties && properties.length > 0) {
      sortedProperties = properties.sort((a, b) => a.name.localeCompare(b.name));
    }
    result.push({
      key: canonicalComponentName,
      type: constants.GRAPH_MODEL_COMPONENT_TYPE,
      props: {
        resourceType: declarationsInFile.resourceType,
        name: componentName,
        displayName: componentName,
        componentName: canonicalComponentName,
        properties: sortedProperties,
        comments
      }
    });
  });
  return result;
}

export function createComponentStoriesModels (modelKey, declarationsInFile) {
  const canonicalComponentName = `${modelKey}${constants.MODEL_KEY_SEPARATOR}stories`;
  return [{
    key: canonicalComponentName,
    type: constants.GRAPH_MODEL_COMPONENT_STORIES_TYPE,
    props: {
      resourceType: declarationsInFile.resourceType,
      name: 'stories',
      displayName: 'stories',
      componentStoriesName: canonicalComponentName,
      stories: cloneDeep(declarationsInFile.declarations),
    }
  }];
}

export function createPageModels(modelKey, declarationsInFile) {
  const result = [];
  declarationsInFile.declarations.forEach(pageDeclaration => {
    const { pageName, pagePath, componentsTree, metaData, componentInstances } = pageDeclaration;
    const pageModel = {
      key: pagePath, // set page path as a key in order to find the resource from any place
      type: constants.GRAPH_MODEL_PAGE_TYPE,
      props: {
        displayName: pageName,
        pageName,
        pagePath,
        resourceType: declarationsInFile.resourceType,
        componentsTree: cloneDeep(componentsTree),
        metaData: cloneDeep(metaData),
      },
      children: [],
    };
    let componentInstanceModel;
    if (componentInstances && componentInstances.length > 0) {
      componentInstances.forEach(componentInstanceItem => {
        const { componentName, componentInstance } = componentInstanceItem;
        componentInstanceModel = {
          key: `${modelKey}${constants.MODEL_KEY_SEPARATOR}${componentInstance}`,
          type: constants.GRAPH_MODEL_COMPONENT_INSTANCE_TYPE,
          props: {
            resourceType: declarationsInFile.resourceType,
            name: componentInstance,
            displayName: componentInstance,
            componentName: componentName,
            componentInstance: componentInstance,
            pageName,
            pagePath,
          }
        };
        pageModel.children.push(componentInstanceModel);
      });
    }
    result.push(pageModel);
  });
  return result;
}

export function createFlowModels(modelKey, declarationsInFile) {
  const result = [];
  declarationsInFile.declarations.forEach(declaration => {
    const { flowName, model, isDisabled, flowParticles } = declaration;
    const flowModel = {
      key: modelKey,
      type: constants.GRAPH_MODEL_FLOW_TYPE,
      props: {
        resourceType: declarationsInFile.resourceType,
        flowName: flowName,
        isDisabled,
        displayName: flowName,
        flowTree: cloneDeep(model),
      },
      children: [],
    };
    if (flowParticles && flowParticles.length > 0) {
      let particleModel;
      let particleDisplayName;
      flowParticles.forEach(flowParticle => {
        const { functionName, componentName, componentInstance, pagePath, pageName } = flowParticle;
        if (functionName) {
          particleDisplayName = getParticleName(functionName);
          particleModel = {
            key: `${modelKey}${constants.MODEL_KEY_SEPARATOR}${particleDisplayName}`,
            type: constants.GRAPH_MODEL_FLOW_USER_FUNCTION_TYPE,
            props: {
              resourceType: declarationsInFile.resourceType,
              name: functionName,
              displayName: particleDisplayName,
              functionName: functionName,
            }
          };
          flowModel.children.push(particleModel);
        } else if (componentName && componentInstance) {
          particleModel = {
            key: `${modelKey}${constants.MODEL_KEY_SEPARATOR}${componentInstance}`,
            type: constants.GRAPH_MODEL_FLOW_COMPONENT_INSTANCE_TYPE,
            props: {
              resourceType: declarationsInFile.resourceType,
              name: componentInstance,
              displayName: componentInstance,
              componentName: componentName,
              componentInstance: componentInstance,
            }
          };
          flowModel.children.push(particleModel);
        } else if (pagePath) {
          particleModel = {
            key: `${modelKey}${constants.MODEL_KEY_SEPARATOR}${pagePath}`,
            type: constants.GRAPH_MODEL_FLOW_PAGE_TYPE,
            props: {
              resourceType: declarationsInFile.resourceType,
              displayName: pageName,
              pageName,
              pagePath,
            }
          };
          flowModel.children.push(particleModel);
        }
      });
    }
    result.push(flowModel);
  });
  return result;
}