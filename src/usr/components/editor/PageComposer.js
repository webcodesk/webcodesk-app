import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import SplitPane from 'react-split-pane';
import constants from '../../commons/constants';
import PageComposerManager from '../../core/pageComposer/PageComposerManager';
import { CommonToolbar, CommonToolbarDivider, CommonTab, CommonTabs } from '../commons/Commons.parts';
import IFrame from './IFrame';
import EditComponentInstanceDialog from '../dialogs/EditComponentInstanceDialog';
import PageTree from './PageTree';
import ToolbarButton from '../commons/ToolbarButton';
// import ToolbarAutotimerButton from '../commons/ToolbarAutotimerButton';
import PageMetaData from './PageMetaData';

const styles = theme => ({
  root: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
  },
  leftPane: {
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
    overflow: 'auto',
  },
  topPane: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '39px',
    right: 0,
    minWidth: '1100px'
  },
});

class PageComposer extends React.Component {
  static propTypes = {
    isVisible: PropTypes.bool,
    componentsTree: PropTypes.object,
    metaData: PropTypes.object,
    hasErrors: PropTypes.bool,
    draggedItem: PropTypes.object,
    updateHistory: PropTypes.array,
    serverPort: PropTypes.number,
    onUpdate: PropTypes.func,
    onSearchRequest: PropTypes.func,
    onErrorClick: PropTypes.func,
    onUndo: PropTypes.func,
    onOpenComponent: PropTypes.func,
  };

  static defaultProps = {
    isVisible: true,
    componentsTree: {},
    metaData: {},
    hasErrors: false,
    draggedItem: null,
    updateHistory: [],
    serverPort: -1,
    onUpdate: () => {
      console.info('PageComposer.onUpdate is not set');
    },
    onSearchRequest: () => {
      console.info('PageComposer.onSearchRequest is not set');
    },
    onErrorClick: () => {
      console.info('PageComposer.onErrorClick is not set');
    },
    onUndo: () => {
      console.info('PageComposer.onUndo is not set');
    },
    onOpenComponent: () => {
      console.info('PageComposer.onOpenComponent is not set');
    },
  };

  constructor (props) {
    super(props);
    this.iFrameRef = React.createRef();
    const { componentsTree, metaData } = this.props;
    this.pageComposerManager = new PageComposerManager(componentsTree, metaData);
    this.state = {
      iFrameReadyCounter: 0,
      sendMessageCounter: 0,
      sendUpdateCounter: 0,
      recentUpdateHistory: [],
      isEditComponentInstanceDialogOpen: false,
      selectedCellKey: null,
      selectedComponentName: null,
      selectedComponentInstance: null,
      selectedInitialState: null,
      localComponentsTree: this.pageComposerManager.getModel(),
      localMetaData: this.pageComposerManager.getMetaData(),
      showTreeView: false,
      showPanelCover: false,
      isDevToolsOpen: false,
      iFrameWidth: 'auto',
      structureTabActiveIndex: 0,
    };
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    const {
      iFrameReadyCounter,
      localComponentsTree,
      sendMessageCounter,
      sendUpdateCounter,
      isDevToolsOpen,
      selectedCellKey,
    } = this.state;
    const { componentsTree, metaData } = this.props;
    if (iFrameReadyCounter > 0 && iFrameReadyCounter !== prevState.iFrameReadyCounter) {
      // send message to iframe only when it is ready
      this.updateLocalState();
    } else if (
        (
          (componentsTree && componentsTree !== prevProps.componentsTree) ||
          (metaData && metaData !== prevProps.metaData)
        ) &&
        sendUpdateCounter === 0
      )
    {
      delete this.pageComposerManager;
      this.pageComposerManager = new PageComposerManager(componentsTree, metaData);
      if (selectedCellKey) {
        this.pageComposerManager.selectCell(selectedCellKey);
      }
      this.updateLocalState();
    } else {
      if (sendMessageCounter !== prevState.sendMessageCounter) {
        this.handleSendMessage({
          type: constants.WEBCODESK_MESSAGE_UPDATE_PAGE_COMPONENTS_TREE,
          payload: localComponentsTree
        });
      }
      // if (sendUpdateCounter !== prevState.sendUpdateCounter) {
      //   this.sendUpdate();
      // }
    }
    const { draggedItem, isVisible } = this.props;
    if (isVisible) {
      if (draggedItem && !prevProps.draggedItem) {
        if (draggedItem.type === constants.GRAPH_MODEL_COMPONENT_TYPE
          || draggedItem.type === constants.GRAPH_MODEL_COMPONENT_INSTANCE_TYPE) {
          this.handleSendMessage({
            type: constants.WEBCODESK_MESSAGE_COMPONENT_ITEM_DRAG_START,
            payload: draggedItem,
          });
        }
      } else if (!draggedItem && prevProps.draggedItem) {
        if (prevProps.draggedItem.type === constants.GRAPH_MODEL_COMPONENT_TYPE
          || prevProps.draggedItem.type === constants.GRAPH_MODEL_COMPONENT_INSTANCE_TYPE) {
          this.handleSendMessage({
            type: constants.WEBCODESK_MESSAGE_COMPONENT_ITEM_DRAG_END
          });
        }
      }
    }
    if (prevProps.isVisible !== isVisible) {
      if (!isVisible) {
        if (isDevToolsOpen) {
          this.handleCloseDevTools();
          this.setState({
            isDevToolsOpen: false,
          });
        }
        // we save all recent changes if there were some
        if (sendUpdateCounter !== 0) {
          this.sendUpdate();
        }
      }
    }
  }

  updateLocalState = (doSendUpdate) => {
    this.setState((state) => {
      const {
        sendMessageCounter,
        sendUpdateCounter,
        recentUpdateHistory,
        localComponentsTree,
        localMetaData,
        selectedCellKey,
        selectedComponentName,
        selectedComponentInstance,
      } = state;
      const newRecentUpdateHistory =
        [
          ...recentUpdateHistory,
          {
            componentsTree: localComponentsTree,
            metaData: localMetaData,
            selectedCellKey,
            selectedComponentName,
            selectedComponentInstance
          }
        ];
      const newState = {
        localComponentsTree: this.pageComposerManager.getModel(),
        localMetaData: this.pageComposerManager.getMetaData(),
        sendMessageCounter: sendMessageCounter + 1,
      };
      if (doSendUpdate) {
        newState.recentUpdateHistory = newRecentUpdateHistory;
        newState.sendUpdateCounter = sendUpdateCounter + 1;
      }
      const selectedNode = this.pageComposerManager.getSelectedNode();
      if (selectedNode && selectedNode.props) {
        const { componentName, componentInstance, initialState } = selectedNode.props;
        newState.selectedComponentName = componentName;
        newState.selectedComponentInstance = componentInstance;
        newState.selectedInitialState = initialState;
        newState.selectedCellKey = this.pageComposerManager.getSelectedKey();
      } else {
        newState.selectedComponentName = null;
        newState.selectedComponentInstance = null;
        newState.selectedInitialState = null;
        newState.selectedCellKey = null;
      }
      return newState;
    });
  };

  undoUpdateLocalState = () => {
    this.setState((state) => {
      const {
        sendMessageCounter,
        sendUpdateCounter,
        recentUpdateHistory,
      } = state;
      const newRecentUpdateHistory = [...recentUpdateHistory];
      const lastRecentChanges = newRecentUpdateHistory.pop();
      if (lastRecentChanges) {
        delete this.pageComposerManager;
        this.pageComposerManager =
          new PageComposerManager(
            lastRecentChanges.componentsTree,
            lastRecentChanges.metaData,
          );
        if (lastRecentChanges.selectedCellKey) {
          this.pageComposerManager.selectCell(lastRecentChanges.selectedCellKey);
        }
        const newState = {
          localComponentsTree: this.pageComposerManager.getModel(),
          localMetaData: this.pageComposerManager.getMetaData(),
          sendMessageCounter: sendMessageCounter + 1,
          sendUpdateCounter: sendUpdateCounter - 1,
          recentUpdateHistory: newRecentUpdateHistory,
        };
        const selectedNode = this.pageComposerManager.getSelectedNode();
        if (selectedNode && selectedNode.props) {
          const { componentName, componentInstance, initialState } = selectedNode.props;
          newState.selectedComponentName = componentName;
          newState.selectedComponentInstance = componentInstance;
          newState.selectedInitialState = initialState;
          newState.selectedCellKey = this.pageComposerManager.getSelectedKey();
        } else {
          newState.selectedComponentName = null;
          newState.selectedComponentInstance = null;
          newState.selectedInitialState = null;
          newState.selectedCellKey = null;
        }
        return newState;
      }
      return {};
    });
  };

  sendUpdate = () => {
    this.setState({
      sendUpdateCounter: 0,
      recentUpdateHistory: [],
    });
    const { onUpdate } = this.props;
    onUpdate({
      componentsTree: this.pageComposerManager.getSerializableModel(),
      metaData: this.pageComposerManager.getMetaData(),
    });
  };

  handleIFrameReady = () => {
    this.setState({
      iFrameReadyCounter: this.state.iFrameReadyCounter + 1,
    });
  };

  handleSendMessage = (message) => {
    if (this.iFrameRef.current && this.state.iFrameReadyCounter > 0) {
      this.iFrameRef.current.sendMessage(message);
    }
  };

  handleReload = () => {
    if (this.iFrameRef.current) {
      this.iFrameRef.current.reloadPage();
    }
  };

  handleOpenDevTools = () => {
    if (this.iFrameRef.current) {
      this.iFrameRef.current.openDevTools();
    }
  };

  handleCloseDevTools = () => {
    if (this.iFrameRef.current) {
      this.iFrameRef.current.closeDevTools();
    }
  };

  handleToggleDevTools = (event) => {
    const {isDevToolsOpen} = this.state;
    if (isDevToolsOpen) {
      this.handleCloseDevTools();
    } else {
      this.handleOpenDevTools();
    }
    this.setState({
      isDevToolsOpen: !isDevToolsOpen,
    });
  };

  handleDevToolsCloseManually = () => {
    if (this.state.isDevToolsOpen && this.props.isVisible) {
      this.setState({
        isDevToolsOpen: false,
      });
    }
  };

  handleIFrameMessage = (message) => {
    if (message) {
      const { type, payload } = message;
      if (type === constants.FRAMEWORK_MESSAGE_PAGE_CELL_WAS_SELECTED) {
        const { targetKey } = payload;
        this.pageComposerManager.selectCell(targetKey);
        this.updateLocalState();
      } else if (type === constants.FRAMEWORK_MESSAGE_COMPONENT_ITEM_WAS_DROPPED) {
        const { destination, source } = payload;
        if (destination.key && source) {
          const newKey = this.pageComposerManager.placeNewComponent(destination.key, source);
          this.pageComposerManager.selectCell(newKey);
          this.updateLocalState(true);
        }
      }
    }
  };

  handlePageTreeItemClick = (key) => {
    this.pageComposerManager.selectCell(key);
    this.updateLocalState();
  };

  handlePageTreeItemDrop = (data) => {
    const { destination, source } = data;
    if (destination.key && source) {
      const newKey = this.pageComposerManager.placeNewComponent(destination.key, source);
      this.pageComposerManager.selectCell(newKey);
      this.updateLocalState(true);
    }
  };

  handleEditComponentInstanceDialogOpen = () => {
    this.setState({
      isEditComponentInstanceDialogOpen: true
    });
  };

  handleEditComponentInstanceDialogClose = () => {
    this.setState({
      isEditComponentInstanceDialogOpen: false
    });
  };

  handleEditComponentInstanceDialogSubmit = ({componentInstance, initialState}) => {
    const { selectedCellKey, selectedComponentName } = this.state;
    if (selectedCellKey && selectedComponentName) {
      this.pageComposerManager.renameComponentInstance(
        selectedCellKey, componentInstance, initialState
      );
      this.pageComposerManager.selectCell(selectedCellKey);
      this.updateLocalState(true);
    }
    this.handleEditComponentInstanceDialogClose();
  };

  handleDeleteComponentInstance = () => {
    const { selectedCellKey, selectedComponentName } = this.state;
    if (selectedCellKey && selectedComponentName) {
      // we have to send message to clear the page selections before we delete
      this.handleSendMessage({
        type: constants.WEBCODESK_MESSAGE_DELETE_PAGE_COMPONENT,
      });
      this.pageComposerManager.deleteComponentInstance(selectedCellKey);
      this.updateLocalState(true);
    }
  };

  handleChangeMetaData = (metaData) => {
    this.pageComposerManager.setMetaData(metaData);
    this.updateLocalState(true);
  };

  handleToggleTreeView = () => {
    this.setState({
      showTreeView: !this.state.showTreeView,
    });
  };

  handleSplitterOnDragStarted = () => {
    this.setState({
      showPanelCover: true,
    });
  };

  handleSplitterOnDragFinished = () => {
    this.setState({
      showPanelCover: false,
    });
  };

  handleToggleWidth = (width) => () => {
    this.setState({
      iFrameWidth: width,
    });
  };

  handleSearchRequest = (text) => () => {
    this.props.onSearchRequest(text);
  };

  handleErrorClick = (messages) => {
    this.props.onErrorClick(messages);
  };

  handleUndo = () => {
    this.props.onUndo();
  };

  handleChangeStructureTab = (event, value) => {
    this.setState({
      structureTabActiveIndex: value,
    });
  };

  handleOpenComponent = () => {
    this.props.onOpenComponent(this.state.selectedComponentName);
  };

  render () {
    if (!this.pageComposerManager) {
      return (
        <h1>Empty page components tree</h1>
      );
    }
    const {
      isEditComponentInstanceDialogOpen,
      selectedComponentInstance,
      selectedComponentName,
      selectedInitialState,
      showTreeView,
      showPanelCover,
      localComponentsTree,
      localMetaData,
      isDevToolsOpen,
      recentUpdateHistory,
      iFrameWidth,
      structureTabActiveIndex,
    } = this.state;
    const { classes, draggedItem, updateHistory, serverPort, hasErrors } = this.props;
    let selectedComponentTitle = '';
    const selectedComponentTitleParts =
      selectedComponentName ? selectedComponentName.split(constants.MODEL_KEY_SEPARATOR) :null;
    if (selectedComponentTitleParts && selectedComponentTitleParts.length > 0) {
      selectedComponentTitle = selectedComponentTitleParts[selectedComponentTitleParts.length - 1];
    }
    return (
        <div className={classes.root}>
          <div className={classes.topPane}>
            <CommonToolbar disableGutters={true} dense="true">
              <ToolbarButton
                switchedOn={showTreeView}
                onClick={this.handleToggleTreeView}
                title="Structure"
                iconType="FormatAlignRight"
                tooltip={showTreeView
                  ? 'Close page tree structure'
                  : 'Open page tree structure'
                }
                error={hasErrors}
              />
              <CommonToolbarDivider />
              <ToolbarButton
                iconType="Search"
                disabled={!selectedComponentInstance}
                title="Search"
                tooltip="Find component instance in the project"
                menuItems={[
                  {
                    label: `By instance: "${selectedComponentInstance}"`,
                    onClick: this.handleSearchRequest(selectedComponentInstance)
                  },
                  {
                    label: `By class: "${selectedComponentTitle}"`,
                    onClick: this.handleSearchRequest(selectedComponentTitle)
                  }
                ]}
              />
              <ToolbarButton
                iconType="CropOriginal"
                disabled={!selectedComponentInstance}
                onClick={this.handleOpenComponent}
                title="Component"
                tooltip="Open the component view in new tab"
              />
              <ToolbarButton
                iconType="Edit"
                disabled={!selectedComponentInstance}
                onClick={this.handleEditComponentInstanceDialogOpen}
                title="Edit Instance"
                tooltip="Edit the selected component instance"
              />
              <ToolbarButton
                iconType="Undo"
                disabled={recentUpdateHistory.length === 0}
                onClick={this.undoUpdateLocalState}
                title="Undo"
                tooltip="Undo the last recent change on the page"
              />
              <ToolbarButton
                iconType="Delete"
                iconColor="#E53935"
                disabled={!selectedComponentInstance}
                onClick={this.handleDeleteComponentInstance}
                title="Delete"
                tooltip="Remove the selected component instance from the page"
              />
              <CommonToolbarDivider />
              <ToolbarButton
                iconType="Cached"
                disabled={!updateHistory || updateHistory.length === 0}
                onClick={this.handleUndo}
                title="Last Saved"
                tooltip="Restore the last saving"
              />
              <ToolbarButton
                iconType="Save"
                iconColor="#4caf50"
                onClick={this.sendUpdate}
                title="Save"
                switchedOn={recentUpdateHistory.length > 0}
                disabled={recentUpdateHistory.length === 0}
                tooltip="Save all recent changes"
              />
              {/*<ToolbarAutotimerButton*/}
                {/*updateCounter={sendUpdateCounter}*/}
                {/*switchedOn={sendUpdateCounter > 0}*/}
                {/*seconds={5}*/}
                {/*onClick={this.sendUpdate}*/}
                {/*onFireTimer={this.sendUpdate}*/}
                {/*title="Save"*/}
                {/*tooltip="The saving occurs in 5 seconds after the last change"*/}
              {/*/>*/}
              <CommonToolbarDivider />
              <ToolbarButton
                iconType="Refresh"
                onClick={this.handleReload}
                tooltip="Reload the entire page"
              />
              <ToolbarButton
                iconType="BugReport"
                switchedOn={isDevToolsOpen}
                onClick={this.handleToggleDevTools}
                tooltip={isDevToolsOpen ? 'Close DevTools window' : 'Open DevTools window'}
              />
              <CommonToolbarDivider />
              <ToolbarButton
                iconType="SettingsOverscan"
                switchedOn={iFrameWidth === constants.MEDIA_QUERY_WIDTH_AUTO_NAME}
                onClick={this.handleToggleWidth(constants.MEDIA_QUERY_WIDTH_AUTO_NAME)}
                tooltip="100% width viewport"
              />
              <ToolbarButton
                iconType="DesktopMac"
                switchedOn={iFrameWidth === constants.MEDIA_QUERY_WIDTH_DESKTOP_NAME}
                onClick={this.handleToggleWidth(constants.MEDIA_QUERY_WIDTH_DESKTOP_NAME)}
                tooltip="Desktop width viewport"
              />
              <ToolbarButton
                iconType="TabletMac"
                switchedOn={iFrameWidth === constants.MEDIA_QUERY_WIDTH_TABLET_NAME}
                onClick={this.handleToggleWidth(constants.MEDIA_QUERY_WIDTH_TABLET_NAME)}
                tooltip="Tablet width viewport"
              />
              <ToolbarButton
                iconType="PhoneIphone"
                switchedOn={iFrameWidth === constants.MEDIA_QUERY_WIDTH_MOBILE_NAME}
                onClick={this.handleToggleWidth(constants.MEDIA_QUERY_WIDTH_MOBILE_NAME)}
                tooltip="Mobile width viewport"
              />
            </CommonToolbar>
          </div>
          <div className={classes.centralPane}>
            <SplitPane
              split="vertical"
              defaultSize={250}
              onDragStarted={this.handleSplitterOnDragStarted}
              onDragFinished={this.handleSplitterOnDragFinished}
              pane1Style={{display: showTreeView ? 'block' : 'none'}}
              resizerStyle={{display: showTreeView ? 'block' : 'none'}}
            >
              <div className={classes.leftPane} style={{overflow: 'auto'}}>
                <CommonTabs
                  value={structureTabActiveIndex}
                  indicatorColor="primary"
                  textColor="primary"
                  fullWidth={true}
                  onChange={this.handleChangeStructureTab}
                >
                  <CommonTab label="Structure"/>
                  <CommonTab label="Meta" disabled={true} />
                </CommonTabs>
                {structureTabActiveIndex === 0 && (
                  <PageTree
                    componentsTree={localComponentsTree}
                    onItemClick={this.handlePageTreeItemClick}
                    onItemDrop={this.handlePageTreeItemDrop}
                    onItemErrorClick={this.handleErrorClick}
                    draggedItem={
                      !!draggedItem &&
                      (draggedItem.type === constants.GRAPH_MODEL_COMPONENT_TYPE
                        || draggedItem.type === constants.GRAPH_MODEL_COMPONENT_INSTANCE_TYPE)
                        ? draggedItem : null
                    }
                  />
                )}
                {structureTabActiveIndex === 1 && (
                  <PageMetaData
                    metaData={localMetaData}
                    onChangeMetaData={this.handleChangeMetaData}
                  />
                )}
              </div>
              <div className={classes.root}>
                {showPanelCover && (
                  <div className={classes.root} style={{zIndex: 10}} />
                )}
                {serverPort > 0 && (
                  <IFrame
                    ref={this.iFrameRef}
                    width={iFrameWidth}
                    url={`http://localhost:${serverPort}/webcodesk__page_composer`}
                    onIFrameReady={this.handleIFrameReady}
                    onIFrameMessage={this.handleIFrameMessage}
                    onDevToolClosedManually={this.handleDevToolsCloseManually}
                  />
                )}
              </div>
            </SplitPane>
          </div>
          <EditComponentInstanceDialog
            componentInstance={selectedComponentInstance}
            onClose={this.handleEditComponentInstanceDialogClose}
            onSubmit={this.handleEditComponentInstanceDialogSubmit}
            isOpen={isEditComponentInstanceDialogOpen}
            initialState={selectedInitialState ? selectedInitialState : null}
          />
        </div>
    );
  }
}

export default withStyles(styles)(PageComposer);
