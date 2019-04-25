import cloneDeep from 'lodash/cloneDeep';
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Slide from '@material-ui/core/Slide';
import ToolbarButton from '../commons/ToolbarButton';
import { CommonToolbar, CommonToolbarDivider, FullScreenDialog } from '../commons/Commons.parts';
import ServerPortTextField from '../commons/ServerPortTextField';

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
  },
  topPane: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '39px',
    right: 0
  },
  contentPane: {
    position: 'absolute',
    top: '39px',
    left: 0,
    bottom: 0,
    right: 0,
    padding: '1em',
    overflow: 'auto',
  },
  logPane: {
    color: '#1e1e1e',
    fontWeight: 'bold',
  },
});

class ProjectServerDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    projectServerLog: PropTypes.object,
    projectSettings: PropTypes.object,
    projectServerStatus: PropTypes.object,
    onClose: PropTypes.func,
    onGetProjectServerLog: PropTypes.func,
    onSetServerPort: PropTypes.func,
    onRestartServer: PropTypes.func,
  };

  static defaultProps = {
    isOpen: false,
    projectServerLog: {},
    projectSettings: {},
    projectServerStatus: {},
    onClose: () => {
      console.info('ProjectServerDialog.onClose is not set');
    },
    onGetProjectServerLog: () => {
      console.info('ProjectServerDialog.onGetProjectServerLog is not set');
    },
    onSetServerPort: () => {
      console.info('ProjectServerDialog.onSetServerPort is not set');
    },
    onRestartServer: () => {
      console.info('ProjectServerDialog.onRestartServer is not set');
    },
  };

  constructor (props) {
    super(props);
    this.state = {
      projectServerStatusLocal: cloneDeep(this.props.projectServerStatus),
    };
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    const { isOpen, projectServerStatus } = this.props;
    if (isOpen !== prevProps.isOpen) {
      if (isOpen) {
        this.props.onGetProjectServerLog();
        this.runGetLog();
      } else {
        this.stopGetLog();
      }
    }
    if (projectServerStatus !== prevProps.projectServerStatus) {
      this.setState({
        projectServerStatusLocal: cloneDeep(this.props.projectServerStatus),
      });
    }
  }

  componentWillUnmount () {
    this.stopGetLog();
  }

  runGetLog = () => {
    if (!this.getLogTimeoutId) {
      this.getLogTimeoutId = setTimeout(() => {
        this.props.onGetProjectServerLog();
        this.getLogTimeoutId = undefined;
        this.runGetLog();
      }, 5000);
    }
  };

  stopGetLog = () => {
    if (this.getLogTimeoutId) {
      clearTimeout(this.getLogTimeoutId);
    }
    this.getLogTimeoutId = undefined;
  };

  handleClose = () => {
    this.props.onClose(false);
  };

  handleRestartServer = () => {
    this.props.onRestartServer();
    this.setState({
      projectServerStatusLocal: {...this.state.projectServerStatusLocal, ...{ isStarting: true }},
    })
  };

  handleSubmitServerPort = (port) => {
    console.info('Handle submit server port: ', port);
    this.props.onSetServerPort(parseInt(port, 10));
    this.setState({
      projectServerStatusLocal: {...this.state.projectServerStatusLocal, ...{ isStarting: true }},
    })
  };

  render () {
    const { classes, isOpen, projectServerLog, projectSettings } = this.props;
    const { projectServerStatusLocal } = this.state;
    const { logRecords } = projectServerLog;
    return (
      <FullScreenDialog
        fullScreen={true}
        open={isOpen}
        onClose={this.handleClose}
        TransitionComponent={Transition}
      >
        <div className={classes.root}>
          <div className={classes.topPane}>
            <CommonToolbar disableGutters={true} dense="true">
              <ToolbarButton
                iconType="Close"
                onClick={this.handleClose}
                title="Close"
                tooltip="Close server log"
                disabled={projectServerStatusLocal.isStarting}
              />
              <ToolbarButton
                iconType="Refresh"
                onClick={this.handleRestartServer}
                title={projectServerStatusLocal.isStarting ? 'Starting server...' : 'Restart server'}
                tooltip="Restart server"
                disabled={projectServerStatusLocal.isStarting}
              />
              <CommonToolbarDivider />
              <ServerPortTextField
                port={'' + projectSettings.port}
                onSubmit={this.handleSubmitServerPort}
                disabled={projectServerStatusLocal.isStarting}
              />
            </CommonToolbar>
          </div>
          <div className={classes.contentPane}>
            {logRecords && logRecords.length > 0
              ? (
                <pre><code className={classes.logPane}>{logRecords.join('')}</code></pre>
              )
              : (
                <pre><code className={classes.logPane}>Server log is empty</code></pre>
              )
            }
          </div>
        </div>
      </FullScreenDialog>
    );
  }
}

export default withStyles(styles)(ProjectServerDialog);
