import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Slide from '@material-ui/core/Slide';
import { FullScreenDialog } from '../commons/Commons.parts';
import MarketProjectView from '../market/MarketProjectView';
import MarketSearchView from '../market/MarketSearchView';

function Transition (props) {
  return <Slide direction="up" {...props} />;
}

const styles = theme => ({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
});

class MarketBoardDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    isLoading: PropTypes.bool,
    error: PropTypes.string,
    searchTagsList: PropTypes.array,
    componentsList: PropTypes.array,
    selectedProject: PropTypes.object,
    onClose: PropTypes.func,
    onSearch: PropTypes.func,
    onBackToSearch: PropTypes.func,
    onSelectProject: PropTypes.func,
    onSelectProjectItem: PropTypes.func,
    onInstall: PropTypes.func,
    onOpenUrl: PropTypes.func,
  };

  static defaultProps = {
    isOpen: false,
    isLoading: false,
    error: '',
    searchTagsList: [],
    componentsList: [],
    selectedProject: null,
    onClose: () => {
      console.info('MarketBoardDialog.onClose is not set');
    },
    onSearch: () => {
      console.info('MarketBoardDialog.onSearch is not set');
    },
    onBackToSearch: () => {
      console.info('MarketBoardDialog.onBackToSearch is not set');
    },
    onSelectProject: () => {
      console.info('MarketBoardDialog.onSelectProject is not set');
    },
    onSelectProjectItem: () => {
      console.info('MarketBoardDialog.onSelectProjectItem is not set');
    },
    onInstall: () => {
      console.info('MarketBoardDialog.onInstall is not set');
    },
    onOpenUrl: () => {
      console.info('MarketBoardDialog.onOpenUrl is not set');
    },
  };

  constructor (props) {
    super(props);
    this.state = {
      searchValues: [],
      searchLang: 'javascript'
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { isOpen } = this.props;
    if (isOpen && !prevProps.isOpen) {
      const {searchValues, searchLang} = this.state;
      this.handleOpen({searchValues, searchLang});
    }
  }

  handleOpen = ({searchValues, searchLang}) => {
    const validSearchValues = searchValues.filter(i => i && i.value);
    let searchText;
    if (validSearchValues && validSearchValues.length > 0) {
      searchText = validSearchValues.map(i => i.value).join(' ');
    }
    this.props.onSearch({searchText, searchLang});
  };

  handleClose = () => {
    this.props.onClose(false);
  };

  handleChangeLang = (searchLang) => {
    this.setState({
      searchLang,
    });
    const {searchValues} = this.state;
    this.handleOpen({searchValues, searchLang});
  };

  handleSearch = (searchValues) => {
    this.setState({
      searchValues
    });
    const {searchLang} = this.state;
    this.handleOpen({searchValues, searchLang});
  };

  handleBackToSearch = () => {
    this.props.onBackToSearch();
  };

  handleSelectProject = (projectId, groupName, componentId) => {
    this.props.onSelectProject({projectId, groupName, componentId});
  };

  handleSelectProjectItem = (projectData, groupName, componentId) => {
    this.props.onSelectProjectItem({projectData, groupName, componentId});
  };

  handleInstall = (selectedItemData) => {
    this.props.onInstall(selectedItemData);
  };

  handleOpenUrl = (url) => {
    this.props.onOpenUrl(url);
  };

  render () {
    const { searchValues, searchLang } = this.state;
    const { classes, isOpen, isLoading, selectedProject, error, searchTagsList, componentsList } = this.props;
    return (
      <FullScreenDialog
        fullScreen={true}
        open={isOpen}
        onClose={this.handleClose}
        TransitionComponent={Transition}
      >
        <div className={classes.root}>
          {selectedProject
            ? (
              <MarketProjectView
                isLoading={isLoading}
                error={error}
                selectedProject={selectedProject}
                onClose={this.handleClose}
                onSelectProjectItem={this.handleSelectProjectItem}
                onBack={this.handleBackToSearch}
                onInstall={this.handleInstall}
                onOpenUrl={this.handleOpenUrl}
              />
            )
            : (
              <MarketSearchView
                isLoading={isLoading}
                error={error}
                searchLang={searchLang}
                searchValues={searchValues}
                searchTagsList={searchTagsList}
                componentsList={componentsList}
                onChangeLang={this.handleChangeLang}
                onSearch={this.handleSearch}
                onClose={this.handleClose}
                onSelectProject={this.handleSelectProject}
                onInstall={this.handleInstall}
                onOpenUrl={this.handleOpenUrl}
              />
            )
          }
        </div>
      </FullScreenDialog>
    );
  }
}

export default withStyles(styles)(MarketBoardDialog);
