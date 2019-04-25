import React from 'react';
import PropTypes from 'prop-types';
import { withSnackbar } from 'notistack';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Cell } from 'styled-css-grid';
import Typography from '@material-ui/core/Typography';
import * as constants from '../../commons/constants';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Folder from '@material-ui/icons/Folder';
import IconButton from '@material-ui/core/IconButton';
import { cutFilePath } from '../commons/utils';

const styles = theme => ({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    overflow: 'auto',
  },
  gridContainer: {
    width: '500px',
  },
  gridCreatingContainer: {
    width: '800px',
  },
  buttonsPane: {
    marginTop: '2em',
  },
  paddingPane: {
    height: '5em'
  },
  logPaneContainer: {
    width: '800px',
    maxHeight: '450px',
    overflow: 'auto'
  },
  logPane: {
    color: '#1e1e1e',
    fontWeight: 'bold',
  },
});

class NewProjectWizard extends React.Component {
  static propTypes = {
    notification: PropTypes.object,
    data: PropTypes.object,
    directoryData: PropTypes.object,
    creatingError: PropTypes.string,
    installerFeedback: PropTypes.object,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
    onBrowseDirectory: PropTypes.func,
  };

  static defaultProps = {
    notification: null,
    data: {},
    directoryData: {
      directoryPath: null,
      error: null,
    },
    creatingError: null,
    installerFeedback: {},
    onClose: () => {
      console.info('NewProjectWizard.onClose is not set');
    },
    onSubmit: () => {
      console.info('NewProjectWizard.onSubmit is not set');
    },
    onBrowseDirectory: () => {
      console.info('NewProjectWizard.onBrowseDirectory is not set');
    },
  };

  constructor (props) {
    super(props);
    this.state = {
      nameText: '',
      nameError: false,
      directoryNameText: '',
      directoryNameError: false,
      showCreatingLog: false,
      installerFeedbackLog: [],
      errorFeedback: null,
    };
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    const { directoryData, installerFeedback, notification, enqueueSnackbar, creatingError } = this.props;
    if (notification && notification !== prevProps.notification) {
      const { message, options } = notification;
      enqueueSnackbar(message, options || { variant: 'info' });
    }
    if (directoryData !== prevProps.directoryData) {
      this.setState({
        directoryNameError: !directoryData.directoryPath
      });
    } else if (installerFeedback !== prevProps.installerFeedback) {
      const installerFeedbackLog = [installerFeedback, ...this.state.installerFeedbackLog];
      this.setState({
        installerFeedbackLog
      });
    } else if (creatingError !== prevProps.creatingError) {
      this.setState({
        errorFeedback: creatingError,
      });
    }
  }

  handleClose = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onClose(false);
  };

  handleSubmit = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const { nameText } = this.state;
    const { nameError } = this.validateTexts({
      nameText
    });
    const { data, directoryData, onSubmit } = this.props;
    if (!nameError && directoryData.directoryPath) {
      this.setState({
        showCreatingLog: true,
      });
      onSubmit({
        name: nameText,
        directoryPath: directoryData.directoryPath,
        projectType: data.projectType,
      });
    } else {
      this.setState({
        nameError,
        directoryNameError: !directoryData.directoryPath
      });
    }
  };

  validateTexts = ({nameText}) => {
    const nameMatches = constants.FILE_NAME_VALID_REGEXP.exec(nameText);
    return {
      nameError: !nameText || !nameMatches,
    };
  };

  handleNameChange = (e) => {
    const nameText = e.target.value;
    const newState = {
      nameText,
      ...this.validateTexts({nameText})
    };
    this.setState(newState);
  };

  handleBrowseDirectory = () => {
    this.props.onBrowseDirectory();
  };

  handleBack = () => {
    this.setState({
      showCreatingLog: false,
      installerFeedbackLog: [],
      errorFeedback: null,
    });
  };

  render () {
    const {classes, data, directoryData} = this.props;
    const {
      nameText,
      nameError,
      directoryNameError,
      showCreatingLog,
      installerFeedbackLog,
      errorFeedback
    } = this.state;
    let projectTypeName;
    switch (data.projectType) {
      case constants.NEW_PROJECT_TYPE_SCRIPT_TYPE:
        projectTypeName = 'TypeScript';
        break;
      case constants.NEW_PROJECT_JAVA_SCRIPT_TYPE:
        projectTypeName = 'JavaScript';
        break;
      default:
        projectTypeName = 'Unknown';
        break;
    }
    if (showCreatingLog) {
      return (
        <div className={classes.root}>
          <div className={classes.gridCreatingContainer}>
            <Grid columns={1}>
              <Cell width={1}>
                <div className={classes.paddingPane} />
              </Cell>
              <Cell width={1}>
                <Typography align="center" variant="body1" gutterBottom={true}>
                  Creating {projectTypeName} Project
                </Typography>
                {errorFeedback
                  ? (
                  <Typography color="error" align="center" variant="body2" gutterBottom={true}>
                    {errorFeedback}
                  </Typography>
                )
                  : (
                    <Typography align="center" variant="body2" gutterBottom={true}>
                      Please wait...
                    </Typography>
                  )
                }
              </Cell>
              <Cell width={1}>
                <div className={classes.logPaneContainer}>
                  <pre><code className={classes.logPane}>
                    {installerFeedbackLog.map(feedbackItem => {
                      return `${feedbackItem.message}\n\n`;
                    })}
                  </code></pre>
                </div>
              </Cell>
              {errorFeedback && (
                <Cell width={1} center={true}>
                  <div className={classes.buttonsPane}>
                    <Button variant="contained" onClick={this.handleBack}>
                      Back
                    </Button>
                  </div>
                </Cell>
              )}
              <Cell width={1}>
                <div className={classes.paddingPane} />
              </Cell>
            </Grid>
          </div>
        </div>
      );
    }
    return (
      <div className={classes.root}>
        <div className={classes.gridContainer}>
          <Grid columns={1}>
            <Cell width={1}>
              <div className={classes.paddingPane} />
            </Cell>
            <Cell width={1}>
              <Typography align="center" variant="body1" gutterBottom={true}>
                New {projectTypeName} Project
              </Typography>
            </Cell>
              <Cell width={1}>
                <TextField
                  autoFocus={true}
                  margin="dense"
                  id="pageName"
                  label="Project Name"
                  type="text"
                  fullWidth={true}
                  required={true}
                  value={nameText}
                  error={nameError}
                  onChange={this.handleNameChange}
                  helperText="Enter the name of the new project. Use alphanumeric characters and '_' character."
                />
              </Cell>
              <Cell width={1}>
                <TextField
                  margin="dense"
                  id="directory"
                  label={!directoryData.directoryPath ? 'Project Directory' : ''}
                  type="text"
                  fullWidth={true}
                  required={true}
                  value={directoryData.directoryPath ? cutFilePath(directoryData.directoryPath) : ''}
                  error={directoryNameError}
                  disabled={true}
                  InputProps={{
                    endAdornment:
                      <InputAdornment position="end">
                        <IconButton onClick={this.handleBrowseDirectory}>
                          <Folder fontSize="small" />
                        </IconButton>
                      </InputAdornment>,
                  }}
                  helperText={directoryData.error || 'Choose the existing directory for the new project.'}
                />
              </Cell>
            <Cell width={1} center={true}>
              <div className={classes.buttonsPane}>
                <Button onClick={this.handleClose}>
                  Cancel
                </Button>
                &nbsp;
                &nbsp;
                <Button type="submit" variant="contained" onClick={this.handleSubmit} color="primary">
                  Create
                </Button>
              </div>
            </Cell>
            <Cell width={1}>
              <div className={classes.paddingPane} />
            </Cell>
          </Grid>
        </div>
      </div>
    );
  }
}

export default  withSnackbar(withStyles(styles)(NewProjectWizard));
