import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import forOwn from 'lodash/forOwn';
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import FlowComposerManager from '../../core/flowComposer/FlowComposerManager';
import { CommonToolbar } from '../commons/Commons.parts';
import {getComponentName} from '../commons/utils';
import Diagram from '../diagram/Diagram';
import ToolbarButton from '../commons/ToolbarButton';
// import ToolbarAutotimerButton from '../commons/ToolbarAutotimerButton';

const styles = theme => ({
  root: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
  },
  centralPane: {
    position: 'absolute',
    top: '39px',
    bottom: 0,
    right: 0,
    left: 0,
    overflow: 'hidden',
  },
  topPane: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '39px',
    right: 0,
    minWidth: '800px'
  },
  tooltip: {
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    color: '#cdcdcd',
  },
  tooltipLabel: {
    padding: '2px 4px',
    fontSize: '90%',
    color: '#cccccc',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
});

class FlowComposer extends React.Component {
  static propTypes = {
    isVisible: PropTypes.bool,
    flowTree: PropTypes.object,
    draggedItem: PropTypes.object,
    updateHistory: PropTypes.array,
    onUpdate: PropTypes.func,
    onErrorClick: PropTypes.func,
    onSearchRequest: PropTypes.func,
    onUndo: PropTypes.func,
    onOpen: PropTypes.func,
  };

  static defaultProps = {
    isVisible: true,
    flowTree: {},
    draggedItem: null,
    updateHistory: [],
    onUpdate: () => {
      console.info('FlowComposer.onUpdate is not set.');
    },
    onErrorClick: () => {
      console.info('FlowComposer.onErrorClick is not set.');
    },
    onSearchRequest: () => {
      console.info('FlowComposer.onSearchRequest is not set.');
    },
    onUndo: () => {
      console.info('FlowComposer.onUndo is not set.');
    },
    onOpen: () => {
      console.info('FlowComposer.onOpen is not set.');
    },
  };

  constructor (props) {
    super(props);
    this.updateCounter = 0;
    this.state = {
      selectedNode: null,
      updateCounter: 0,
    };
    if (this.props.flowTree) {
      this.flowComposerManager = new FlowComposerManager(this.props.flowTree);
      this.state.localFlowTree = this.flowComposerManager.getFlowModel();
      this.state.selectedNode = this.flowComposerManager.getSelected();
    }
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    const { flowTree } = this.props;
    const { updateCounter } = this.state;
    if (flowTree !== prevProps.flowTree && updateCounter === 0) {
      delete this.flowComposerManager;
      this.flowComposerManager = new FlowComposerManager(flowTree);
      this.setState({
        localFlowTree: this.flowComposerManager.getFlowModel(),
        selectedNode: this.flowComposerManager.getSelected(),
      });
    }
    if(updateCounter > 0 && updateCounter !== prevState.updateCounter) {
      this.sendUpdate();
    }
  }

  sendUpdate = () => {
    this.setState({updateCounter: 0});
    this.props.onUpdate({ flowTree: this.flowComposerManager.getSerializableFlowModel() });
  };

  handleItemClick = (node) => {
    this.flowComposerManager.setSelected(node);
    this.setState({
      localFlowTree: this.flowComposerManager.getFlowModel(),
      selectedNode: this.flowComposerManager.getSelected(),
    });
  };

  handleDropNew = (source, destination, position) => {
    if (destination) {
      this.flowComposerManager.replaceWithNew(source, destination);
    } else {
      this.flowComposerManager.addToBasket(source, position);
    }
    this.flowComposerManager.enrichModel();
    this.setState({
      localFlowTree: this.flowComposerManager.getFlowModel(),
      updateCounter: this.state.updateCounter + 1,
    });
  };

  handleConnectInput = (outputKey, outputName, inputKey, inputName) => {
    this.flowComposerManager.connectInput(outputKey, outputName, inputKey, inputName);
    this.flowComposerManager.enrichModel();
    this.setState({
      localFlowTree: this.flowComposerManager.getFlowModel(),
      updateCounter: this.state.updateCounter + 1,
    });
  };

  handleErrorClick = (errors) => {
    if (errors) {
      if (isString(errors)) {
        this.props.onErrorClick([{message: errors}]);
      } else if (isObject(errors)) {
        const messages = [];
        forOwn(errors, (value) => {
          messages.push({
            message: value,
          })
        });
        this.props.onErrorClick(messages);
      }
    }
  };

  handleDeleteItem = () => {
    this.flowComposerManager.deleteSelected();
    this.flowComposerManager.enrichModel();
    this.setState({
      localFlowTree: this.flowComposerManager.getFlowModel(),
      updateCounter: this.state.updateCounter + 1,
      selectedNode: null,
    });
  };

  handleSearchRequest = (text) => () => {
    this.props.onSearchRequest(text);
  };

  handleUndo = () => {
    this.props.onUndo();
  };

  handleDragEndBasket = (key, newPosition) => {
    this.flowComposerManager.setNewBasketPosition(key, newPosition);
    this.flowComposerManager.setSelectedByKey(key);
    this.setState({
      localFlowTree: this.flowComposerManager.getFlowModel(),
      updateCounter: this.state.updateCounter + 1,
    });
  };

  handleOpen = () => {
    const { selectedNode } = this.state;
    if (selectedNode.props) {
      if (selectedNode.props.componentName) {
        this.props.onOpen(selectedNode.props.componentName);
      } else if (selectedNode.props.functionName) {
        this.props.onOpen(selectedNode.props.functionName);
      } else if (selectedNode.props.pagePath) {
        this.props.onOpen(selectedNode.props.pagePath);
      }
    }
  };

  render () {
    const { localFlowTree, selectedNode } = this.state;
    if (!localFlowTree) {
      return <h1>Flow tree is not specified</h1>
    }
    const { classes, draggedItem, updateHistory } = this.props;
    let title;
    let searchName;
    let className;
    let openTitle = "Open";
    let openIcon = "CropOriginal";
    if (selectedNode && selectedNode.props.title !== 'Application') {
      title = selectedNode.props.title;
      className = getComponentName(selectedNode.props.componentName);
      searchName = selectedNode.props.searchName;

      if (selectedNode.props.componentName) {
        openTitle = "Component";
        openIcon = "CropOriginal";
      } else if (selectedNode.props.functionName) {
        openTitle = "Function";
        openIcon = "Category";
      } else if (selectedNode.props.pagePath) {
        openTitle = "Page";
        openIcon = "Dashboard";
      }

    }
    const menuItems = [];
    if (title) {
      menuItems.push({
        label: `By name: "${searchName || title}"`,
        onClick: this.handleSearchRequest(searchName || title)
      });
    }
    if (className) {
      menuItems.push({
        label: `By class: "${className}"`,
        onClick: this.handleSearchRequest(className)
      });
    }
    return (
      <div className={classes.root}>
        <div className={classes.topPane}>
          <CommonToolbar disableGutters={true} dense="true">
            <ToolbarButton
              disabled={!title}
              title="Search"
              iconType="Search"
              tooltip="Search in the project"
              menuItems={menuItems}
            />
            <ToolbarButton
              disabled={!title}
              title={openTitle}
              iconType={openIcon}
              tooltip="Open in new tab"
              onClick={this.handleOpen}
            />
            <ToolbarButton
              iconType="Delete"
              iconColor="#E53935"
              disabled={!title}
              onClick={this.handleDeleteItem}
              title="Delete"
              tooltip="Remove the selected particle from the flow"
            />
            <ToolbarButton
              iconType="Undo"
              disabled={(!updateHistory || updateHistory.length === 0)}
              onClick={this.handleUndo}
              title="Undo"
              tooltip="Undo current changes to the last saving"
            />
            {/*<ToolbarAutotimerButton*/}
              {/*updateCounter={updateCounter}*/}
              {/*switchedOn={updateCounter > 0}*/}
              {/*seconds={5}*/}
              {/*onClick={this.sendUpdate}*/}
              {/*onFireTimer={this.sendUpdate}*/}
              {/*title="Save"*/}
              {/*tooltip="The saving occurs in 5 seconds after the last change"*/}
            {/*/>*/}
          </CommonToolbar>
        </div>
        <div className={classes.centralPane}>
          <Diagram
            treeData={localFlowTree}
            draggedItem={draggedItem}
            onItemClick={this.handleItemClick}
            onErrorClick={this.handleErrorClick}
            onDropNew={this.handleDropNew}
            onConnectInput={this.handleConnectInput}
            onItemDelete={this.handleDeleteItem}
            onItemDragEnd={this.handleDragEndBasket}
          />
          <div className={classes.tooltip}>
            <code className={classes.tooltipLabel}>Drag & drop here</code>
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(FlowComposer);
