import uniqueId from 'lodash/uniqueId';
import pickBy from 'lodash/pickBy';
import omit from 'lodash/omit';
import merge from 'lodash/merge';
import assign from 'lodash/assign';
import isUndefined from 'lodash/isUndefined';
import isMatch from 'lodash/isMatch';
import isArray from 'lodash/isArray';
import graphlib from 'graphlib';

class GraphModel {
  graphInstance;
  rootNodeKey;

  constructor () {
    this.graphInstance = new graphlib.Graph({compound: true, directed: true});
    this.graphInstance.setDefaultEdgeLabel('link');
  }

  mapModel(root) {
    const { key, type, instance, props, text, children } = root;
    const nodeKey = key || uniqueId('node');
    this.graphInstance.setNode(
      nodeKey,
      pickBy({ key: nodeKey, type, instance, props, text }, i => !isUndefined(i))
    );
    if (children && children.length > 0) {
      children.forEach(child => {
        const childKey = this.mapModel(child);
        this.graphInstance.setParent(childKey, nodeKey);
        this.graphInstance.setEdge(nodeKey, childKey, `${nodeKey}${childKey}`);
      });
    }
    return nodeKey;
  }

  extractModel(rootNodeKey, noKeys = false, comparator = null, excludeProps = null, excludeTypes = null) {
    const nodeObject = this.graphInstance.node(rootNodeKey);
    const model = nodeObject ? pickBy(nodeObject, i => !isUndefined(i)) : {};
    if (excludeTypes && excludeTypes.length > 0) {
      if (excludeTypes.indexOf(model.type) >= 0) {
        return null;
      }
    }
    if (model.props && excludeProps && excludeProps.length > 0) {
      model.props = omit(model.props, excludeProps);
    }
    if (noKeys) {
      delete model.key;
    }
    const childrenKeys = this.graphInstance.children(rootNodeKey);
    if (childrenKeys && childrenKeys.length > 0) {
      const unOrderedChildren = [];
      let childModel;
      childrenKeys.forEach(childKey => {
        childModel = this.extractModel(childKey, noKeys, comparator, excludeProps, excludeTypes);
        if (childModel) {
          unOrderedChildren.push(childModel);
        }
      });
      const orderedChildren = comparator
        ? unOrderedChildren.sort(comparator)
        : unOrderedChildren;
      model.children = orderedChildren.map(orderedChild => orderedChild);
    }
    return model;
  }

  initModel(jsonModel) {
    if (!jsonModel) {
      throw Error('GraphModel.initModel: missing json model definition');
    }
    this.rootNodeKey = this.mapModel(jsonModel);
  }

  getModel(noKeys = false, comparator = null, excludeProps = null, excludeTypes = null) {
    if (this.rootNodeKey) {
      return this.extractModel(this.rootNodeKey, noKeys, comparator, excludeProps, excludeTypes);
    }
    throw Error('GraphModel.initModel: can not find root node key');
  }

  getSerializableModel(comparator = null, excludeProps = null, excludeTypes = null) {
    if (this.rootNodeKey) {
      return this.extractModel(this.rootNodeKey, true, comparator, excludeProps, excludeTypes);
    }
    throw Error('GraphModel.initModel: can not find root node key');
  }

  getRootKey() {
    return this.rootNodeKey;
  }

  traverse(visitor, rootNodeKey) {
    let accumulator = [];
    if (!visitor) {
      throw Error('GraphModel.traverse: visitor function is not passed in.');
    }
    rootNodeKey = rootNodeKey || this.rootNodeKey;
    const parentModel = this.getParentNode(rootNodeKey);
    const nodeModel = this.getNode(rootNodeKey);
    const visitorResult = visitor({nodeModel, parentModel});
    if (visitorResult && isArray(visitorResult)) {
      accumulator = accumulator.concat(visitorResult);
    }
    const childrenKeys = this.graphInstance.children(rootNodeKey);
    if (childrenKeys && childrenKeys.length > 0) {
      childrenKeys.forEach(childKey => {
         accumulator = accumulator.concat(this.traverse(visitor, childKey));
      });
    }
    return accumulator;
  }

  replaceNode(nodeKey, model) {
    const parentNodeKey = this.graphInstance.parent(nodeKey);
    if (parentNodeKey) {
      const newNodeKey = this.mapModel(model);
      this.graphInstance.removeNode(nodeKey);
      this.graphInstance.setParent(newNodeKey, parentNodeKey);
      return newNodeKey;
    } else {
      this.initModel(model);
      return this.rootNodeKey;
    }
  }

  addChildNodeToRoot(model) {
    if (this.rootNodeKey) {
      const newNodeKey = this.mapModel(model);
      this.graphInstance.setParent(newNodeKey, this.rootNodeKey);
      // console.info('Set edge: ', nodeKey, childKey, `${nodeKey}${childKey}`);
      this.graphInstance.setEdge(this.rootNodeKey, newNodeKey, `${this.rootNodeKey}${newNodeKey}`)
    }
  }

  addChildNode(parentNodeKey, model) {
    const newNodeKey = this.mapModel(model);
    this.graphInstance.setParent(newNodeKey, parentNodeKey);
    return newNodeKey;
  }

  insertSiblingNode(nodeKey, model) {
    const parentNodeKey = this.graphInstance.parent(nodeKey);
    const newNodeKey = this.mapModel(model);
    this.graphInstance.setParent(newNodeKey, parentNodeKey);
  }

  deleteNode(nodeKey) {
    this.graphInstance.removeNode(nodeKey);
  }

  mergeNode(nodeKey, model) {
    const nodeModel = this.graphInstance.node(nodeKey);
    const newModel = merge({}, nodeModel, model);
    this.graphInstance.setNode(nodeKey, newModel);
  }

  assignNode(nodeKey, model) {
    const nodeModel = this.graphInstance.node(nodeKey);
    const newModel = assign({}, nodeModel, model);
    this.graphInstance.setNode(nodeKey, newModel);
  }

  getChildrenCount(nodeKey) {
    const childrenKeys = this.graphInstance.children(nodeKey);
    return childrenKeys ? childrenKeys.length : 0;
  }

  getChildrenKeys(nodeKey) {
    return this.graphInstance.children(nodeKey);
  }

  replaceChildren(nodeKey, model) {
    const childrenKeys = this.graphInstance.children(nodeKey);
    if (childrenKeys && childrenKeys.length > 0) {
      childrenKeys.forEach(childKey => {
        this.deleteChildren(childKey);
        this.graphInstance.removeNode(childKey);
      });
    }
    const newNodeKey = this.mapModel(model);
    this.graphInstance.setParent(newNodeKey, nodeKey);
  }

  deleteChildren(nodeKey) {
    const childrenKeys = this.graphInstance.children(nodeKey);
    if (childrenKeys && childrenKeys.length > 0) {
      childrenKeys.forEach(childKey => {
        this.deleteChildren(childKey);
        this.graphInstance.removeNode(childKey);
      });
    }
  }

  getNode(nodeKey) {
    return this.graphInstance.node(nodeKey);
  }

  nodeExists(nodeKey) {
    const node = this.graphInstance.node(nodeKey);
    return !!node;
  }

  getOrderedNodesByKeys(nodeKeys, comparator) {
    let nodes = [];
    if (nodeKeys && nodeKeys.length > 0 && comparator) {
      nodeKeys.forEach(nodeKey => {
        nodes.push(this.graphInstance.node(nodeKey));
      });
      nodes = nodes.sort(comparator);
    }
    return nodes;
  }

  getParentNode(nodeKey) {
    const parentNodeKey = this.graphInstance.parent(nodeKey);
    if (parentNodeKey) {
      return {...this.graphInstance.node(parentNodeKey), key: parentNodeKey};
    }
    return null;
  }

  getParentKey(nodeKey) {
    return this.graphInstance.parent(nodeKey);
  }

  setParentKey(nodeKey, newParentKey) {
    this.graphInstance.setParent(nodeKey, newParentKey);
    this.graphInstance.setEdge(newParentKey, nodeKey, `${newParentKey}${nodeKey}`);
  }

  getAllSiblingNodes(nodeKey) {
    const result = [];
    const parentNodeKey = this.graphInstance.parent(nodeKey);
    const childrenKeys = this.graphInstance.children(parentNodeKey);
    if (childrenKeys && childrenKeys.length > 0) {
      childrenKeys.forEach(childKey => {
         result.push(this.graphInstance.node(childKey));
      });
    }
    return result;
  }

  getAllParentNodes(nodeKey) {
    let result = [];
    const parentNode = this.getParentNode(nodeKey);
    if (parentNode) {
      result.push(parentNode);
      result = result.concat(this.getAllParentNodes(parentNode.key));
    }
    return result;
  }

  getAllParentKeys(nodeKey) {
    let result = [];
    const parentKey = this.getParentKey(nodeKey);
    if (parentKey) {
      result.push(parentKey);
      result = result.concat(this.getAllParentKeys(parentKey));
    }
    return result;
  }

  findAllNodesMatch(testNode, startNodeKey = null) {
    let result = [];
    startNodeKey = startNodeKey || this.rootNodeKey;
    const {key, type, instance, text, props} = this.graphInstance.node(startNodeKey);
    const graphNode = {key, type, instance, text, props};
    if (isMatch(graphNode, testNode)) {
      result.push(graphNode);
    }
    const childrenKeys = this.graphInstance.children(startNodeKey);
    if (childrenKeys && childrenKeys.length > 0) {
      childrenKeys.forEach(childKey => {
        result = result.concat(this.findAllNodesMatch(testNode, childKey));
      });
    }
    return result;
  }

  getPostorderKeys() {
    return graphlib.alg.postorder(this.graphInstance, this.rootNodeKey);
  }

}

export default GraphModel;