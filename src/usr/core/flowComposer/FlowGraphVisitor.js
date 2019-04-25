import constants from '../../commons/constants';
import cloneDeep from 'lodash/cloneDeep';

const propertiesComparator = (a, b) => {
  if (a.name === 'caughtException') {
    return 1;
  }
  if (b.name === 'caughtException') {
    return -1;
  }
  return a.name.localeCompare(b.name);
};

class FlowGraphVisitor {

  enrichmentVisitor = ({ nodeModel, parentModel }) => {
    const resultTasks = [];
    resultTasks.push(() => {
      const { props: { inputs, outputs } } = nodeModel;
      if (inputs && inputs.length > 0) {
        nodeModel.props.inputs = inputs.sort(propertiesComparator);
      }
      if (outputs && outputs.length > 0) {
        nodeModel.props.outputs = outputs.sort(propertiesComparator);
      }
      if (parentModel) {
        nodeModel.props = {
          ...nodeModel.props,
          acceptableTypes: [
            constants.GRAPH_MODEL_COMPONENT_INSTANCE_TYPE,
            constants.GRAPH_MODEL_FLOW_COMPONENT_INSTANCE_TYPE,
            constants.GRAPH_MODEL_USER_FUNCTION_TYPE,
            constants.GRAPH_MODEL_FLOW_USER_FUNCTION_TYPE,
            constants.GRAPH_MODEL_PAGE_TYPE,
            constants.GRAPH_MODEL_FLOW_PAGE_TYPE,
          ]
        };
      } else {
        nodeModel.props = {
          ...nodeModel.props,
          acceptableTypes: [
            constants.GRAPH_MODEL_COMPONENT_INSTANCE_TYPE,
            constants.GRAPH_MODEL_FLOW_COMPONENT_INSTANCE_TYPE,
            constants.GRAPH_MODEL_PAGE_TYPE,
            constants.GRAPH_MODEL_FLOW_PAGE_TYPE,
          ]
        };
      }
    });
    return resultTasks;
  };

  decreasingVisitor = ({ nodeModel, parentModel }) => {
    const { key } = nodeModel;
    return [
      () => {
        const newNodeModel = cloneDeep(nodeModel);
        delete newNodeModel.props.acceptableTypes;
        this.graphModel.assignNode(key, newNodeModel);
      }
    ];
  };

  getSelected = ({ nodeModel, parentModel }) => {
    const result = [];
    const { props: { isSelected } } = nodeModel;
    if (isSelected) {
      result.push(nodeModel);
    }
    return result;
  };

  removeSelected = ({ nodeModel, parentModel }) => {
    delete nodeModel.props.isSelected;
  };

  getFlowParticles = ({ nodeModel, parentModel }) => {
    const result = [];
    const { type, props } = nodeModel;
    if (type === constants.FLOW_USER_FUNCTION_TYPE) {
      result.push({
        functionName: props.functionName
      });
    } else if (type === constants.FLOW_COMPONENT_INSTANCE_TYPE) {
      result.push({
        componentName: props.componentName,
        componentInstance: props.componentInstance,
      });
    } else if (type === constants.FLOW_PAGE_TYPE) {
      result.push({
        pageName: props.pageName,
        pagePath: props.pagePath,
      });
    }
    return result;
  };

  executeVisitResults = (tasks) => {
    if (tasks && tasks.length > 0) {
      tasks.forEach(task => { task(); });
    }
  };

  visitForEnrichment = (sourceGraphModel) => {
    this.graphModel = sourceGraphModel;
    this.executeVisitResults(this.graphModel.traverse(this.enrichmentVisitor));
  };

  visitForDecreasing = (sourceGraphModel) => {
    this.graphModel = sourceGraphModel;
    this.executeVisitResults(this.graphModel.traverse(this.decreasingVisitor));
  };

  visitForSelected = (sourceGraphModel) => {
    this.graphModel = sourceGraphModel;
    return this.graphModel.traverse(this.getSelected);
  };

  visitForRemoveSelected = (sourceGraphModel) => {
    this.graphModel = sourceGraphModel;
    this.graphModel.traverse(this.removeSelected);
  };

  visitForFlowParticles = (sourceGraphModel) => {
    this.graphModel = sourceGraphModel;
    return this.graphModel.traverse(this.getFlowParticles);
  };

}

export default FlowGraphVisitor;
