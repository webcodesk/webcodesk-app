import keyBy from 'lodash/keyBy';
import remove from 'lodash/remove';
import constants from '../../../commons/constants';

class FlowModelCompiler {
  constructor (maps) {
    this.componentModelsMap = maps.componentModelsMap;
    this.componentInstanceModelsMap = maps.componentInstanceModelsMap;
    this.userFunctionModelsMap = maps.userFunctionModelsMap;
    this.pageModelsMap = maps.pageModelsMap;
  }

  propertiesComparator(a, b) {
    if (a.name === 'caughtException') {
      return 1;
    } if (b.name === 'caughtException') {
      return -1;
    }
    return a.name.localeCompare(b.name);
  }

  compile(nodeModel, parentModel = null) {

    let changesCount = 0;
    let errorsCount = 0;
    if (nodeModel) {
      if (nodeModel.type === constants.FLOW_COMPONENT_INSTANCE_TYPE) {
        const { props: { componentName, title, componentInstance } } = nodeModel;
        const componentModel = this.componentModelsMap.get(componentName);
        if (componentModel) {
          const { props: { inputs, outputs } } = nodeModel;
          const { props: { properties } } = componentModel;

          const componentPropertiesMap = keyBy(properties, 'name');

          const flowItemInputs = keyBy(inputs, 'name');
          const flowItemOutputs = keyBy(outputs, 'name');
          if (properties && properties.length > 0) {
            let foundItemInput;
            let foundItemOutput;
            properties.forEach(componentProperty => {
              if (componentProperty.type === constants.GRAPH_MODEL_COMPONENT_PROPERTY_FUNCTION_TYPE) {
                foundItemOutput = flowItemOutputs[componentProperty.name];
                if (!foundItemOutput) {
                  // output is missing
                  nodeModel.props.outputs.push({
                    name: componentProperty.name,
                  });
                  changesCount++;
                }
              } else if (componentProperty.type === constants.GRAPH_MODEL_COMPONENT_PROPERTY_OBJECT_TYPE) {
                foundItemInput = flowItemInputs[componentProperty.name];
                if (!foundItemInput) {
                  // input is missing
                  nodeModel.props.inputs.push({
                    name: componentProperty.name,
                  });
                  changesCount++;
                }
              }
            });
            nodeModel.props.inputs = nodeModel.props.inputs.sort(this.propertiesComparator);
            nodeModel.props.outputs = nodeModel.props.outputs.sort(this.propertiesComparator);

            let foundProperty;
            inputs.forEach((flowItemInput, index) => {
              foundProperty = componentPropertiesMap[flowItemInput.name];
              if (!foundProperty) {
                if (!nodeModel.props.inputs[index].connectedTo) {
                  // this input does not have connections, should be removed
                  nodeModel.props.inputs[index].toRemove = true;
                } else {
                  if (!nodeModel.props.inputs[index].error) {
                    nodeModel.props.inputs[index].error =
                      `"${flowItemInput.name}" property was not found.`;
                    changesCount++;
                  }
                  errorsCount++;
                }
              } else {
                if (nodeModel.props.inputs[index].error) {
                  nodeModel.props.inputs[index].error = undefined;
                  changesCount++;
                }
              }
            });
            // remove all that was specified as to remove
            remove(nodeModel.props.inputs, i => !!i.toRemove);

            outputs.forEach((flowItemOutput, index) => {
              foundProperty = componentPropertiesMap[flowItemOutput.name];
              if (!foundProperty) {
                // we have to find if there is any child which is connected to the output
                // if there is no any - just remove this output
                let toRemove = true;
                const nodeModelChildren = nodeModel.children;
                if (nodeModelChildren && nodeModelChildren.length > 0) {
                  nodeModelChildren.forEach(nodeModelChild => {
                    const {props: {inputs: nodeModelChildInputs}} = nodeModelChild;
                    if (nodeModelChildInputs && nodeModelChildInputs.length > 0) {
                      const foundIndexNodeModelChildInput =
                        nodeModelChildInputs.findIndex(i => i.connectedTo === flowItemOutput.name);
                      if (foundIndexNodeModelChildInput >= 0) {
                        toRemove = false;
                      }
                    }
                  });
                }
                if (toRemove) {
                  nodeModel.props.outputs[index].toRemove = true;
                } else {
                  // this output has some connections, just set the error
                  if (!nodeModel.props.outputs[index].error) {
                    nodeModel.props.outputs[index].error =
                      `"${flowItemOutput.name}" property was not found.`;
                    changesCount++;
                  }
                  errorsCount++;
                }
              } else {
                if (nodeModel.props.outputs[index].error) {
                  nodeModel.props.outputs[index].error = undefined;
                  changesCount++;
                }
              }
            });
            // remove all that was specified as to remove
            remove(nodeModel.props.outputs, i => !!i.toRemove);


            // remove error if it is here
            if (nodeModel.props.errors && nodeModel.props.errors['emptyPropertiesError']) {
              delete nodeModel.props.errors['emptyPropertiesError'];
              changesCount++;
            }

            const foundComponentInstance =
              this.componentInstanceModelsMap.get(`${componentName}_${componentInstance}`);
            if (!foundComponentInstance) {
              // add error if it is not here
              if (!nodeModel.props.errors || !nodeModel.props.errors['missedComponentInstance']) {
                nodeModel.props.errors = nodeModel.props.errors || {};
                nodeModel.props.errors['missedComponentInstance'] =
                  `"${componentInstance}" instance with path "${componentName}" was not found in pages.`;
                changesCount++;
              }
              errorsCount++;
            } else {
              // remove error if it is here
              if (nodeModel.props.errors && nodeModel.props.errors['missedComponentInstance']) {
                delete nodeModel.props.errors['missedComponentInstance'];
                changesCount++;
              }
              // todo: how to find that the components instance is on the forwarded page?
              // need to know if the passed parameters to the correct page's component instance
              // if (parentModel && parentModel.type === constants.FLOW_PAGE_TYPE) {
              //   if (foundComponentInstance.props.pagePath === parentModel.props.pagePath) {
              //     // remove error if it is here
              //     if (newFlowItemModel.props.errors && newFlowItemModel.props.errors['doesNotBelongToPage']) {
              //       delete newFlowItemModel.props.errors['doesNotBelongToPage'];
              //       changesCount++;
              //     }
              //   } else {
              //     // add error if it is not here
              //     if (!newFlowItemModel.props.errors || !newFlowItemModel.props.errors['doesNotBelongToPage']) {
              //       newFlowItemModel.props.errors = newFlowItemModel.props.errors || {};
              //       newFlowItemModel.props.errors['doesNotBelongToPage'] =
              //         `The ${componentInstance} component instance does not belong to the page.`;
              //       changesCount++;
              //     }
              //   }
              // }
            }

          } else {
            // add error if it is not here
            if (!nodeModel.props.errors || !nodeModel.props.errors['emptyPropertiesError']) {
              nodeModel.props.errors = nodeModel.props.errors || {};
              nodeModel.props.errors['emptyPropertiesError'] =
                `"${title}" instance does not have properties.`;
              changesCount++;
            }
            errorsCount++;
            if (inputs && inputs.length > 0) {
              inputs.forEach((flowItemInput, index) => {
                if (!nodeModel.props.inputs[index].error) {
                  nodeModel.props.inputs[index].error =
                    `"${flowItemInput.name}" property was not found`;
                  changesCount++;
                }
                errorsCount++;
              });
            }
            if (outputs && outputs.length > 0) {
              outputs.forEach((flowItemOutput, index) => {
                if (!nodeModel.props.outputs[index].error) {
                  nodeModel.props.outputs[index].error =
                    `"${flowItemOutput.name}" property was not found`;
                  changesCount++;
                }
                errorsCount++;
              });
            }
          }
          if (parentModel) {
            // check if there is a parent, if so, then there should be inputs connected to the parent
            const findConnectedInputs = inputs && inputs.length > 0 ? inputs.find(i => !!i.connectedTo) : null;
            if (!findConnectedInputs) {
              if (!nodeModel.props.errors || !nodeModel.props.errors['noInputConnections']) {
                nodeModel.props.errors = nodeModel.props.errors || {};
                nodeModel.props.errors['noInputConnections'] =
                  `"${title}" particle is not connected`;
                changesCount++;
              }
              errorsCount++;
            } else {
              if (nodeModel.props.errors && nodeModel.props.errors['noInputConnections']) {
                delete nodeModel.props.errors['noInputConnections'];
                changesCount++;
              }
            }
          }
          if (nodeModel.props.errors && nodeModel.props.errors['noComponent']) {
            delete nodeModel.props.errors['noComponent'];
            changesCount++;
          }
        } else {
          // component was not found....
          if (!nodeModel.props.errors || !nodeModel.props.errors['noComponent']) {
            nodeModel.props.errors = nodeModel.props.errors || {};
            nodeModel.props.errors['noComponent'] =
              `"${componentInstance}" instance was not found by path "${componentName}"`;
            changesCount++;
          }
          errorsCount++;
        }
      } else if (nodeModel.type === constants.FLOW_USER_FUNCTION_TYPE) {
        const { props: { functionName, title } } = nodeModel;
        const functionModel = this.userFunctionModelsMap.get(functionName);
        if (functionModel) {
          const { props: { inputs, outputs } } = nodeModel;
          const { props: { dispatches } } = functionModel;

          const functionDispatchesMap = keyBy(dispatches, 'name');

          const flowItemOutputs = keyBy(outputs, 'name');
          if (dispatches && dispatches.length > 0) {
            let foundItemOutput;
            dispatches.forEach(functionDispatch => {
              foundItemOutput = flowItemOutputs[functionDispatch.name];
              if (!foundItemOutput) {
                // output is missing
                nodeModel.props.outputs.push({
                  name: functionDispatch.name,
                });
                changesCount++;
              }
            });
          }
          nodeModel.props.outputs = nodeModel.props.outputs.sort(this.propertiesComparator);

          let foundDispatch;
          outputs.forEach((flowItemOutput, index) => {
            foundDispatch = functionDispatchesMap[flowItemOutput.name];
            if (!foundDispatch) {
              // we have to find if there is any child which is connected to the output
              // if there is no any - just remove this output
              let toRemove = true;
              const nodeModelChildren = nodeModel.children;
              if (nodeModelChildren && nodeModelChildren.length > 0) {
                nodeModelChildren.forEach(nodeModelChild => {
                  const {props: {inputs: nodeModelChildInputs}} = nodeModelChild;
                  if (nodeModelChildInputs && nodeModelChildInputs.length > 0) {
                    const foundIndexNodeModelChildInput =
                      nodeModelChildInputs.findIndex(i => i.connectedTo === flowItemOutput.name);
                    if (foundIndexNodeModelChildInput >= 0) {
                      toRemove = false;
                    }
                  }
                });
              }
              if (toRemove) {
                nodeModel.props.outputs[index].toRemove = true;
              } else {
                // this output has some connections, just set the error
                if (!nodeModel.props.outputs[index].error) {
                  nodeModel.props.outputs[index].error =
                    `"${flowItemOutput.name}" dispatch was not found`;
                  changesCount++;
                }
                errorsCount++;
              }
            } else {
              if (nodeModel.props.outputs[index].error) {
                nodeModel.props.outputs[index].error = undefined;
                changesCount++;
              }
            }
          });
          // remove all that was specified as to remove
          remove(nodeModel.props.outputs, i => !!i.toRemove);

          const findConnectedInputs = inputs && inputs.length > 0 ? inputs.find(i => !!i.connectedTo) : null;
          if (!findConnectedInputs) {
            if (!nodeModel.props.errors || !nodeModel.props.errors['noInputConnections']) {
              nodeModel.props.errors = nodeModel.props.errors || {};
              nodeModel.props.errors['noInputConnections'] =
                `"${title}" function is not connected`;
              changesCount++;
            }
            errorsCount++;
          } else {
            if (nodeModel.props.errors && nodeModel.props.errors['noInputConnections']) {
              delete nodeModel.props.errors['noInputConnections'];
              changesCount++;
            }
          }

          if (nodeModel.props.errors && nodeModel.props.errors['noFunction']) {
            delete nodeModel.props.errors['noFunction'];
            changesCount++;
          }

        } else {
          if (!nodeModel.props.errors || !nodeModel.props.errors['noFunction']) {
            nodeModel.props.errors = nodeModel.props.errors || {};
            nodeModel.props.errors['noFunction'] =
              `"${title}" function is not found by path "${functionName}"`;
            changesCount++;
          }
          errorsCount++;
        }
      } else if (nodeModel.type === constants.FLOW_PAGE_TYPE) {
        const { props: { title, pagePath, inputs } } = nodeModel;
        const foundPageModel = this.pageModelsMap.get(pagePath);
        if (!foundPageModel) {
          // add error if it is not here
          if (!nodeModel.props.errors || !nodeModel.props.errors['missedPage']) {
            nodeModel.props.errors = nodeModel.props.errors || {};
            nodeModel.props.errors['missedPage'] =
              `"${title}" was not found`;
            changesCount++;
          }
          errorsCount++;
        } else {
          if (parentModel) {
            const findConnectedInputs = inputs && inputs.length > 0 ? inputs.find(i => !!i.connectedTo) : null;
            if (!findConnectedInputs) {
              if (!nodeModel.props.errors || !nodeModel.props.errors['noInputConnections']) {
                nodeModel.props.errors = nodeModel.props.errors || {};
                nodeModel.props.errors['noInputConnections'] =
                  `"${title}" page is not connected`;
                changesCount++;
              }
              errorsCount++;
            } else {
              if (nodeModel.props.errors && nodeModel.props.errors['noInputConnections']) {
                delete nodeModel.props.errors['noInputConnections'];
                changesCount++;
              }
            }
          }
          // remove error if it is here
          if (nodeModel.props.errors && nodeModel.props.errors['missedPage']) {
            delete nodeModel.props.errors['missedPage'];
            changesCount++;
          }
        }
      }
      if (nodeModel.children && nodeModel.children.length > 0) {
        nodeModel.children.forEach(child => {
          const { changesCount: childChangesCount, errorsCount: childErrorsCount } = this.compile(child, nodeModel);
          changesCount += childChangesCount;
          errorsCount += childErrorsCount;
        });
      }
    }
    return { changesCount, errorsCount };
  }
}

export default FlowModelCompiler;
