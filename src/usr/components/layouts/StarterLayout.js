import React from 'react';
import PropTypes from 'prop-types';
import { withSnackbar } from 'notistack';
import { withStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import Close from '@material-ui/icons/Close';
import Folder from '@material-ui/icons/Folder';
import FolderOpen from '@material-ui/icons/FolderOpen';
import CreateNewFolder from '@material-ui/icons/CreateNewFolder';
import { Grid, Cell } from 'styled-css-grid';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import logoImage from '../../../icons/logo_color_150x150.png';
import * as constants from '../../commons/constants';
import { cutFilePath } from '../commons/utils';

const styles = theme => ({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    overflow: 'auto',
  },
  containerWrapper: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    width: '100%'
  },
  gridContainer: {
    width: '500px',
    padding: '10px',
  },
  gridContainerRecent: {
    width: '400px',
    padding: '0px',
    backgroundColor: '#f5f5f5',
  },
  divider: {
    marginTop: '1.5em',
    marginBottom: '0.5em'
  },
  logoBox: {
    width: '150px',
    height: '150px',
  },
  newButtonPane: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1em',
    alignItems: 'center',
    justifyContent: 'center'
  },
  recentItemText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '400px',
  },
  recentItem0: {
    color: '#fff',
    backgroundColor: '#3f51b5'
  },
  recentItem1: {
    color: '#fff',
    backgroundColor: '#5c6bc0'
  },
  recentItem2: {
    color: '#fff',
    backgroundColor: '#7986cb'
  },
  recentItem3: {
    color: '#fff',
    backgroundColor: '#9fa8da'
  },
  recentItem4: {
    color: '#fff',
    backgroundColor: '#c5cae9'
  },
  topPane: {
    height: '15%'
  },
  bottomPane: {
    height: '7em'
  }
});

export const RecentListItemText = withStyles(theme => ({
  primary: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }
}))(ListItemText);

class StarterLayout extends React.Component {
  static propTypes = {
    applicationInfo: PropTypes.object,
    notification: PropTypes.object,
    recentProjects: PropTypes.array,
    onOpenExistingProject: PropTypes.func,
    onCreateNewProject: PropTypes.func,
    onOpenRecentProject: PropTypes.func,
    onRemoveRecentItem: PropTypes.func,
    onReadRecentProjects: PropTypes.func,
    onMounted: PropTypes.func,
    onOpenSite: PropTypes.func,
  };

  static defaultProps = {
    applicationInfo: {},
    notification: null,
    recentProjects: [],
    onOpenExistingProject: () => {
      console.info('StarterLayout.onOpenExistingProject is not set');
    },
    onCreateNewProject: () => {
      console.info('StarterLayout.onCreateNewProject is not set');
    },
    onOpenRecentProject: () => {
      console.info('StarterLayout.onOpenRecentProject is not set');
    },
    onRemoveRecentItem: () => {
      console.info('StarterLayout.onRemoveRecentItem is not set');
    },
    onReadRecentProjects: () => {
      console.info('StarterLayout.onReadRecentProjects is not set');
    },
    onMounted: () => {
      console.info('StarterLayout.onMounted is not set');
    },
    onOpenSite: () => {
      console.info('StarterLayout.onOpenSite is not set');
    },
  };

  componentDidMount () {
    this.props.onMounted();
    this.props.onReadRecentProjects();
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    const { notification, enqueueSnackbar } = this.props;
    if (notification && notification !== prevProps.notification) {
      const { message, options } = notification;
      enqueueSnackbar(message, options || { variant: 'info' });
    }
  }

  handleOpenExistingProject = () => {
    this.props.onOpenExistingProject();
  };

  handleCreateNewProject = (projectType) => () => {
    this.props.onCreateNewProject({ projectType });
  };

  handleOpenRecentProject = (item) => () => {
    this.props.onOpenRecentProject({ selectedDirPath: item });
  };

  handleRemoveRecentItem = (item) => () => {
    this.props.onRemoveRecentItem(item);
  };

  handleOpenSite = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onOpenSite(constants.URL_WEBCODESK_SITE);
  };

  render () {
    const { classes, recentProjects, applicationInfo } = this.props;
    let isNewVersionAvailable = applicationInfo &&
      applicationInfo.applicationVersion &&
      applicationInfo.applicationVersion !== constants.CURRENT_APPLICATION_VERSION;
    return (
      <div className={classes.root}>
        <div className={classes.topPane}/>
        <div className={classes.containerWrapper}>
          <div className={classes.gridContainer}>
            <Grid columns={3} gap="10px">
              <Cell width={3}>
                <div className={classes.containerWrapper}>
                  <img className={classes.logoBox} src={logoImage} alt="logo"/>
                </div>
              </Cell>
              <Cell width={3}>
                <div className={classes.containerWrapper}>
                  <div>
                    <Typography variant="h2">
                      WEBCODESK
                    </Typography>
                    <Typography variant="caption" align="right">
                      {constants.CURRENT_APPLICATION_VERSION}
                    </Typography>
                    <div className={classes.containerWrapper}>
                      {isNewVersionAvailable &&
                      (
                        <Button
                          variant="text"
                          size="small"
                          onClick={this.handleOpenSite}
                        >
                          Download {applicationInfo.applicationVersion} version
                        </Button>
                      )
                      }
                    </div>
                  </div>
                </div>
                <Divider className={classes.divider}/>
              </Cell>
              <Cell height={1}>
                <div className={classes.newButtonPane}>
                  <Typography align="center" variant="body1" gutterBottom={true}>
                    New JavaScript
                  </Typography>
                  <Typography align="center" variant="caption" gutterBottom={true}>
                    Project
                  </Typography>
                  <div>
                    <Fab
                      color="primary"
                      size="small"
                      aria-label="Add"
                      onClick={this.handleCreateNewProject(constants.NEW_PROJECT_JAVA_SCRIPT_TYPE)}
                    >
                      <CreateNewFolder/>
                    </Fab>
                  </div>
                </div>
              </Cell>
              <Cell height={1}>
                <div className={classes.newButtonPane}>
                  <Typography align="center" variant="body1" gutterBottom={true}>
                    New TypeScript
                  </Typography>
                  <Typography align="center" variant="caption" gutterBottom={true}>
                    Project
                  </Typography>
                  <div>
                    <Fab
                      color="primary"
                      size="small"
                      aria-label="Add"
                      onClick={this.handleCreateNewProject(constants.NEW_PROJECT_TYPE_SCRIPT_TYPE)}
                    >
                      <CreateNewFolder/>
                    </Fab>
                  </div>
                </div>
              </Cell>
              <Cell height={1}>
                <div className={classes.newButtonPane}>
                  <Typography align="center" variant="body1" gutterBottom={true}>
                    Open Existing
                  </Typography>
                  <Typography align="center" variant="caption" gutterBottom={true}>
                    Project
                  </Typography>
                  <div>
                    <Fab
                      color="primary"
                      size="small"
                      aria-label="Open"
                      onClick={this.handleOpenExistingProject}
                    >
                      <Folder/>
                    </Fab>
                  </div>
                </div>
              </Cell>
            </Grid>
          </div>
          {recentProjects && recentProjects.length > 0 && (
            <div className={classes.gridContainerRecent}>
              <Grid columns={3} gap="10px">
                <Cell width={3}>
                  <List disablePadding={true}>
                    {recentProjects.map((item, index) => {
                      return (
                        <ListItem
                          key={item}
                          dense={true}
                          button={true}
                          onClick={this.handleOpenRecentProject(item)}
                          title={item}
                        >
                          <FolderOpen fontSize="small" color="disabled"/>
                          <RecentListItemText primary={cutFilePath(item, 50)}/>
                          <ListItemSecondaryAction>
                            <IconButton
                              title="Remove from the recent projects list"
                              onClick={this.handleRemoveRecentItem(item)}
                            >
                              <Close color="disabled" fontSize="small"/>
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      );
                    })}
                  </List>
                </Cell>
              </Grid>
            </div>
          )}
        </div>
        <div className={classes.bottomPane}/>
      </div>
    );
  }
}

export default withSnackbar(withStyles(styles)(StarterLayout));
