import omit from 'lodash/omit';
import cloneDeep from 'lodash/cloneDeep';
import GraphModel from '../graph/GraphModel';
import constants from '../../commons/constants';
import * as composerFactory from './flowComposerFactory';
import FlowGraphVisitor from './FlowGraphVisitor';

const flowModelComparator = (aModel, bModel) => {
  const { props: { inputs: aInputs } } = aModel;
  const { props: { inputs: bInputs } } = bModel;
  const aInput = aInputs ? aInputs.find(i => !!i.connectedTo) : null;
  const bInput = bInputs ? bInputs.find(i => !!i.connectedTo) : null;
  if (!aInput && bInput) {
    return 0;
  } else if (aInput && !bInput) {
    return 0;
  } else if (!aInput && !bInput) {
    return 0;
  } else {
    if (aInput.connectedTo === 'caughtException') {
      return 1;
    } if (bInput.connectedTo === 'caughtException') {
      return -1;
    }
    return aInput.connectedTo.localeCompare(bInput.connectedTo);
  }
};

class FlowComposerManager {

  constructor (flowModel) {
    this.graphModel = new GraphModel();
    this.flowGraphVisitor = new FlowGraphVisitor();
    if (flowModel) {
      this.graphModel.initModel(cloneDeep(flowModel));
    } else {
      this.graphModel.initModel(composerFactory.createDefaultModel());
    }
    this.enrichModel();
  }

  getFlowModel = (noKeys = false) => {
    return this.graphModel.getModel(noKeys, flowModelComparator);
  };

  getSerializableFlowModel = () => {
    return this.graphModel.getSerializableModel(flowModelComparator, ['acceptableTypes']);
  };

  appendNew = (destKey, model) => {
    this.graphModel.addChildNode(destKey, model);
  };

  replace = (destKey, model) => {
    const childrenKeys = this.graphModel.getChildrenKeys(destKey);
    if (childrenKeys && childrenKeys.length > 0) {
      childrenKeys.forEach(childKey => {
        this.clearInputs(childKey);
      });
    }
    this.graphModel.assignNode(destKey, model);
  };

  enrichModel = () => {
    this.flowGraphVisitor.visitForEnrichment(this.graphModel);
  };

  decreaseModel = () => {
    this.flowGraphVisitor.visitForDecreasing(this.graphModel);
  };

  getFlowParticles = () => {
    return this.flowGraphVisitor.visitForFlowParticles(this.graphModel);
  };

  replaceWithNew = (source, destination) => {
    if (!source || !destination) {
      console.error('FlowComposerManager.replaceWithNew: missing source or destination flow parts when replacing.');
    }
    const { key: destKey } = destination;
    if (!this.graphModel.nodeExists(destKey)) {
      console.error('FlowComposerManager.replaceWithNew: destination node is missing.');
    }
    const flowModel = this.createFlowModel(source);
    if (flowModel) {
      this.replace(destKey, flowModel);
    } else {
      console.error(`FlowComposerManager.replaceWithNew: new flow model was not created for ${source.type}`);
    }
  };

  addToBasket = (source, position) => {
    if (!source) {
      console.error('FlowComposerManager.replaceWithNew: missing source flow parts when adding to basket.');
    }
    const flowModel = this.createFlowModel(source, {position});
    if (flowModel) {
      this.appendNew(this.graphModel.getRootKey(), flowModel);
    } else {
      console.error(`FlowComposerManager.replaceWithNew: new flow model was not created for ${source.type}`);
    }
  };

  createFlowModel = (source, inBasket) => {
    return composerFactory.createFlowModel(source, inBasket);
  };

  connectInput = (outputKey, outputName, inputKey, inputName) => {
    if (outputKey !== inputKey) {
      const parentModel = this.graphModel.getNode(outputKey);
      const childModel = this.graphModel.getNode(inputKey);
      if (parentModel && childModel) {
        const { type: childType, props: { inputs } } = childModel;
        const { type: parentType, props: { outputs } } = parentModel;
        if (
          (childType === constants.FLOW_USER_FUNCTION_TYPE && parentType === constants.FLOW_PAGE_TYPE) ||
          (parentType === constants.FLOW_PAGE_TYPE &&
            (childType === constants.FLOW_PAGE_TYPE || childType === constants.FLOW_PAGE_IN_BASKET_TYPE)
          )
        ) {
          return;
        }
        if (outputs.findIndex(i => i.name === outputName) < 0) {
          console.error('FlowComposerManager.connectInput: wrong output name.');
        }
        const newInputs = [];
        if (inputs && inputs.length > 0) {
          let newInput;
          inputs.forEach(input => {
            newInput = omit(input, 'connectedTo');
            if (input.name === inputName) {
              newInput.connectedTo = outputName;
            }
            newInputs.push(newInput);
          });
        }
        const newChildModel = { ...childModel };
        if (newChildModel.type === constants.FLOW_COMPONENT_INSTANCE_IN_BASKET_TYPE) {
          newChildModel.type = constants.FLOW_COMPONENT_INSTANCE_TYPE;
        } else if (newChildModel.type === constants.FLOW_USER_FUNCTION_IN_BASKET_TYPE) {
          newChildModel.type = constants.FLOW_USER_FUNCTION_TYPE;
        } else if (newChildModel.type === constants.FLOW_PAGE_IN_BASKET_TYPE) {
          newChildModel.type = constants.FLOW_PAGE_TYPE;
        }
        newChildModel.props.inputs = newInputs;
        this.graphModel.assignNode(inputKey, newChildModel);
        try {
          this.graphModel.setParentKey(inputKey, outputKey);
        } catch(e) {
          // it seems that we have a cycle in the graph...
          // let's exchange the nodes' parents
          const inputParentKey = this.graphModel.getParentKey(inputKey);
          this.clearInputs(outputKey, parentModel);
          this.graphModel.setParentKey(outputKey, inputParentKey);
          this.graphModel.setParentKey(inputKey, outputKey);
        }
      }
    }
  };

  clearInputs = (key, model = null) => {
    if (!model) {
      model = this.graphModel.getNode(key);
    }
    const { props: { inputs } } = model;
    const newInputs = [];
    if (inputs && inputs.length > 0) {
      let newInput;
      inputs.forEach(input => {
        newInput = omit(input, 'connectedTo');
        newInputs.push(newInput);
      });
    }
    const newModel = { ...model };
    newModel.props.inputs = newInputs;
    this.graphModel.assignNode(key, newModel);
  };

  setSelected = (source) => {
    if (!source) {
      return null;
    }
    const { key } = source;
    const model = this.graphModel.getNode(key);
    if (!model) {
      console.error('FlowComposerManager.setSelected: missing model for passed in key.');
    }
    this.flowGraphVisitor.visitForRemoveSelected(this.graphModel);
    this.graphModel.mergeNode(key, { props: { isSelected: true } });
  };

  setSelectedByKey = (key) => {
    const model = this.graphModel.getNode(key);
    if (!model) {
      console.error('FlowComposerManager.setSelectedByKey: missing model for passed in key.');
    }
    this.flowGraphVisitor.visitForRemoveSelected(this.graphModel);
    this.graphModel.mergeNode(key, { props: { isSelected: true } });
  };

  setNewBasketPosition = (key, newPosition) => {
    const model = this.graphModel.getNode(key);
    if (!model) {
      console.error('FlowComposerManager.setNewBasketPosition: missing model for passed in key.');
    }
    this.graphModel.mergeNode(key, { props: { position: newPosition } });
  };

  getSelected = () => {
    const selectedNodes = this.flowGraphVisitor.visitForSelected(this.graphModel);
    if (selectedNodes && selectedNodes.length > 0) {
      return selectedNodes[0];
    }
    return null;
  };

  deleteSelected = () => {
    const selectedNodes = this.flowGraphVisitor.visitForSelected(this.graphModel);
    if (selectedNodes.length > 0) {
      const keyToDelete = selectedNodes[0].key;
      const parentKey = this.graphModel.getParentKey(keyToDelete);
      if (parentKey) {
        const childrenKeys = this.graphModel.getChildrenKeys(keyToDelete);
        if (childrenKeys && childrenKeys.length > 0) {
          let childModel;
          childrenKeys.forEach(childKey => {
            childModel = this.graphModel.getNode(childKey);
            this.clearInputs(childKey, childModel);
            this.graphModel.setParentKey(childKey, parentKey);
          });
        }
      }
      this.graphModel.deleteChildren(keyToDelete);
      this.graphModel.deleteNode(keyToDelete);
      if (!parentKey) {
        this.graphModel.initModel(composerFactory.createDefaultModel());
      }
    }
  };

}

export default FlowComposerManager;