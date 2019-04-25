import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { CommonTab, CommonTabError, CommonTabs } from '../commons/Commons.parts';
import constants from '../../commons/constants';
import AceEditor from '../commons/AceEditor';

const styles = theme => ({
  dialogContentVisible: {
    position: 'relative',
    width: '100%',
    height: '300px',
  },
  dialogContentInvisible: {
    display: 'none',
  },
  editorWrapper: {
    position: 'absolute',
    top: '16px',
    left: 0,
    right: 0,
    bottom: 0
  }
});

class EditComponentInstanceDialog extends React.Component {
  static propTypes = {
    componentInstance: PropTypes.string,
    initialState: PropTypes.object,
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
  };

  static defaultProps = {
    componentInstance: '',
    initialState: null,
    isOpen: false,
    onClose: () => {
      console.info('EditComponentInstanceDialog.onClose is not set');
    },
    onSubmit: (options) => {
      console.info('EditComponentInstanceDialog.onSubmit is not set: ', options);
    },
  };

  constructor (props) {
    super(props);
    const { componentInstance, initialState } = this.props;
    this.state = {
      activeTabIndex: 0,
      componentInstanceText: componentInstance,
      initialState: initialState ? { ...initialState } : null,
      isComponentInstanceTextError: false,
      isInitialStateError: false,
    };
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    const { componentInstance, initialState } = this.props;
    if (componentInstance !== prevProps.componentInstance) {
      this.setState({
        componentInstanceText: this.props.componentInstance,
      });
    }
    if (initialState !== prevProps.initialState) {
      this.setState({
        initialState: initialState ? {...initialState} : null
      });
    }
  }

  handleClose = () => {
    this.props.onClose(false);
    this.setState({
      activeTabIndex: 0,
      initialState: null,
    });
  };

  handleSubmit = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const { componentInstanceText, initialState, isInitialStateError } = this.state;
    const { isComponentInstanceTextError } = this.validateTexts({ componentInstanceText });
    if (!isComponentInstanceTextError && !isInitialStateError) {
      this.props.onSubmit({
        componentInstance: componentInstanceText,
        initialState
      });
      this.setState({
        activeTabIndex: 0,
        initialState: null,
      });
    } else {
      this.setState({ isComponentInstanceTextError });
    }
  };

  handleChangeTabIndex = (event, value) => {
    this.setState({
      activeTabIndex: value,
    });
  };

  handleChangeComponentInstanceText = (e) => {
    const componentInstanceText = e.target.value;
    const newState = {
      componentInstanceText,
      ...this.validateTexts({ componentInstanceText })
    };
    this.setState(newState);
  };

  validateTexts = ({ componentInstanceText }) => {
    const matches = constants.FILE_NAME_VALID_REGEXP.exec(componentInstanceText);
    return {
      isComponentInstanceTextError: !componentInstanceText || !matches,
    };
  };

  handleChangeInitialStateText = ({ data, hasErrors }) => {
    this.setState({
      initialState: data,
      isInitialStateError: hasErrors,
    });
  };

  render () {
    const { isOpen, classes } = this.props;
    if (!isOpen) {
      return <span/>;
    }
    const {
      activeTabIndex,
      componentInstanceText,
      initialState,
      isComponentInstanceTextError,
      isInitialStateError
    } = this.state;
    return (
      <Dialog
        aria-labelledby="EditComponentInstanceDialog-dialog-title"
        onClose={this.handleClose}
        open={isOpen}
        maxWidth="sm"
        fullWidth={true}
      >
        <form onSubmit={this.handleSubmit}>
          <DialogContent>
            <CommonTabs
              value={activeTabIndex}
              indicatorColor="primary"
              textColor="primary"
              fullWidth={true}
              onChange={this.handleChangeTabIndex}
            >
              {isComponentInstanceTextError
                ? (
                  <CommonTabError label="Instance Name"/>
                )
                : (
                  <CommonTab label="Instance Name"/>
                )
              }
              {isInitialStateError
                ? (
                  <CommonTabError label="Initial State (JSON)"/>
                ) : (
                  <CommonTab label="Initial State (JSON)"/>
                )
              }
            </CommonTabs>
            <div className={activeTabIndex === 0 ? classes.dialogContentVisible : classes.dialogContentInvisible}>
                <TextField
                  autoFocus={true}
                  margin="normal"
                  id="instanceName"
                  type="text"
                  fullWidth={true}
                  value={componentInstanceText}
                  error={isComponentInstanceTextError}
                  helperText="Use alphanumeric characters"
                  onChange={this.handleChangeComponentInstanceText}
                />
            </div>
            <div className={activeTabIndex === 1 ? classes.dialogContentVisible : classes.dialogContentInvisible}>
              <div className={classes.editorWrapper}>
                <AceEditor
                  data={initialState}
                  isVisible={activeTabIndex === 1}
                  onChange={this.handleChangeInitialStateText}
                />
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="secondary">
              Cancel
            </Button>
            <Button type="submit" onClick={this.handleSubmit} color="primary">
              Ok
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
}

export default withStyles(styles)(EditComponentInstanceDialog);
