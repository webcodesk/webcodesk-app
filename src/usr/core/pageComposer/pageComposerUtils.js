import * as constants from '../../commons/constants';

export function createDefaultModel() {
  const result = {
    type: constants.PAGE_PLACEHOLDER_TYPE,
    props: {
      componentName: '__PlaceHolder'
    },
    children: [],
  };
  return result;
}

export function createPageComponentModel(componentModel) {
  const { type, props } = componentModel;
  if (type === constants.GRAPH_MODEL_COMPONENT_TYPE
    || type === constants.GRAPH_MODEL_COMPONENT_INSTANCE_TYPE) {
    const { componentName, componentInstance, properties } = props;
    const pageComponentModel = {
      type: constants.PAGE_COMPONENT_TYPE,
      props: {
        componentName,
        componentInstance,
      },
      children: [],
    };
    if (properties && properties.length > 0) {
      properties.forEach(property => {
        if (property.type === constants.GRAPH_MODEL_COMPONENT_PROPERTY_ELEMENT_TYPE) {
          pageComponentModel.children.push({
            type: constants.PAGE_PLACEHOLDER_TYPE,
            props: {
              componentName: '__PlaceHolder',
              elementProperty: property.name,
            }
          });
        }
      });
    }
    return pageComponentModel;
  }
  return undefined;
}

export function createPagePlaceholderModel(pageComponentModel) {
  const { props } = pageComponentModel;
  const placeHolderModel = {
    type: constants.PAGE_PLACEHOLDER_TYPE,
    props: {
      componentName: '__PlaceHolder'
    },
    children: [],
  };
  if (props.elementProperty) {
    placeHolderModel.props.elementProperty = props.elementProperty;
  }
  return placeHolderModel;
}