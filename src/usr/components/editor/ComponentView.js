import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import SplitPane from 'react-split-pane';
import constants from '../../commons/constants';
import { CommonToolbar, CommonToolbarDivider, CommonTab, CommonTabs } from '../commons/Commons.parts';
import IFrame from './IFrame';
import ComponentVariantsList from './ComponentVariantsList';
import ComponentDescription from '../commons/ComponentDescription';
import ToolbarButton from '../commons/ToolbarButton';
import EventsLogViewer from './EventsLogViewer';
import SourceCodeEditor from '../commons/SourceCodeEditor';

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
  },
  topPane: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '39px',
    right: 0,
    minWidth: '800px'
  },
  leftPane: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
  }
});

const createNewState = (data, activeListItemIndex = 0) => {
  let storyIndex = activeListItemIndex;
  if (storyIndex > 0) {
    if (data.componentStoriesList.length > 0) {
      if (storyIndex > data.componentStoriesList.length) {
        storyIndex = data.componentStoriesList.length;
      }
    } else {
      storyIndex = 0;
    }
  }
  const eventProperties = [];
  if (data.properties && data.properties.length > 0) {
    data.properties.forEach(property => {
      if (property.type === constants.GRAPH_MODEL_COMPONENT_PROPERTY_FUNCTION_TYPE) {
        eventProperties.push(property);
      }
    });
  }
  if (storyIndex === 0) {
    return {
      activeListItemIndex: storyIndex,
      iFrameMessage: {
        type: constants.WEBCODESK_MESSAGE_COMPONENT_RESOURCE_INDEX,
        payload: {
          componentName: data.componentName,
          properties: eventProperties,
        },
      }
    };
  } else {
    return {
      activeListItemIndex: storyIndex,
      iFrameMessage: {
        type: constants.WEBCODESK_MESSAGE_COMPONENT_STORY_RESOURCE_INDEX,
        payload: {
          componentName: `${data.componentStoriesName}[${storyIndex - 1}]`,
          properties: eventProperties,
        },
      }
    };
  }
};

class ComponentView extends React.Component {
  static propTypes = {
    data: PropTypes.object,
    serverPort: PropTypes.number,
    sourceCode: PropTypes.string,
    isVisible: PropTypes.bool,
    onPublish: PropTypes.func,
    onSaveChanges: PropTypes.func,
  };

  static defaultProps = {
    data: {},
    serverPort: -1,
    sourceCode: '',
    isVisible: true,
    onPublish: () => {
      console.info('ComponentView.onPublish is not set');
    },
    onSaveChanges: () => {
      console.info('ComponentView.onSaveChanges is not set');
    },
  };

  constructor (props) {
    super(props);
    this.iFrameRef = React.createRef();
    this.state = {
      isDevToolsOpen: false,
      activeListItemIndex: 0,
      iFrameReadyCounter: 0,
      showPanelCover: false,
      showInfoView: true,
      infoTabActiveIndex: 0,
      iFrameWidth: 'auto',
      lastDebugMsg: null,
      isSourceCodeOpen: false,
      localSourceCode: this.props.sourceCode,
      sourceCodeUpdateCounter: 0,
    };
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    const { data, isVisible, sourceCode } = this.props;
    const { activeListItemIndex, isDevToolsOpen, iFrameReadyCounter, sourceCodeUpdateCounter } = this.state;
    if (prevProps.isVisible !== isVisible) {
      if (!isVisible && isDevToolsOpen) {
        this.handleCloseDevTools();
        this.setState({
          isDevToolsOpen: false,
        });
      }
      if (!isVisible && sourceCodeUpdateCounter > 0) {
        this.handleSaveChanges();
      }
    }
    if (sourceCode !== prevProps.sourceCode && sourceCodeUpdateCounter === 0) {
      this.setState({
        localSourceCode: sourceCode
      });
    }
    if (iFrameReadyCounter > 0 && (data !== prevProps.data
      || activeListItemIndex !== prevState.activeListItemIndex
      || iFrameReadyCounter !== prevState.iFrameReadyCounter)) {
      const newState = createNewState(data, activeListItemIndex);
      this.setState({
        activeListItemIndex: newState.activeListItemIndex,
      });
      this.handleSendMessage(newState.iFrameMessage);
      this.handleSendMessage({
        type: constants.WEBCODESK_MESSAGE_START_LISTENING_TO_FRAMEWORK
      });
    }
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    const { data, isVisible, serverPort, sourceCode } = this.props;
    const {
      activeListItemIndex,
      isDevToolsOpen,
      iFrameReadyCounter,
      showPanelCover,
      showInfoView,
      infoTabActiveIndex,
      iFrameWidth,
      lastDebugMsg,
      isSourceCodeOpen,
      sourceCodeUpdateCounter,
      localSourceCode
    } = this.state;
    return activeListItemIndex !== nextState.activeListItemIndex
      || isDevToolsOpen !== nextState.isDevToolsOpen
      || iFrameReadyCounter !== nextState.iFrameReadyCounter
      || showPanelCover !== nextState.showPanelCover
      || showInfoView !== nextState.showInfoView
      || infoTabActiveIndex !== nextState.infoTabActiveIndex
      || iFrameWidth !== nextState.iFrameWidth
      || lastDebugMsg !== nextState.lastDebugMsg
      || isSourceCodeOpen !== nextState.isSourceCodeOpen
      || sourceCodeUpdateCounter !== nextState.sourceCodeUpdateCounter
      || localSourceCode !== nextState.localSourceCode
      || data !== nextProps.data
      || serverPort !== nextProps.serverPort
      || isVisible !== nextProps.isVisible
      || sourceCode !== nextProps.sourceCode;
  }

  handleIFrameReady = () => {
    this.setState({
      iFrameReadyCounter: this.state.iFrameReadyCounter + 1,
    });
  };

  handleToggleDevTools = (event) => {
    const { isDevToolsOpen } = this.state;
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

  handleSendMessage = (message) => {
    if (this.iFrameRef.current) {
      this.iFrameRef.current.sendMessage(message);
    }
  };

  handleFrameworkMessage = (message) => {
    if (message) {
      const { type, payload } = message;
      if (type === constants.FRAMEWORK_MESSAGE_DEBUG) {
        this.setState({
          lastDebugMsg: payload,
        });
      }
    }
  };

  handleReload = () => {
    this.iFrameRef.current.reloadPage();
  };

  handleToggleInfoView = () => {
    this.setState({
      showInfoView: !this.state.showInfoView,
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

  handleChangeInfoTab = (event, value) => {
    this.setState({
      infoTabActiveIndex: value,
    });
  };

  handleChangeVariantIndex = (index) => {
    this.setState({
      activeListItemIndex: index,
    });
  };

  handleToggleWidth = (width) => () => {
    this.setState({
      iFrameWidth: width,
    });
  };

  handlePublish = () => {
    this.iFrameRef.current.capturePage(image => {
      const { data, onPublish } = this.props;
      onPublish({ data, image });
    });
  };

  handleToggleSourceCode = () => {
    this.setState({
      isSourceCodeOpen: !this.state.isSourceCodeOpen,
    });
  };

  handleChangeSourceCode = ({script, hasErrors}) => {
    this.setState({
      localSourceCode: script,
      sourceCodeUpdateCounter: this.state.sourceCodeUpdateCounter + 1
    });
  };

  handleSaveChanges = () => {
    this.props.onSaveChanges(this.state.localSourceCode);
    this.setState({
      sourceCodeUpdateCounter: 0
    });
  };

  render () {
    const { classes, data, serverPort } = this.props;
    const {
      isDevToolsOpen,
      showInfoView,
      showPanelCover,
      infoTabActiveIndex,
      lastDebugMsg,
      isSourceCodeOpen,
      localSourceCode,
      sourceCodeUpdateCounter
    } = this.state;
    const { activeListItemIndex, iFrameWidth } = this.state;
    return (
      <div className={classes.root}>
        <div className={classes.topPane}>
          {!isSourceCodeOpen
            ? (
              <CommonToolbar disableGutters={true} dense="true">
                <ToolbarButton
                  iconType="LibraryBooks"
                  switchedOn={showInfoView}
                  onClick={this.handleToggleInfoView}
                  title="Stories"
                  tooltip={showInfoView
                    ? 'Close component stories and information'
                    : 'Open component stories and information'
                  }
                />
                <CommonToolbarDivider/>
                <ToolbarButton
                  iconType="CloudUpload"
                  title="Publish"
                  onClick={this.handlePublish}
                  tooltip="Publish component to the market"
                />
                <CommonToolbarDivider/>
                <ToolbarButton
                  iconType="Edit"
                  title="Source Code"
                  onClick={this.handleToggleSourceCode}
                  tooltip="Switch to the source code editor"
                />
                <CommonToolbarDivider/>
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
                <CommonToolbarDivider/>
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
            )
            : (
              <CommonToolbar disableGutters={true} dense="true">
                <ToolbarButton
                  iconType="ArrowBack"
                  title="Component View"
                  onClick={this.handleToggleSourceCode}
                  tooltip="Switch to the component view"
                />
                <CommonToolbarDivider/>
                <ToolbarButton
                  iconType="Save"
                  iconColor="#4caf50"
                  title="Save Changes"
                  onClick={this.handleSaveChanges}
                  tooltip="Save recent changes"
                  switchedOn={sourceCodeUpdateCounter > 0}
                  disabled={sourceCodeUpdateCounter === 0}
                />
              </CommonToolbar>
            )
          }
        </div>
        <div className={classes.centralPane}>
          {!isSourceCodeOpen
            ? (
              <SplitPane
                key="storiesViewSplitter"
                split="vertical"
                defaultSize={250}
                onDragStarted={this.handleSplitterOnDragStarted}
                onDragFinished={this.handleSplitterOnDragFinished}
                pane1Style={{ display: showInfoView ? 'block' : 'none' }}
                resizerStyle={{ display: showInfoView ? 'block' : 'none' }}
              >
                <div className={classes.leftPane} style={{ overflow: 'auto' }}>
                  <CommonTabs
                    value={infoTabActiveIndex}
                    indicatorColor="primary"
                    textColor="primary"
                    fullWidth={true}
                    onChange={this.handleChangeInfoTab}
                  >
                    <CommonTab label="About"/>
                    <CommonTab label="Stories"/>
                  </CommonTabs>
                  {infoTabActiveIndex === 0 && (
                    <ComponentDescription
                      displayName={data.displayName}
                      comments={data.comments}
                      properties={data.properties}
                    />
                  )}
                  {infoTabActiveIndex === 1 && (
                    <ComponentVariantsList
                      variants={data.componentStoriesList}
                      selectedIndex={activeListItemIndex}
                      onChangeSelected={this.handleChangeVariantIndex}
                    />
                  )}
                </div>
                <div className={classes.root}>
                  <SplitPane
                    key="actionsLogViewSplitter"
                    split="horizontal"
                    defaultSize={150}
                    primary="second"
                    onDragStarted={this.handleSplitterOnDragStarted}
                    onDragFinished={this.handleSplitterOnDragFinished}
                  >
                    <div className={classes.root}>
                      {showPanelCover && (
                        <div className={classes.root} style={{ zIndex: 10 }}/>
                      )}
                      {serverPort > 0 && (
                        <IFrame
                          ref={this.iFrameRef}
                          width={iFrameWidth}
                          url={`http://localhost:${serverPort}/webcodesk__component_view`}
                          onIFrameReady={this.handleIFrameReady}
                          onDevToolClosedManually={this.handleDevToolsCloseManually}
                          onIFrameMessage={this.handleFrameworkMessage}
                        />
                      )}
                    </div>
                    <div className={classes.root}>
                      <EventsLogViewer lastRecord={lastDebugMsg}/>
                    </div>
                  </SplitPane>
                </div>
              </SplitPane>
            )
            : (
              <SourceCodeEditor
                isVisible={true}
                data={{script: localSourceCode}}
                onChange={this.handleChangeSourceCode}
              />
            )
          }
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(ComponentView);
