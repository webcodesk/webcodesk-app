import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from "@material-ui/core/Typography";
import LinearProgress from '@material-ui/core/LinearProgress';
import {withStyles} from '@material-ui/core/styles';
import * as constants from '../../commons/constants';

const styles = theme => ({
  errorText: {
    color: '#D50000'
  }
});

class SignInDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    isLoading: PropTypes.bool,
    error: PropTypes.object,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
    onCreateNewAccount: PropTypes.func,
  };

  static defaultProps = {
    isOpen: false,
    licenseInfo: {},
    isLoading: false,
    error: null,
    onClose: () => {
      console.info('SignInDialog.onClose is not set');
    },
    onSubmit: () => {
      console.info('SignInDialog.onSubmit is not set');
    },
    onCreateNewAccount: (s) => {
      console.info('SignInDialog.onCreateNewAccount is not set ');
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      emailError: false,
      passwordError: false
    };
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    const {isOpen, isLoading, error} = this.props;
    const {email, emailError, password, passwordError} = this.state;
    return isOpen !== nextProps.isOpen
      || isLoading !== nextProps.isLoading
      || error !== nextProps.error
      || email !== nextState.email
      || emailError !== nextState.emailError
      || password !== nextState.password
      || passwordError !== nextState.passwordError;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {isOpen} = this.props;
    if (isOpen && isOpen !== prevProps.isOpen) {
      this.setState({
        password: '',
        passwordError: false
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
    const {email, password} = this.state;
    const {emailError, passwordError} = this.validateTexts({
      email,
      password
    });
    if (!emailError && !passwordError) {
        this.props.onSubmit({
          email,
          password,
        });
    } else {
      this.setState({
        emailError,
        passwordError
      });
    }
  };

  handleCreateNewAccount = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onCreateNewAccount(constants.URL_WEBCODESK_APP);
  };

  validateTexts = ({email, password}) => {
    return {
      emailError: !email || email.trim().length === 0,
      passwordError: !password || password.trim().length === 0,
    };
  };

  handleEmailChange = (e) => {
    const email = e.target.value;
    const newState = {
      email,
      emailError: !email || email.trim().length === 0
    };
    this.setState(newState);
  };

  handlePasswordChange = (e) => {
    const password = e.target.value;
    const newState = {
      password,
      passwordError: !password || password.trim().length === 0,
    };
    this.setState(newState);
  };

  render() {
    const {classes, isOpen, isLoading, error} = this.props;
    if (!isOpen) {
      return null;
    }
    const {email, password, emailError, passwordError} = this.state;
    return (
      <Dialog
        aria-labelledby="SignInDialog-dialog-title"
        onClose={this.handleClose}
        open={isOpen}
        maxWidth="xs"
        fullWidth={true}
      >
        <form onSubmit={this.handleSubmit}>
          <DialogTitle
            id="SignInDialog-dialog-title"
            disableTypography={true}
          >
            Sign In
          </DialogTitle>
          <DialogContent>
            <div>
              {error && !isLoading && error.message && (
                <Typography
                  variant="subtitle2"
                  gutterBottom={true}
                  className={classes.errorText}
                >
                  {error.message}
                </Typography>
              )}
              {isLoading && (
                <LinearProgress />
              )}
              <TextField
                autoFocus={true}
                margin="dense"
                id="emailElement"
                label="Email"
                type="text"
                required={true}
                fullWidth={true}
                value={email}
                error={emailError}
                variant="outlined"
                disabled={isLoading}
                onChange={this.handleEmailChange}
              />
              <TextField
                margin="dense"
                id="passwordElement"
                label="Password"
                type="password"
                required={true}
                fullWidth={true}
                value={password}
                error={passwordError}
                variant="outlined"
                disabled={isLoading}
                onChange={this.handlePasswordChange}
              />
              <Typography variant="caption" gutterBottom={true}>
                Don't remember password or do not have an account?
              </Typography>
              <Button
                variant="text"
                size="small"
                disabled={isLoading}
                onClick={this.handleCreateNewAccount}
              >
                Open account / Create new
              </Button>
            </div>
          </DialogContent>
          <DialogActions>
            <div>
              <Button disabled={isLoading} onClick={this.handleClose}>
                Close
              </Button>
              <Button disabled={isLoading} type="submit" onClick={this.handleSubmit} color="primary">
                Submit
              </Button>
            </div>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
}

export default withStyles(styles)(SignInDialog);
