import uniqWith from 'lodash/uniqWith';
import isEqual from 'lodash/isEqual';
import constants from '../../../commons/constants';

class PageModelCompiler {
  constructor (maps) {
    this.componentModelsMap = maps.componentModelsMap;
    this.componentInstanceGroupsMap = maps.componentInstanceGroupsMap;
  }

  compile(nodeModel) {
    let changesCount = 0;
    let errorsCount = 0;
    if (nodeModel) {
      const { type, props } = nodeModel;
      if (type === constants.PAGE_COMPONENT_TYPE) {
        if (props) {
          const { componentName, componentInstance } = props;

          const instanceGroup = this.componentInstanceGroupsMap[`${componentName}_${componentInstance}`];
          if (instanceGroup && instanceGroup.length > 0) {
            const uniqItems = uniqWith(instanceGroup, isEqual);
            if (uniqItems.length > 1) {
              // there is no such a component any more
              if (!nodeModel.props.errors || !nodeModel.props.errors['differentInitialState']) {
                nodeModel.props.errors = nodeModel.props.errors || {};
                nodeModel.props.errors['differentInitialState'] =
                  `"${componentInstance}" instance has multiple different initial states.`;
                changesCount++;
              }
              errorsCount++;
            } else {
              // remove error if the component is here
              if (nodeModel.props.errors && nodeModel.props.errors['differentInitialState']) {
                delete nodeModel.props.errors['differentInitialState'];
                changesCount++;
              }
            }
          }

          const componentModel = this.componentModelsMap.get(componentName);
          if (componentModel) {
            // remove error if the component is here
            if (nodeModel.props.errors && nodeModel.props.errors['noComponent']) {
              delete nodeModel.props.errors['noComponent'];
              changesCount++;
            }

            const { props: { properties } } = componentModel;

            // check children placeholders
            if (nodeModel.children && nodeModel.children.length > 0) {
              let foundProperty;
              const newChildren = [];
              nodeModel.children.forEach(child => {
                foundProperty = properties.find(property => {
                  return property.type === constants.GRAPH_MODEL_COMPONENT_PROPERTY_ELEMENT_TYPE &&
                    child.props &&
                    child.props.elementProperty === property.name;
                });
                if (foundProperty) {
                  // remove error if the component is here
                  if (child.props.errors && child.props.errors['noElementProperty']) {
                    delete child.props.errors['noElementProperty'];
                    changesCount++;
                  }
                  newChildren.push(child);
                } else {
                  if (child.type !== constants.PAGE_PLACEHOLDER_TYPE) {
                    // there is no such a element property any more, but we have a component inside
                    if (!child.props.errors || !child.props.errors['noElementProperty']) {
                      child.props.errors = child.props.errors || {};
                      child.props.errors['noElementProperty'] =
                        `${child.props.elementProperty} element property was not found in ${componentName} component.`;
                      changesCount++;
                    }
                    errorsCount++;
                    newChildren.push(child);
                  }
                }
              });
              nodeModel.children = newChildren;
            }

            // check element properties
            if (properties && properties.length > 0) {
              let foundChild;
              properties.forEach(property => {
                if (property.type === constants.GRAPH_MODEL_COMPONENT_PROPERTY_ELEMENT_TYPE) {
                  if (nodeModel.children && nodeModel.children.length > 0) {
                    foundChild = nodeModel.children.find(child => {
                      return child.props && child.props.elementProperty === property.name;
                    });
                  }
                  if (!foundChild) {
                    nodeModel.children = nodeModel.children || [];
                    nodeModel.children.push({
                      type: constants.PAGE_PLACEHOLDER_TYPE,
                      props: {
                        componentName: '__PlaceHolder',
                        elementProperty: property.name,
                      }
                    });
                    changesCount++;
                  }
                }
              });
            }
          } else {
            // there is no such a component any more
            if (!nodeModel.props.errors || !nodeModel.props.errors['noComponent']) {
              nodeModel.props.errors = nodeModel.props.errors || {};
              nodeModel.props.errors['noComponent'] =
                `"${componentName}" component was not found.`;
              changesCount++;
            }
            errorsCount++;
          }
        }
        if (nodeModel.children && nodeModel.children.length > 0) {
          nodeModel.children.forEach(child => {
            const { changesCount: childChangesCount, errorsCount: childErrorsCount } = this.compile(child);
            changesCount += childChangesCount;
            errorsCount += childErrorsCount;
          });
        }
      }
    }
    return { changesCount, errorsCount };
  }
}

export default PageModelCompiler;