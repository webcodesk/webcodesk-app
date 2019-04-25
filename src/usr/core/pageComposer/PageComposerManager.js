import cloneDeep from 'lodash/cloneDeep';
import uniqWith from 'lodash/uniqWith';
import groupBy from 'lodash/groupBy';
import GraphModel from '../graph/GraphModel';
import * as constants from '../../commons/constants';
import * as pageComposerUtils from './pageComposerUtils';

const pageComposerComparator = (a, b) => {
  const { props: aProps } = a;
  const { props: bProps } = b;
  if (!aProps.elementProperty && bProps.elementProperty) {
    return -1;
  } else if (aProps.elementProperty && !bProps.elementProperty) {
    return 1;
  } else if (!aProps.elementProperty && !bProps.elementProperty) {
    return 0;
  } else {
    return aProps.elementProperty.localeCompare(bProps.elementProperty);
  }
};

class PageComposerManager {

  constructor (model, metaData) {
    this.graphModel = new GraphModel();
    this.graphModel.initModel(cloneDeep(model));
    this.metaData = metaData;
  }

  instanceVisitor = ({nodeModel, parentModel}) => {
    const result = [];
    if (nodeModel && nodeModel.props && nodeModel.type === constants.PAGE_COMPONENT_TYPE) {
      result.push({
        componentName: nodeModel.props.componentName,
        componentInstance: nodeModel.props.componentInstance,
        initialState: nodeModel.props.initialState,
      });
    }
    return result;
  };

  getInstancesListUniq = () => {
    const instances = this.graphModel.traverse(this.instanceVisitor);
    if (instances && instances.length > 0) {
      return uniqWith(
        instances,
        (a, b) => a.componentName === b.componentName && a.componentInstance === b.componentInstance
      );
    }
    return [];
  };

  getInstancesListGrouped = () => {
    const instances = this.graphModel.traverse(this.instanceVisitor);
    if (instances && instances.length > 0) {
      return groupBy(instances, value => `${value.componentName}_${value.componentInstance}`);
    }
    return {};
  };

  getModel = () => {
    return this.graphModel.getModel(false, pageComposerComparator);
  };

  getSerializableModel = () => {
    return this.graphModel.getSerializableModel(null, ['isSelected']);
  };

  getMetaData = () => {
    return this.metaData;
  };

  setMetaData = (newMetaData) => {
    this.metaData = newMetaData;
  };

  getNodeModel = (nodeKey) => {
    return this.graphModel.extractModel(nodeKey);
  };

  getParentKey = (nodeKey) => {
    return this.graphModel.getParentKey(nodeKey);
  };

  placeNewComponent = (targetKey, componentModel) => {
    const placeHolderModel = this.graphModel.getNode(targetKey);
    if (placeHolderModel) {
      const { type, props } = placeHolderModel;
      if (type === constants.PAGE_PLACEHOLDER_TYPE && props) {
        const newComponentInstanceModel = pageComposerUtils.createPageComponentModel(componentModel);
        if (props.elementProperty) {
          newComponentInstanceModel.props.elementProperty = props.elementProperty;
        }
        return this.graphModel.replaceNode(targetKey, newComponentInstanceModel);
      }
    }
  };

  renameComponentInstance = (targetKey, componentInstance, initialState) => {
    const componentModel = this.graphModel.getNode(targetKey);
    if (componentModel && componentModel.type === constants.PAGE_COMPONENT_TYPE) {
      this.graphModel.mergeNode(
        targetKey,
        {props: {
          componentInstance,
          initialState
        }}
      );
    }
  };

  deleteComponentInstance = (targetKey) => {
    const componentModel = this.graphModel.getNode(targetKey);
    if (componentModel && componentModel.type === constants.PAGE_COMPONENT_TYPE) {
      this.graphModel.replaceNode(targetKey, pageComposerUtils.createPagePlaceholderModel(componentModel));
      this.removeAllSelectedCells();
    }
  };

  selectedCellKeysStore = [];
  selectedNode = null;

  addSelectedCellKey = (key) => {
    this.selectedCellKeysStore.push(key);
  };

  getSelectedKey = () => {
    if (this.selectedCellKeysStore.length > 0) {
      return this.selectedCellKeysStore[0];
    }
    return null;
  };

  getAllSelectedCellKeys = () => {
    return [].concat(this.selectedCellKeysStore);
  };

  removeSelectedCellKey = (key) => {
    const keyIndex = this.selectedCellKeysStore.findIndex(i => key === i);
    if (keyIndex >= 0) {
      this.selectedCellKeysStore.splice(keyIndex, 1);
    }
  };

  removeAllSelectedCells = () => {
    const allPreviouslySelectedKeys = this.getAllSelectedCellKeys();
    if (allPreviouslySelectedKeys && allPreviouslySelectedKeys.length > 0) {
      allPreviouslySelectedKeys.forEach(key => {
        this.graphModel.mergeNode(key, {props: {isSelected: false}});
        this.removeSelectedCellKey(key);
      });
    }
    this.selectedNode = null;
  };

  selectCell = (targetKey) => {
    this.removeAllSelectedCells();
    this.addSelectedCellKey(targetKey);
    this.graphModel.mergeNode(targetKey, {props: {isSelected: true}});
    // set selected node
    this.selectedNode = this.graphModel.getNode(targetKey);
  };

  getSelectedNode = () => {
    return this.selectedNode;
  };
}

export default PageComposerManager;