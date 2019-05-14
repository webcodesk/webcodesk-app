import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ToolbarButton from '../commons/ToolbarButton';

const styles = theme => ({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    minWidth: '250px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: '2px',
  },
});

class LeftTopPanel extends React.Component {
  static propTypes = {
    projectServerStatus: PropTypes.object,
    onLivePreview: PropTypes.func,
    onGetProjectServerStatus: PropTypes.func,
    onProjectServerDialog: PropTypes.func,
    onOpenMarket: PropTypes.func,
  };

  static defaultProps = {
    projectServerStatus: {},
    onLivePreview: () => {
      console.info('LeftTopPanel.onLivePreview is not set');
    },
    onGetProjectServerStatus: () => {
      console.info('LeftTopPanel.onGetProjectServerStatus is not set');
    },
    onProjectServerDialog: () => {
      console.info('LeftTopPanel.onProjectServerDialog is not set');
    },
    onOpenMarket: () => {
      console.info('LeftTopPanel.onOpenMarket is not set');
    },
  };

  componentDidMount () {
    // this.runCheckStatus();
  }

  componentWillUnmount () {
    this.stopCheckStatus();
  }

  runCheckStatus = () => {
    if (!this.checkStatusTimeoutId) {
      this.checkStatusTimeoutId = setTimeout(() => {
        this.props.onGetProjectServerStatus();
        this.checkStatusTimeoutId = undefined;
        this.runCheckStatus();
      }, 5000);
    }
  };

  stopCheckStatus = () => {
    if (this.checkStatusTimeoutId) {
      clearTimeout(this.checkStatusTimeoutId);
    }
    this.checkStatusTimeoutId = undefined;
  };

  handleLivePreview = () => {
    this.props.onLivePreview();
  };

  handleProjectServerDialog = () => {
    this.props.onProjectServerDialog(true);
  };

  handleOpenMarket = () => {
    this.props.onOpenMarket();
  };

  render () {
    const {classes, projectServerStatus} = this.props;
    const { isWorking, isStarting } = projectServerStatus;
    return (
      <div className={classes.root}>
        <ToolbarButton
          onClick={this.handleLivePreview}
          title="Live Preview"
          iconType="SlowMotionVideo"
          iconColor="#2e7d32"
          tooltip="Open Live Preview of the application"
        />
        {isStarting && (
            <ToolbarButton
              title="Starting..."
              iconType="Dvr"
              iconColor="#2e7d32"
              onClick={this.handleProjectServerDialog}
              tooltip="Development server is starting..."
            />
          )
        }
        {!isStarting && (isWorking
          ? (
            <ToolbarButton
              title="Server"
              iconType="Dvr"
              iconColor="#2e7d32"
              onClick={this.handleProjectServerDialog}
              tooltip="Show development server log"
            />
          )
            : (
            <ToolbarButton
              title="Server"
              iconType="NotificationImportant"
              iconColor="#BF360C"
              onClick={this.handleProjectServerDialog}
              tooltip="Show development server log"
            />
          ))
        }
        {/*<ToolbarButton*/}
          {/*title="Market"*/}
          {/*iconType="CloudCircle"*/}
          {/*iconColor="#2196f3"*/}
          {/*onClick={this.handleOpenMarket}*/}
          {/*tooltip="Search and install components and functions on the market"*/}
        {/*/>*/}
      </div>
    );
  }
}

export default withStyles(styles)(LeftTopPanel);
