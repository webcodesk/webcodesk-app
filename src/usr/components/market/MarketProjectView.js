import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import SplitPane from 'react-split-pane';
import ToolbarButton from '../commons/ToolbarButton';
import {
  MarketBoardToolbarPanel,
  MarketBoardToolbar,
} from '../commons/Market.parts';
import MarketGroupGrid from '../market/MarketGroupGrid';
import MarketProjectTreeView from '../market/MarketProjectTreeView';
import MarketLoadingPopover from './MarketLoadingPopover';
import MarketErrorPopover from './MarketErrorPopover';
import ComponentCard from "../commons/ComponentCard";
import FunctionsCard from "../commons/FunctionsCard";
import { CommonToolbarDivider } from '../commons/Commons.parts';
import ResourceIcon from '../commons/ResourceIcon';
import constants from '../../commons/constants';
import { cutText } from '../commons/utils';
import MarketComponentDetails from "./MarketComponentDetails";

const styles = theme => ({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  left: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  central: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  centralTopPane: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '39px',
    right: 0,
    minWidth: '1100px'
  },
  centralContentPane: {
    position: 'absolute',
    top: '40px',
    left: 0,
    bottom: 0,
    right: 0,
    overflow: 'auto',
  },
  leftTopPane: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '39px',
    right: 0,
  },
  leftContentPane: {
    position: 'absolute',
    top: '40px',
    left: 0,
    bottom: 0,
    right: 0,
    overflow: 'auto',
  },
  titleIcon: {
    display: 'flex',
    marginRight: '8px',
    marginLeft: '16px',
    whiteSpace: 'nowrap'
  },
  titleLabel: {
    marginRight: '16px',
    marginLeft: 0,
    whiteSpace: 'nowrap'
  }
});

class MarketProjectView extends React.Component {
  static propTypes = {
    isLoading: PropTypes.bool,
    error: PropTypes.string,
    selectedProject: PropTypes.object,
    onClose: PropTypes.func,
    onBack: PropTypes.func,
    onSelectProjectItem: PropTypes.func,
    onInstall: PropTypes.func,
    onOpenUrl: PropTypes.func,
  };

  static defaultProps = {
    isLoading: false,
    error: '',
    selectedProject: {},
    onClose: () => {
      console.info('MarketProjectView.onClose is not set');
    },
    onBack: () => {
      console.info('MarketProjectView.onBack is not set');
    },
    onSelectProjectItem: () => {
      console.info('MarketProjectView.onSelectProjectItem is not set');
    },
    onInstall: () => {
      console.info('MarketProjectView.onInstall is not set');
    },
    onOpenUrl: () => {
      console.info('MarketProjectView.onOpenUrl is not set');
    },
  };

  handleClose = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onClose();
  };

  handleBack = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onBack();
  };

  handleSelectProjectItem = (projectData, groupName, componentId) => {
    this.props.onSelectProjectItem(projectData, groupName, componentId);
  };

  handleSelectProjectItemInCard = (projectData, groupName, componentId) => (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onSelectProjectItem(projectData, groupName, componentId);
  };

  handleInstall = (selectedItemData) => (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onInstall(selectedItemData);
  };

  handleInstallSelected = e => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onInstall(this.props.selectedProject.selectedItemData);
  };

  handleOpenSourceCode = (url) => (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onOpenUrl(url);
  };

  handleOpenLiveDemo = (url) => (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onOpenUrl(url);
  };

  render () {
    const {classes, selectedProject, isLoading, error} = this.props;
    const {
      projectData,
      selectedItemData
    } = selectedProject;
    const {projectId, projectName, groupName, componentId, componentName, componentType, readmeText} = selectedItemData;
    let selectedTitle;
    let selectedIconTitle;
    if (componentId) {
      selectedTitle = componentName;
      selectedIconTitle = componentType === 'component'
        ? constants.GRAPH_MODEL_COMPONENT_TYPE
        : constants.GRAPH_MODEL_USER_FUNCTION_TYPE;
    } else if (groupName) {
      selectedTitle = groupName;
      selectedIconTitle = constants.GRAPH_MODEL_DIR_TYPE;
    } else if (projectId) {
      selectedTitle = projectName;
      selectedIconTitle = constants.MARKET_PROJECT_TYPE;
    }
    let selectedComponents = selectedItemData.components || [];
    return (
      <SplitPane
        split="vertical"
        minSize={200}
        defaultSize={200}
      >
        <div className={classes.left}>
          <div className={classes.leftTopPane}>
            <MarketBoardToolbarPanel>
              <MarketBoardToolbar disableGutters={true} dense="true">
                <ToolbarButton
                  iconType="ArrowBack"
                  onClick={this.handleBack}
                  title="Back to search"
                  tooltip="Back to the previous search results"
                />
                <ToolbarButton
                  iconType="Close"
                  onClick={this.handleClose}
                  title="Close"
                  tooltip="Close"
                />
              </MarketBoardToolbar>
            </MarketBoardToolbarPanel>
          </div>
          <div className={classes.leftContentPane}>
            <MarketProjectTreeView
              selectedItem={selectedItemData}
              treeData={projectData}
              onSelectItem={this.handleSelectProjectItem}
            />
          </div>
        </div>
        <div className={classes.central}>
          <div className={classes.centralTopPane}>
            <MarketBoardToolbarPanel>
              <MarketBoardToolbar disableGutters={true} dense="true">
                <div className={classes.titleIcon}>
                  <ResourceIcon
                    resourceType={selectedIconTitle}
                  />
                </div>
                <div className={classes.titleLabel}>
                  <Typography
                    variant="body1"
                  >
                    {cutText(selectedTitle, 120)}
                  </Typography>
                </div>
                <CommonToolbarDivider/>
                  <ToolbarButton
                    primary={true}
                    iconType="CloudDownload"
                    onClick={this.handleInstallSelected}
                    title="Install Selected"
                  />
                  {projectData.repoUrl && (
                    <ToolbarButton
                      iconType="OpenInNew"
                      onClick={this.handleOpenSourceCode(projectData.repoUrl)}
                      title="Source Code"
                    />
                  )}
                  {projectData.demoUrl && (
                    <ToolbarButton
                      iconType="DesktopMac"
                      onClick={this.handleOpenLiveDemo(projectData.demoUrl)}
                      title="Live Demo"
                    />
                  )}
              </MarketBoardToolbar>
            </MarketBoardToolbarPanel>
          </div>
          <div className={classes.centralContentPane}>
            <div style={{ position: 'relative', padding: '16px', backgroundColor: '#ffffff' }}>
              {isLoading && <MarketLoadingPopover />}
              {error && <MarketErrorPopover error={error} />}
              {selectedComponents.length === 1
                ? (
                  <MarketComponentDetails
                    title={selectedComponents[0].name}
                    description={selectedComponents[0].description}
                    readmeText={readmeText}
                    imageSrc={
                      selectedComponents[0].type === 'component' &&
                      constants.URL_WEBCODESK_SERVICE +
                      '/storage/' +
                      projectData.owner.userId + '/' +
                      projectData.name + '/' +
                      selectedComponents[0].group + '/' +
                      selectedComponents[0].name + '.tmb.png'
                    }
                    onInstall={this.handleInstallSelected}
                  />
                )
                  : (
                <MarketGroupGrid>
                  {selectedComponents.map(componentItem => {
                    const {type: componentType} = componentItem;
                    if (componentType === 'component') {
                      const imageUrl = constants.URL_WEBCODESK_SERVICE +
                        '/storage/' +
                        projectData.owner.userId + '/' +
                        projectData.name + '/' +
                        componentItem.group + '/' +
                        componentItem.name + '.tmb.png';
                      return (
                        <ComponentCard
                          key={componentItem.id}
                          content={componentItem.description}
                          imageSrc={imageUrl}
                          headerTitle={componentItem.name}
                          subheaderTitle={projectData.name}
                          hasActions={true}
                          downloadCount={componentItem.downloadCount}
                          license={projectData.license}
                          repoUrl={projectData.repoUrl}
                          demoUrl={projectData.demoUrl}
                          onClick={this.handleSelectProjectItemInCard(projectData, componentItem.group, componentItem.id)}
                          onInstall={this.handleInstall({
                            userId: projectData.owner.userId,
                            projectId: projectData.projectId,
                            projectName: projectData.name,
                            groupName: componentItem.group,
                            componentId: componentItem.id,
                            componentName: componentItem.name
                          })}
                          onOpenSourceCode={this.handleOpenSourceCode(projectData.repoUrl)}
                          onOpenLiveDemo={this.handleOpenLiveDemo(projectData.demoUrl)}
                        />
                      );
                    } else if (componentType === 'functions') {
                      return (
                        <FunctionsCard
                          key={componentItem.id}
                          content={componentItem.description}
                          headerTitle={componentItem.name}
                          subheaderTitle={projectData.name}
                          hasActions={true}
                          downloadCount={componentItem.downloadCount}
                          license={projectData.license}
                          repoUrl={projectData.repoUrl}
                          demoUrl={projectData.demoUrl}
                          onClick={this.handleSelectProjectItemInCard(projectData, componentItem.group, componentItem.id)}
                          onInstall={this.handleInstall({
                            userId: projectData.owner.userId,
                            projectId: projectData.projectId,
                            projectName: projectData.name,
                            groupName: componentItem.group,
                            componentId: componentItem.id,
                            componentName: componentItem.name
                          })}
                          onOpenSourceCode={this.handleOpenSourceCode(projectData.repoUrl)}
                          onOpenLiveDemo={this.handleOpenLiveDemo(projectData.demoUrl)}
                        />
                      )
                    }
                    return null
                  })}
                </MarketGroupGrid>
                )
              }
            </div>
          </div>
        </div>
      </SplitPane>
    );
  }
}

export default withStyles(styles)(MarketProjectView);
