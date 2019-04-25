import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import SplitPane from 'react-split-pane';
import * as constants from '../../commons/constants';
import {CommonToolbarDivider} from '../commons/Commons.parts';
import ToolbarButton from '../commons/ToolbarButton';
import {
  MarketBoardToolbarPanel,
  MarketBoardToolbar,
} from '../commons/Market.parts';
import MarketGroupGrid from '../market/MarketGroupGrid';
import MarketFiltersPanel from './MarketFiltersPanel';
import MarketLoadingPopover from './MarketLoadingPopover';
import MarketErrorPopover from './MarketErrorPopover';
import MarketBoardPager from './MarketBoardPager';

import ComponentCard from "../commons/ComponentCard";
import FunctionsCard from "../commons/FunctionsCard";

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
    minWidth: '300px'
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
  foundTitleLabel: {
    marginRight: '16px',
    marginLeft: '16px',
    whiteSpace: 'nowrap'
  }
});

const ITEMS_PER_PAGE = 20;

class MarketSearchView extends React.Component {
  static propTypes = {
    isLoading: PropTypes.bool,
    error: PropTypes.string,
    searchLang: PropTypes.string,
    searchValues: PropTypes.array,
    searchTagsList: PropTypes.array,
    componentsList: PropTypes.array,
    onChangeLang: PropTypes.func,
    onSearch: PropTypes.func,
    onClose: PropTypes.func,
    onSelectProject: PropTypes.func,
    onInstall: PropTypes.func,
    onOpenUrl: PropTypes.func,
  };

  static defaultProps = {
    isLoading: false,
    error: '',
    searchLang: '',
    searchValues: [],
    searchTagsList: [],
    componentsList: [],
    onChangeLang: () => {
      console.info('MarketProjectView.onChangeLang is not set');
    },
    onSearch: () => {
      console.info('MarketProjectView.onSearch is not set');
    },
    onClose: () => {
      console.info('MarketProjectView.onClose is not set');
    },
    onSelectProject: () => {
      console.info('MarketProjectView.onSelectProject is not set');
    },
    onInstall: () => {
      console.info('MarketProjectView.onInstall is not set');
    },
    onOpenUrl: () => {
      console.info('MarketProjectView.onOpenUrl is not set');
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1,
    };
  }

  handleChangeLang = (searchLang) => {
    this.props.onChangeLang(searchLang);
  };

  handleSearch = (searchValues) => {
    this.props.onSearch(searchValues);
  };

  handleClose = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onClose();
  };

  handleSetPage = (newPage) => {
    this.setState({currentPage: newPage});
  };

  handleSelectProject = (projectId, groupName, componentId) => (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onSelectProject(projectId, groupName, componentId);
  };

  handleInstall = (selectedItemData) => (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onInstall(selectedItemData);
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

  render() {
    const {currentPage} = this.state;
    const {classes, isLoading, error, searchTagsList, componentsList, searchValues, searchLang} = this.props;
    const pagesCount = Math.ceil(componentsList.length / ITEMS_PER_PAGE);
    const pageComponentsList = componentsList.slice(
      (currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE
    );
    const validSearchValues = searchValues.filter(i => i && i.value);
    return (
      <SplitPane
        split="vertical"
        minSize={250}
        defaultSize={250}
      >
        <div className={classes.left}>
          <div className={classes.leftTopPane}>
            <MarketBoardToolbarPanel>
              <MarketBoardToolbar disableGutters={true} dense="true">
                <ToolbarButton
                  iconType="Close"
                  onClick={this.handleClose}
                  title="Close"
                />
              </MarketBoardToolbar>
            </MarketBoardToolbarPanel>
          </div>
          <div className={classes.leftContentPane}>
            <MarketFiltersPanel
              searchLang={searchLang}
              searchValues={searchValues}
              onChangeLang={this.handleChangeLang}
              onSearch={this.handleSearch}
              searchTagsList={searchTagsList}
            />
          </div>
        </div>
        <div className={classes.central}>
          <div className={classes.centralTopPane}>
            <MarketBoardToolbarPanel>
              <MarketBoardToolbar disableGutters={true} dense="true">
                <Typography className={classes.foundTitleLabel} variant="body1">
                  {validSearchValues && validSearchValues.length > 0
                    ? (
                      `Found ${componentsList.length}`
                    )
                    : (
                      'Top 20'
                    )
                  }

                </Typography>
                <CommonToolbarDivider/>
                <MarketBoardPager
                  currentPageValue={currentPage}
                  pagesNumber={pagesCount}
                  onChange={this.handleSetPage}
                />
              </MarketBoardToolbar>
            </MarketBoardToolbarPanel>
          </div>
          <div className={classes.centralContentPane}>
            <div style={{position: 'relative', padding: '16px', backgroundColor: '#ffffff'}}>
              {isLoading && <MarketLoadingPopover/>}
              {error && <MarketErrorPopover error={error}/>}
              <MarketGroupGrid>
                {pageComponentsList.map(componentItem => {
                  const {type: componentType} = componentItem;
                  if (componentType === 'component') {
                    const imageUrl = constants.URL_WEBCODESK_SERVICE +
                      '/storage/' +
                      componentItem.userId + '/' +
                      componentItem.projectName + '/' +
                      componentItem.componentGroup + '/' +
                      componentItem.componentName + '.tmb.png';
                    return (
                      <ComponentCard
                        content={componentItem.description}
                        imageSrc={imageUrl}
                        headerTitle={componentItem.componentName}
                        subheaderTitle={componentItem.projectName}
                        hasActions={true}
                        downloadCount={componentItem.downloadCount}
                        license={componentItem.license}
                        repoUrl={componentItem.repoUrl}
                        demoUrl={componentItem.demoUrl}
                        onInstall={this.handleInstall({
                          userId: componentItem.userId,
                          projectId: componentItem.projectId,
                          projectName: componentItem.projectName,
                          groupName: componentItem.componentGroup,
                          componentId: componentItem.componentId,
                          componentName: componentItem.componentName
                        })}
                        onClick={this.handleSelectProject(
                          componentItem.projectId, componentItem.componentGroup, componentItem.componentId
                        )}
                        onOpenSourceCode={this.handleOpenSourceCode(componentItem.repoUrl)}
                        onOpenLiveDemo={this.handleOpenLiveDemo(componentItem.demoUrl)}
                      />
                    );
                  } else if (componentType === 'functions') {
                    return (
                      <FunctionsCard
                        content={componentItem.description}
                        headerTitle={componentItem.componentName}
                        subheaderTitle={componentItem.projectName}
                        hasActions={true}
                        downloadCount={componentItem.downloadCount}
                        license={componentItem.license}
                        repoUrl={componentItem.repoUrl}
                        demoUrl={componentItem.demoUrl}
                        onInstall={this.handleInstall({
                          userId: componentItem.userId,
                          projectId: componentItem.projectId,
                          projectName: componentItem.projectName,
                          groupName: componentItem.componentGroup,
                          componentId: componentItem.componentId,
                          componentName: componentItem.componentName
                        })}
                        onClick={this.handleSelectProject(
                          componentItem.projectId, componentItem.componentGroup, componentItem.componentId
                        )}
                        onOpenSourceCode={this.handleOpenSourceCode(componentItem.repoUrl)}
                        onOpenLiveDemo={this.handleOpenLiveDemo(componentItem.demoUrl)}
                      />
                    )
                  }
                  return null;
                })}
              </MarketGroupGrid>
            </div>
          </div>
        </div>
      </SplitPane>
    );
  }
}

export default withStyles(styles)(MarketSearchView);
