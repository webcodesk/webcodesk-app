import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import ResourceIcon from '../commons/ResourceIcon';
import constants from '../../commons/constants';
import {cutFilePath, cutText} from "../commons/utils";
import TwoColumnsLayout from "../commons/TwoColumnsLayout";

const styles = theme => ({
  codeText: {
    color: '#1e1e1e',
    fontWeight: 'normal',
    padding: '5px',
    backgroundColor: '#f5f5f5'
  },
  errorText: {
    color: '#D50000'
  },
});

class InstallPackageDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    isLoading: PropTypes.bool,
    error: PropTypes.string,
    selectedItemData: PropTypes.object,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
  };

  static defaultProps = {
    isOpen: false,
    isLoading: false,
    error: '',
    selectedItemData: {
      components: [],
      userId: 10,
      projectId: 4378927,
      projectName: 'test_project',
      groupName: 'test_group',
      componentId: 94385734,
      componentName: 'TestComponent',
      componentType: 'component'
    },
    onClose: () => {
      console.info('InstallPackageDialog.onClose is not set');
    },
    onSubmit: (options) => {
      console.info('InstallPackageDialog.onSubmit is not set: ', options);
    },
  };

  constructor (props) {
    super(props);
    const {selectedItemData} = this.props;
    let directoryNameText = '';
    if (selectedItemData) {
      const {projectName, groupName, componentName} = selectedItemData;
      if (componentName) {
        directoryNameText = `${projectName}/${groupName}`;
      } else {
        directoryNameText = projectName;
      }
    }
    this.state = {
      directoryNameText,
      directoryNameError: false,
    };
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    const {isOpen, selectedItemData, isLoading, error} = this.props;
    const { directoryNameText, directoryNameError } = this.state;
    return isOpen !== nextProps.isOpen
      || selectedItemData !== nextProps.selectedItemData
      || isLoading !== nextProps.isLoading
      || error !== nextProps.error
      || directoryNameText !== nextState.directoryNameText
      || directoryNameError !== nextState.directoryNameError;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {isOpen, selectedItemData} = this.props;
    if (isOpen !== prevProps.isOpen) {
      let directoryNameText = '';
      if (selectedItemData) {
        const {projectName, groupName, componentName} = selectedItemData;
        if (componentName) {
          directoryNameText = `${projectName}/${groupName}`;
        } else {
          directoryNameText = projectName;
        }
      }
      this.setState({
        directoryNameText,
        directoryNameError: false,
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
    const { directoryNameText } = this.state;
    const { directoryNameError } = this.validateTexts({
      directoryNameText,
    });
    if (!directoryNameError) {
      const { onSubmit, selectedItemData } = this.props;
      onSubmit({
        directoryName: directoryNameText,
        selectedItemData,
      });
    } else {
      this.setState({
        directoryNameError
      });
    }
  };

  validateTexts = ({directoryNameText}) => {
    const directoryNameMatches = constants.FILE_PATH_VALID_REGEXP.exec(directoryNameText);
    return {
      directoryNameError: !directoryNameText || !directoryNameMatches,
    };
  };

  handleDirectoryNameChange = (e) => {
    const directoryNameText = e.target.value;
    const newState = {
      directoryNameText,
      ...this.validateTexts({directoryNameText})
    };
    this.setState(newState);
  };

  render () {
    const { classes, isOpen, selectedItemData, isLoading, error } = this.props;
    if (!isOpen) {
      return null;
    }
    const { directoryNameText, directoryNameError } = this.state;
    let destinationPath;
    let projectNameLabel;
    let groupNameLabel;
    let componentNameLabel;
    if (selectedItemData) {
      const {projectName, groupName, componentName} = selectedItemData;
      projectNameLabel = cutText(projectName, 120);
      groupNameLabel = cutText(groupName, 120);
      componentNameLabel = cutText(componentName, 120);
      if (componentName) {
        destinationPath = '';
      } else if (groupName) {
        destinationPath = `/${groupName}`;
      } else {
        destinationPath = '';
      }
    }
    return (
      <Dialog
        aria-labelledby="InstallPackageDialog-dialog-title"
        onClose={this.handleClose}
        open={isOpen}
        maxWidth="sm"
        fullWidth={true}
      >
        <form onSubmit={this.handleSubmit}>
          <DialogTitle
            id="CopyFlowDialog-dialog-title"
            disableTypography={true}
          >
            Install Package
          </DialogTitle>
          <DialogContent>
            <div>
              {error && !isLoading && error && (
                <Typography
                  variant="subtitle2"
                  gutterBottom={true}
                  className={classes.errorText}
                >
                  {error}
                </Typography>
              )}
              {isLoading && (
                <LinearProgress/>
              )}
            </div>
            <TwoColumnsLayout>
              {projectNameLabel && (
                <Typography variant="overline">Source project:</Typography>
              )}
              {projectNameLabel && (
                <div>
                  <code className={classes.codeText}>
                    {projectNameLabel}
                  </code>
                </div>
              )}
              {groupNameLabel && (
                <Typography variant="overline">Source group:</Typography>
              )}
              {groupNameLabel && (
                <div>
                  <code className={classes.codeText}>
                    {groupNameLabel}
                  </code>
                </div>
              )}
              {componentNameLabel && (
                <Typography variant="overline">Source file name:</Typography>
              )}
              {componentNameLabel && (
                <div>
                  <code className={classes.codeText}>
                    {componentNameLabel}
                  </code>
                </div>
              )}
              <Typography variant="overline">Destination path:</Typography>
              <div>
                <code className={classes.codeText}>
                  {cutFilePath(`src/usr/${directoryNameText}${destinationPath}`)}
                </code>
              </div>
            </TwoColumnsLayout>
            <TextField
              margin="normal"
              id="packageDestinationDirectory"
              label="Destination Directory"
              type="text"
              fullWidth={true}
              required={true}
              value={directoryNameText}
              error={directoryNameError}
              disabled={isLoading}
              onChange={this.handleDirectoryNameChange}
              InputProps={{
                startAdornment:
                  <InputAdornment position="start">
                    <ResourceIcon resourceType={constants.GRAPH_MODEL_DIR_TYPE} isMuted={true}/>
                  </InputAdornment>,
              }}
              helperText="Enter the directory path inside the 'src/usr' directory. Use '/' as a separator of the nested directories."
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.handleClose}
              color="secondary"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={this.handleSubmit}
              color="primary"
              disabled={isLoading}
            >
              Install
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
}

export default withStyles(styles)(InstallPackageDialog);
