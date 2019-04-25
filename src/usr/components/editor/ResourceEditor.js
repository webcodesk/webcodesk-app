import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Close from '@material-ui/icons/Close';
import {
  ResourceTab,
  ResourceTabCloseButton,
  ResourceTabs
} from './ResourceEditor.parts';
import ResourceIcon from '../commons/ResourceIcon';
import ComponentView from './ComponentView';
import LivePreview from './LivePreview';
import PageComposer from './PageComposer';
import FlowComposer from './FlowComposer';
import FunctionsFileView from './FunctionsFileView';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
  },
  contentPane: {
    position: 'absolute',
    top: '32px',
    bottom: 0,
    right: 0,
    left: 0,
  },
  emptyPane: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: '#f5f5f5',
  },
  welcomeTextBox: {
    alignText: 'center',
  },
  welcomeText: {
    color: '#777777',
    fontWeight: 'normal'
  },
  resourceTabLabel: { display: 'flex', alignItems: 'center' },
  resourceTabCloseBtn: { marginLeft: '7px' },
  resourceTabTextError: { color: '#D50000' },
  resourceTabTextStrike: {
    textDecoration: 'line-through'
  },
});

class ResourceEditor extends React.Component {
  static propTypes = {
    activeEditorTabIndex: PropTypes.number,
    resourceEditorTabs: PropTypes.array,
    draggedItem: PropTypes.object,
    updateResourceHistory: PropTypes.object,
    onChangeEditorTab: PropTypes.func,
    onCloseEditorTab: PropTypes.func,
    onUpdateEditorTab: PropTypes.func,
    onErrorClick: PropTypes.func,
    onSearchRequest: PropTypes.func,
    onUndoUpdateEditorTab: PropTypes.func,
    onOpenUrl: PropTypes.func,
    onExportApp: PropTypes.func,
    onPublish: PropTypes.func,
    onSaveSourceCode: PropTypes.func,
    onOpenResource: PropTypes.func,
  };

  static defaultProps = {
    activeEditorTabIndex: -1,
    resourceEditorTabs: [],
    draggedItem: null,
    updateResourceHistory: {},
    onChangeEditorTab: () => {
      console.info('ResourceEditor.onChangeEditorTab is not set');
    },
    onCloseEditorTab: () => {
      console.info('ResourceEditor.onCloseEditorTab is not set');
    },
    onUpdateEditorTab: () => {
      console.info('ResourceEditor.onUpdateEditorTab is not set');
    },
    onErrorClick: () => {
      console.info('ResourceEditor.onErrorClick is not set');
    },
    onSearchRequest: () => {
      console.info('ResourceEditor.onSearchRequest is not set');
    },
    onUndoUpdateEditorTab: () => {
      console.info('ResourceEditor.onUndoUpdateEditorTab is not set');
    },
    onOpenUrl: () => {
      console.info('ResourceEditor.onOpenUrl is not set');
    },
    onExportApp: () => {
      console.info('ResourceEditor.onExportApp is not set');
    },
    onPublish: () => {
      console.info('ResourceEditor.onPublish is not set');
    },
    onSaveSourceCode: () => {
      console.info('ResourceEditor.onSaveSourceCode is not set');
    },
    onOpenResource: () => {
      console.info('ResourceEditor.onOpenResource is not set');
    },
  };

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    const { activeEditorTabIndex, resourceEditorTabs, draggedItem, updateResourceHistory } = this.props;
    return activeEditorTabIndex !== nextProps.activeEditorTabIndex
      || resourceEditorTabs !== nextProps.resourceEditorTabs
      || draggedItem !== nextProps.draggedItem
      || updateResourceHistory !== nextProps.updateResourceHistory;
  }

  handleChangeTab = (event, tabIndex) => {
    this.props.onChangeEditorTab(tabIndex);
  };

  handleCloseTab = (tabIndex) => (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onCloseEditorTab(tabIndex);
  };

  handleUpdateTab = (tabIndex) => (newData) => {
    const { resourceEditorTabs } = this.props;
    const resourceTab = resourceEditorTabs[tabIndex];
    const newEditorTab = { resource: resourceTab.resourceObject, data: newData };
    this.props.onUpdateEditorTab(newEditorTab);
  };

  handleErrorClick = (messages) => {
    this.props.onErrorClick(messages);
  };

  handleSearchRequest = (text) => {
    this.props.onSearchRequest(text);
  };

  handleUndo = (tabIndex) => () => {
    const { resourceEditorTabs } = this.props;
    const resourceTab = resourceEditorTabs[tabIndex];
    this.props.onUndoUpdateEditorTab(resourceTab.resourceObject);
  };

  handleOpenUrl = (url) => {
    this.props.onOpenUrl(url);
  };

  handleExportApp = (helpers) => {
    this.props.onExportApp(helpers);
  };

  handlePublishComponent = ({data, image}) => {
    this.props.onPublish({resource: data, packageType: 'component', image});
  };

  handlePublishFunctions = ({data}) => {
    this.props.onPublish({resource: data, packageType: 'functions'});
  };

  handleSaveSourceCode = (tabIndex) => (newScript) => {
    const { resourceEditorTabs } = this.props;
    const resourceTab = resourceEditorTabs[tabIndex];
    const newEditorTab = { resource: resourceTab.resourceObject, script: newScript };
    this.props.onSaveSourceCode(newEditorTab);
  };

  handleOpenResource = (resourceKey) => {
    this.props.onOpenResource(resourceKey);
  };

  render () {
    const { classes, activeEditorTabIndex, resourceEditorTabs, draggedItem, updateResourceHistory } = this.props;
    const tabsAmount = resourceEditorTabs ? resourceEditorTabs.length : 0;
    if (tabsAmount === 0) {
      return (
        <div className={classes.root}>
          <div className={classes.emptyPane}>
            <div className={classes.welcomeTextBox}>
              <h3 className={classes.welcomeText}>Double click on item in the left panel to open</h3>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className={classes.root}>
        <ResourceTabs
          key={tabsAmount > 3 ? 'withScrollButtons' : 'withoutScrollButtons'}
          value={activeEditorTabIndex}
          onChange={this.handleChangeTab}
          indicatorColor="primary"
          textColor="primary"
          fullWidth={false}
          scrollable={tabsAmount > 3}
          scrollButtons={tabsAmount > 3 ? 'auto' : 'off'}
        >
          {resourceEditorTabs.map((resource, index) => {
            const { livePreviewObject, resourceObject } = resource;
            if (resourceObject) {
              let type = resourceObject.type;
              let title = resourceObject.title;
              let key = resourceObject.key;
              let textClassName = '';
              if (resourceObject.hasErrors) {
                textClassName = classes.resourceTabTextError;
              }
              if (resourceObject.isDisabled) {
                textClassName = ' ' + classes.resourceTabTextStrike;
              }
              return (
                <ResourceTab
                  component="div"
                  key={key}
                  icon={<ResourceIcon resourceType={type} isMuted={true}/>}
                  label={
                    <div className={classes.resourceTabLabel}>
                      <div className={textClassName}>{title}</div>
                      <div className={classes.resourceTabCloseBtn}>
                        <ResourceTabCloseButton onClick={this.handleCloseTab(index)}>
                          <Close color="disabled" fontSize="inherit"/>
                        </ResourceTabCloseButton>
                      </div>
                    </div>
                  }
                />
              );
            } else if (livePreviewObject) {
              let type = livePreviewObject.type;
              let title = livePreviewObject.title;
              let key = livePreviewObject.key;
              return (
                <ResourceTab
                  component="div"
                  key={key}
                  icon={<ResourceIcon resourceType={type} isMuted={true}/>}
                  label={
                    <div className={classes.resourceTabLabel}>
                      <div>{title}</div>
                      <div className={classes.resourceTabCloseBtn}>
                        <ResourceTabCloseButton onClick={this.handleCloseTab(index)}>
                          <Close color="disabled" fontSize="inherit"/>
                        </ResourceTabCloseButton>
                      </div>
                    </div>
                  }
                />
              );
            }
            return null;
          })}
        </ResourceTabs>
        {
          resourceEditorTabs.map((resource, index) => {
            const { livePreviewObject, resourceObject, projectSettingsObject, sourceCode } = resource;
            if (resourceObject) {
              if (resourceObject.isComponent) {
                return (
                  <div
                    key={resourceObject.key}
                    className={classes.contentPane}
                    style={{ display: index === activeEditorTabIndex ? 'block' : 'none' }}
                  >
                    <ComponentView
                      isVisible={index === activeEditorTabIndex}
                      data={resourceObject}
                      serverPort={projectSettingsObject.port}
                      onPublish={this.handlePublishComponent}
                      sourceCode={sourceCode}
                      onSaveChanges={this.handleSaveSourceCode(index)}
                    />
                  </div>
                );
              } else if (resourceObject.isPage) {
                return (
                  <div
                    key={resourceObject.key}
                    className={classes.contentPane}
                    style={{ display: index === activeEditorTabIndex ? 'block' : 'none' }}
                  >
                    <PageComposer
                      isVisible={index === activeEditorTabIndex}
                      draggedItem={draggedItem}
                      componentsTree={resourceObject.componentsTree}
                      metaData={resourceObject.metaData}
                      hasErrors={resourceObject.hasErrors}
                      updateHistory={updateResourceHistory[resourceObject.key]}
                      onUpdate={this.handleUpdateTab(index)}
                      onSearchRequest={this.handleSearchRequest}
                      onErrorClick={this.handleErrorClick}
                      onUndo={this.handleUndo(index)}
                      serverPort={projectSettingsObject.port}
                      onOpenComponent={this.handleOpenResource}
                    />
                  </div>
                );
              } else if (resourceObject.isFlow) {
                return (
                  <div
                    key={resourceObject.key}
                    className={classes.contentPane}
                    style={{ display: index === activeEditorTabIndex ? 'block' : 'none' }}
                  >
                    <FlowComposer
                      draggedItem={draggedItem}
                      updateHistory={updateResourceHistory[resourceObject.key]}
                      isVisible={index === activeEditorTabIndex}
                      flowTree={resourceObject.flowTree}
                      onUpdate={this.handleUpdateTab(index)}
                      onErrorClick={this.handleErrorClick}
                      onSearchRequest={this.handleSearchRequest}
                      onUndo={this.handleUndo(index)}
                      onOpen={this.handleOpenResource}
                    />
                  </div>
                );
              } else if (resourceObject.isFunctions) {
                return (
                  <div
                    key={resourceObject.key}
                    className={classes.contentPane}
                    style={{ display: index === activeEditorTabIndex ? 'block' : 'none' }}
                  >
                    <FunctionsFileView
                      isVisible={index === activeEditorTabIndex}
                      data={resourceObject}
                      onSearch={this.handleSearchRequest}
                      sourceCode={sourceCode}
                      onSaveChanges={this.handleSaveSourceCode(index)}
                      onPublish={this.handlePublishFunctions}
                    />
                  </div>
                );
              }
              return (
                <div key={resourceObject.key} className={classes.contentPane}>
                  <div style={{ padding: '1em' }}>
                    <pre>
                      {JSON.stringify(resourceObject.model, null, 4)}
                    </pre>
                  </div>
                </div>
              );
            } else if (livePreviewObject) {
              return (
                <div
                  key={livePreviewObject.key}
                  className={classes.contentPane}
                  style={{ display: index === activeEditorTabIndex ? 'block' : 'none' }}
                >
                  <LivePreview
                    isVisible={index === activeEditorTabIndex}
                    pages={livePreviewObject.pages}
                    serverPort={projectSettingsObject.port}
                    onOpenUrl={this.handleOpenUrl}
                    onSearchRequest={this.handleSearchRequest}
                    onExportApp={this.handleExportApp}
                  />
                </div>
              );
            }
            return null;
          })
        }
      </div>
    );
  }
}

export default withStyles(styles)(ResourceEditor);
