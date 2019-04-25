import constants from '../../commons/constants';
import * as textUtils from '../utils/textUtils';

export function createDefaultFlowModel() {
  return {
    type: constants.FLOW_APPLICATION_STARTER_TYPE,
    props: {
      title: 'Application',
      searchName: 'Application',
      outputs: [
        {
          name: 'onApplicationStart'
        }
      ],
    },
  };
}

export function createFlowModelForComponent(componentModel, inBasket) {
  const { props: {componentName, componentInstance, properties} } = componentModel;
  let title = textUtils.cutText(componentInstance, 25);
  // let subtitle = componentName;
  // if (subtitle) {
  //   const nameParts = componentName.split(constants.MODEL_KEY_SEPARATOR);
  //   subtitle = textUtils.cutText(nameParts[nameParts.length - 1]);
  // }
  const flowModel = {
    type: constants.FLOW_COMPONENT_INSTANCE_TYPE,
    props: {
      componentName,
      componentInstance,
      title,
      searchName: componentInstance,
      subtitle: '',
      inputs: [],
      outputs: [],
    }
  };
  if (inBasket) {
    flowModel.type = constants.FLOW_COMPONENT_INSTANCE_IN_BASKET_TYPE;
    flowModel.props.position = inBasket.position;
  }
  if (properties && properties.length > 0) {
    properties.forEach(property => {
      if (property.type === constants.GRAPH_MODEL_COMPONENT_PROPERTY_FUNCTION_TYPE) {
        flowModel.props.outputs.push({
          name: property.name,
        });
      } else if (property.type === constants.GRAPH_MODEL_COMPONENT_PROPERTY_OBJECT_TYPE) {
        flowModel.props.inputs.push({
          name: property.name,
        });
      }
    });
  }
  return flowModel;
}

export function createFlowModelForFunction(functionModel, inBasket) {
  const { props: { functionName, dispatches } } = functionModel;
  let title;
  let searchName;
  const nameParts = functionName ? functionName.split(constants.MODEL_KEY_SEPARATOR) : [];
  if (nameParts.length > 1) {
    title = textUtils.cutText(nameParts[nameParts.length - 1], 25);
    searchName = nameParts[nameParts.length - 1];
  } else {
    title = textUtils.cutText(functionName, 25);
    searchName = functionName;
  }
  const flowModel = {
    type: constants.FLOW_USER_FUNCTION_TYPE,
    props: {
      functionName,
      title,
      subtitle: '',
      searchName,
      inputs: [
        {
          name: 'callFunction'
        }
      ],
      outputs: [],
    }
  };
  if (inBasket) {
    flowModel.type = constants.FLOW_USER_FUNCTION_IN_BASKET_TYPE;
    flowModel.props.position = inBasket.position;
  }
  if (dispatches && dispatches.length > 0) {
    dispatches.forEach(dispatch => {
      flowModel.props.outputs.push({
        name: dispatch.name,
      });
    });
  }
  return flowModel;
}

export function createFlowModelForPage(pageModel, inBasket) {
  const { props: {pageName, pagePath} } = pageModel;
  let searchName;
  let title = textUtils.cutPagePath(pagePath, 20, 2);
  const pagePathParts = pagePath ? pagePath.split(constants.FILE_SEPARATOR) : [];
  if (pagePathParts.length > 1) {
    searchName = pagePathParts[pagePathParts.length - 1];
  } else {
    searchName = pagePath;
  }
  const flowModel = {
    type: constants.FLOW_PAGE_TYPE,
    props: {
      pageName: pageName,
      pagePath,
      title,
      subtitle: '',
      searchName,
      inputs: [
        {
          name: 'forward'
        }
      ],
      outputs: [
        {
          name: 'queryParams'
        }
      ],
    }
  };
  if (inBasket) {
    flowModel.type = constants.FLOW_PAGE_IN_BASKET_TYPE;
    flowModel.props.position = inBasket.position;
  }
  return flowModel;
}
