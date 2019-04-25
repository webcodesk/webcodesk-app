import constants from '../../commons/constants';
import cloneDeep from 'lodash/cloneDeep';
import omit from 'lodash/omit';

const possibleResourceTypes = [
  constants.RESOURCE_IN_COMPONENTS_TYPE,
  constants.RESOURCE_IN_COMPONENT_STORIES_TYPE,
  constants.RESOURCE_IN_FLOWS_TYPE,
  constants.RESOURCE_IN_PAGES_TYPE,
  constants.RESOURCE_IN_USER_FUNCTIONS_TYPE,
];

class ResourceAdapter {

  constructor (build) {
    if (arguments.length === 1 && this.validateBuild(build)) {
      let resourceObject = build.resourceObject;
      let componentStories = build.componentStories;
      Object.defineProperties(this, {
        'resourceObject': {
          value: resourceObject,
          writable: false,
        },

        'isInUserFunctions': {
          get: function () {
            return !!this.resourceObject[constants.RESOURCE_IN_USER_FUNCTIONS_TYPE];
          }
        },
        'isInComponents': {
          get: function () {
            return !!this.resourceObject[constants.RESOURCE_IN_COMPONENTS_TYPE];
          }
        },
        'isInComponentStories': {
          get: function () {
            return !!this.resourceObject[constants.RESOURCE_IN_COMPONENT_STORIES_TYPE];
          }
        },
        'isInPages': {
          get: function () {
            return !!this.resourceObject[constants.RESOURCE_IN_PAGES_TYPE];
          }
        },
        'isInFlows': {
          get: function () {
            return !!this.resourceObject[constants.RESOURCE_IN_FLOWS_TYPE];
          }
        },
        'inUserFunctions': {
          get: function () {
            return this.resourceObject[constants.RESOURCE_IN_USER_FUNCTIONS_TYPE];
          }
        },
        'inComponents': {
          get: function () {
            return this.resourceObject[constants.RESOURCE_IN_COMPONENTS_TYPE];
          }
        },
        'inComponentStories': {
          get: function () {
            return this.resourceObject[constants.RESOURCE_IN_COMPONENT_STORIES_TYPE];
          }
        },
        'inPages': {
          get: function () {
            return this.resourceObject[constants.RESOURCE_IN_PAGES_TYPE];
          }
        },
        'inFlows': {
          get: function () {
            return this.resourceObject[constants.RESOURCE_IN_FLOWS_TYPE];
          }
        },
        'resource': {
          get: function () {
            const resourcesCount = possibleResourceTypes.reduce((acc, resourceType) => {
              if (!!this.resourceObject[resourceType]) {
                return acc++;
              }
              return acc;
            }, 0);
            if (resourcesCount > 1) {
              throw Error('Resource adapter includes multiple resources. Try use the distinct resource properties.');
            }
            if (this.isInUserFunctions) {
              return this.inUserFunctions;
            } else if (this.isInComponents) {
              return this.inComponents;
            } else if (this.isInComponentStories) {
              return this.inComponentStories;
            } else if (this.isInPages) {
              return this.inPages;
            } else if (this.isInFlows) {
              return this.inFlows;
            }
            return null;
          }
        },

        'isEmpty': {
          get: function () {
            return this.resource === null;
          }
        },

        'resourceTypesArray': {
          get: function () {
            const result = [];
            if (this.isInUserFunctions) {
              result.push(constants.RESOURCE_IN_USER_FUNCTIONS_TYPE);
            } else if (this.isInComponents) {
              result.push(constants.RESOURCE_IN_COMPONENTS_TYPE);
            } else if (this.isInComponentStories) {
              result.push(constants.RESOURCE_IN_COMPONENT_STORIES_TYPE);
            } else if (this.isInPages) {
              result.push(constants.RESOURCE_IN_PAGES_TYPE);
            } else if (this.isInFlows) {
              result.push(constants.RESOURCE_IN_FLOWS_TYPE);
            }
            return result;
          }
        },
        'isMultiTypeResource': {
          get: function () {
            return this.resourceTypesArray.length > 1;
          }
        },
        'model': {
          get: function () {
            if (this.resource) {
              return this.resource.model;
            }
            return null;
          }
        },
        'compactModel': {
          get: function () {
            if (this.model) {
              const { key, type, props } = this.model;
              return {
                key,
                type,
                props: omit(props, ['componentsTree', 'flowTree'])
              };
            }
            return null;
          }
        },
        'key': {
          get: function () {
            if (this.model) {
              return this.model.key;
            }
            return undefined;
          }
        },
        'type': {
          get: function () {
            if (this.model) {
              return this.model.type;
            }
            return undefined;
          }
        },
        'props': {
          get: function () {
            if (this.model) {
              return this.model.props;
            }
            return undefined;
          }
        },
        'absolutePath': {
          get: function () {
            if (this.props) {
              return this.props.absolutePath;
            }
            return undefined;
          }
        },
        'pageName': {
          get: function () {
            if (this.props) {
              return this.props.pageName;
            }
            return undefined;
          }
        },
        'resourceType': {
          get: function () {
            if (this.props) {
              return this.props.resourceType;
            }
            return undefined;
          }
        },
        'instance': {
          get: function () {
            if (this.model) {
              return this.model.instance;
            }
            return undefined;
          }
        },
        'title': {
          get: function () {
            if (this.props) {
              return this.props.displayName;
            }
            return undefined;
          }
        },
        'name': {
          get: function () {
            if (this.props) {
              return this.props.name;
            }
            return undefined;
          }
        },
        'componentName': {
          get: function () {
            if (this.props) {
              return this.props.componentName;
            }
            return undefined;
          }
        },
        'componentInstance': {
          get: function () {
            if (this.props) {
              return this.props.componentInstance;
            }
            return undefined;
          },
        },
        'functionName': {
          get: function () {
            if (this.props) {
              return this.props.functionName;
            }
            return undefined;
          }
        },
        'componentStories': {
          get: function () {
            return componentStories;
          }
        },
        'componentStoriesList': {
          get: function () {
            if (this.componentStories) {
              if (this.componentStories.props) {
                return this.componentStories.props.stories || [];
              }
            }
            return [];
          }
        },
        'componentStoriesName': {
          get: function () {
            if (this.componentStories) {
              if (this.componentStories.props) {
                return this.componentStories.props.componentStoriesName;
              }
            }
            return undefined;
          }
        },
        'componentsTree': {
          get: function () {
            if (this.props) {
              return this.props.componentsTree;
            }
            return undefined;
          }
        },
        'flowTree': {
          get: function () {
            if (this.props) {
              return this.props.flowTree;
            }
            return undefined;
          }
        },
        'metaData': {
          get: function () {
            if (this.props) {
              return this.props.metaData;
            }
            return undefined;
          }
        },
        'isDisabled': {
          get: function () {
            if (this.props) {
              return this.props.isDisabled;
            }
            return undefined;
          }
        },
        'pagePath': {
          get: function () {
            if (this.props) {
              return this.props.pagePath;
            }
            return undefined;
          }
        },
        'displayName': {
          get: function () {
            if (this.props) {
              return this.props.displayName;
            }
            return undefined;
          }
        },
        'properties': {
          get: function () {
            if (this.props) {
              return this.props.properties || [];
            }
            return [];
          }
        },
        'dispatches': {
          get: function () {
            if (this.props) {
              return this.props.dispatches || [];
            }
            return [];
          }
        },
        'functionsDescriptions': {
          get: function () {
            if (this.props) {
              return this.props.functionsDescriptions || [];
            }
            return [];
          }
        },
        'hasErrors': {
          get: function () {
            if (this.props) {
              return !!this.props.hasErrors;
            }
            return undefined;
          }
        },
        'childrenKeys': {
          get: function () {
            if (this.resource) {
              return this.resource.childrenKeys;
            }
            return undefined;
          }
        },
        'hasChildren': {
          get: function () {
            if (this.childrenKeys) {
              return this.childrenKeys.length > 0;
            }
            return undefined;
          }
        },
        'parentKey': {
          get: function () {
            if (this.resource && this.resource.parentKeys && this.resource.parentKeys.length > 0) {
              return this.resource.parentKeys[0];
            }
            return undefined;
          }
        },
        'allParentKeys': {
          get: function () {
            if (this.resource && this.resource.parentKeys) {
              return this.resource.parentKeys;
            }
            return undefined;
          }
        },
        'comments': {
          get: function () {
            if (this.props) {
              return this.props.comments;
            }
            return undefined;
          }
        },
        'isFile': {
          get: function () {
            return this.type === constants.GRAPH_MODEL_FILE_TYPE;
          }
        },
        'isDirectory': {
          get: function () {
            return this.type === constants.GRAPH_MODEL_DIR_TYPE;
          }
        },
        'isPage': {
          get: function () {
            return this.type === constants.GRAPH_MODEL_PAGE_TYPE;
          }
        },
        'isComponent': {
          get: function () {
            return this.type === constants.GRAPH_MODEL_COMPONENT_TYPE;
          }
        },
        'isComponentInstance': {
          get: function () {
            return this.type === constants.GRAPH_MODEL_COMPONENT_INSTANCE_TYPE;
          }
        },
        'isFlow': {
          get: function () {
            return this.type === constants.GRAPH_MODEL_FLOW_TYPE;
          }
        },
        'isComponentStories': {
          get: function () {
            return this.type === constants.GRAPH_MODEL_COMPONENT_STORIES_TYPE;
          }
        },
        'isUserFunction': {
          get: function () {
            return this.type === constants.GRAPH_MODEL_USER_FUNCTION_TYPE;
          }
        },
        'isFunctions': {
          get: function () {
            return this.type === constants.GRAPH_MODEL_FUNCTIONS_TYPE;
          }
        },
        'isFlowComponentInstance': {
          get: function () {
            return this.type === constants.GRAPH_MODEL_FLOW_COMPONENT_INSTANCE_TYPE;
          }
        },
        'isFlowUserFunction': {
          get: function () {
            return this.type === constants.GRAPH_MODEL_FLOW_USER_FUNCTION_TYPE;
          }
        },
        'isFlowPage': {
          get: function () {
            return this.type === constants.GRAPH_MODEL_FLOW_PAGE_TYPE;
          }
        }

      });
    }
  }

  validateBuild (build) {
    return (String(build.constructor) === String(ResourceAdapter.Builder));
  }

  static get Builder () {
    class Builder {
      byKeyInGraphs (key, getGraphByType, concreteResourceType = null) {
        if (!(getGraphByType instanceof Function)) {
          console.error('ResourceAdapter: the getGraphByType argument is not a function');
        } else {
          this.resourceObject = {};
          let graphModel;
          let model;
          if (concreteResourceType) {
            graphModel = getGraphByType(concreteResourceType);
            if (graphModel) {
              model = graphModel.getNode(key);
              if (model) {
                this.resourceObject[concreteResourceType] = {
                  model: cloneDeep(model),
                  childrenKeys: graphModel.getChildrenKeys(key) || [],
                  parentKeys: graphModel.getAllParentKeys(key) || [],
                };
              }
            }
          } else {
            possibleResourceTypes.forEach(resourceType => {
              graphModel = getGraphByType(resourceType);
              if (graphModel) {
                model = graphModel.getNode(key);
                if (model) {
                  this.resourceObject[resourceType] = {
                    model: cloneDeep(model),
                    childrenKeys: graphModel.getChildrenKeys(key) || [],
                    parentKeys: graphModel.getAllParentKeys(key) || [],
                  };
                }
              }
            });
          }
        }
        return this;
      }

      withComponentStories (componentStories) {
        this.componentStories = componentStories;
        return this;
      }

      build () {
        return new ResourceAdapter(this);
      }
    }

    return Builder;
  }
}

export default ResourceAdapter;