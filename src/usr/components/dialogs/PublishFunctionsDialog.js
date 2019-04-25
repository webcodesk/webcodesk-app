import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import 'react-image-crop/dist/ReactCrop.css';
import {CommonTab, CommonTabs} from '../commons/Commons.parts';
import {withStyles} from '@material-ui/core/styles';
import ComponentPublishLayout from '../commons/ComponentPublishLayout';
import TwoColumnsLayout from '../commons/TwoColumnsLayout';
import OneColumnLayout from '../commons/OneColumnLayout';
import {cutText} from "../commons/utils";

const styles = theme => ({
  tabPane: {
    marginTop: '16px',
    minHeight: '445px'
  },
  tagsInputBox: {},
  errorText: {
    color: '#D50000'
  },
  codeText: {
    color: '#1e1e1e',
    fontWeight: 'normal',
    padding: '5px',
    backgroundColor: '#f5f5f5'
  },
  filesBox: {
    padding: '5px',
    display: 'flex',
    maxHeight: '150px',
    overflow: 'auto',
    flexWrap: 'wrap'
  },
  fileItem: {
    marginRight: '5px'
  }
});

class PublishFunctionsDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    data: PropTypes.object,
    isLoading: PropTypes.bool,
    error: PropTypes.string,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
  };

  static defaultProps = {
    isOpen: false,
    data: {},
    isLoading: false,
    error: null,
    onClose: () => {
      console.info('PublishFunctionsDialog.onClose is not set');
    },
    onSubmit: () => {
      console.info('PublishFunctionsDialog.onSubmit is not set');
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      activeTabIndex: 0,
      searchTags: '',
      isSearchTagsError: false,
      description: '',
      isDescriptionError: false,
      demoUrl: '',
      extraDeps: '',
    };
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    const {isOpen, data, isLoading, error} = this.props;
    const {
      activeTabIndex,
      searchTags,
      isSearchTagsError,
      description,
      isDescriptionError,
      demoUrl,
      extraDeps
    } = this.state;
    return isOpen !== nextProps.isOpen
      || isLoading !== nextProps.isLoading
      || data !== nextProps.data
      || error !== nextProps.error
      || activeTabIndex !== nextState.activeTabIndex
      || searchTags !== nextState.searchTags
      || isSearchTagsError !== nextState.isSearchTagsError
      || description !== nextState.description
      || isDescriptionError !== nextState.isDescriptionError
      || demoUrl !== nextState.demoUrl
      || extraDeps !== nextState.extraDeps;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {data, isOpen} = this.props;
    if (data !== prevProps.data) {
      this.setState({
        isSearchTagsError: false,
        isDescriptionError: false,
      });
    }
    if (isOpen && !prevProps.isOpen) {
      this.setState({
        activeTabIndex: 0,
        isSearchTagsError: false,
        isDescriptionError: false,
        extraDeps: '',
      });
    }
  }

  handleClose = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const {onClose} = this.props;
    onClose();
  };

  handleSubmit = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const {searchTags, description, demoUrl, extraDeps} = this.state;
    const {data} = this.props;
    const isSearchTagsError = this.validateSearchTags(searchTags);
    const isDescriptionError = this.validateDescription(description);
    if (isSearchTagsError || isDescriptionError || !data || !data.groupName || !data.hasReadme || !data.license || !data.repositoryUrl) {
      this.setState({
        isSearchTagsError,
        isDescriptionError
      });
    } else {
      const {onSubmit} = this.props;
      onSubmit({
        ...data,
        description,
        demoUrl,
        searchTags,
        extraDeps,
      });
    }
  };

  handleChangeTabIndex = (event, value) => {
    this.setState({
      activeTabIndex: value,
    });
  };

  validateSearchTags = (value) => {
    const words = value ? value.split(' ') : [];
    return (!value || value.length > 250 || words.length > 5);
  };

  validateDescription = (value) => {
    return (!value || value.length < 100 || value.length > 500);
  };

  handleChangeSearchTags = (e) => {
    this.setState({
      searchTags: e.target.value,
      isSearchTagsError: this.validateSearchTags(e.target.value),
    });
  };

  handleChangeDemoUrl = (e) => {
    this.setState({
      demoUrl: e.target.value,
    });
  };

  handleChangeExtraDeps = (e) => {
    this.setState({
      extraDeps: e.target.value,
    });
  };

  handleChangeDescription = (e) => {
    this.setState({
      description: e.target.value,
      isDescriptionError: this.validateDescription(e.target.value),
    });
  };

  render() {
    const {classes, isOpen, isLoading, error, data} = this.props;
    if (!isOpen) {
      return null;
    }
    const {
      activeTabIndex,
      searchTags,
      description,
      isSearchTagsError,
      isDescriptionError,
      demoUrl,
      extraDeps
    } = this.state;
    return (
      <Dialog
        aria-labelledby="PublishComponentDialog-dialog-title"
        onClose={this.handleClose}
        open={isOpen}
        maxWidth="md"
        fullWidth={true}
        scroll="body"
      >
        <form onSubmit={this.handleSubmit}>
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
            <CommonTabs
              value={activeTabIndex}
              indicatorColor="primary"
              textColor="primary"
              fullWidth={true}
              onChange={this.handleChangeTabIndex}
            >
              <CommonTab label="Description"/>
              <CommonTab label="Files"/>
            </CommonTabs>
            {activeTabIndex === 0 && (
              <div className={classes.tabPane}>
                <ComponentPublishLayout
                  cell13={
                    <div>
                      <div>
                        <Typography gutterBottom={true} variant="body1">{cutText(data.functionsName, 80)}</Typography>
                      </div>
                      <TextField
                        label={description.length > 0 ? `Brief Description (${description.length})` : 'Brief Description'}
                        multiline={true}
                        fullWidth={true}
                        rows="16"
                        margin="normal"
                        variant="outlined"
                        error={isDescriptionError}
                        value={description}
                        onChange={this.handleChangeDescription}
                        helperText="Write a brief description. More than 100 and less than 500 characters long."
                      />
                    </div>
                  }
                  cell2={
                    <TwoColumnsLayout>
                      <Typography variant="overline">Project name:</Typography>
                      <div>
                        <code className={classes.codeText}>
                          {data.projectName}
                        </code>
                      </div>
                      <Typography variant="overline">Group name:</Typography>
                      <div>
                        {data.groupName
                          ? (
                            <code className={classes.codeText}>
                              {data.groupName}
                            </code>
                          )
                          : (
                            <Typography
                              variant="body2"
                              className={classes.errorText}
                            >
                              Place the component's files in the "usr" subdirectory
                            </Typography>
                          )
                        }
                      </div>
                      <Typography variant="overline">Readme file:</Typography>
                      <div>
                        {data.hasReadme
                          ? (
                            <code className={classes.codeText}>
                              Yes
                            </code>

                          )
                          : (
                            <Typography
                              variant="body2"
                              className={classes.errorText}
                            >
                              Create "README.md" file in the component's directory
                            </Typography>
                          )
                        }
                      </div>
                      <Typography variant="overline">License:</Typography>
                      <div>
                        {data.license
                          ? (
                            <code className={classes.codeText}>
                              {data.license}
                            </code>

                          )
                          : (
                            <Typography
                              variant="body2"
                              className={classes.errorText}
                            >
                              Set license in the project's `package.json` file
                            </Typography>
                          )
                        }
                      </div>
                      <Typography variant="overline">Repository URL:</Typography>
                      <div>
                        {data.repositoryUrl
                          ? (
                            <code className={classes.codeText}>
                              {data.repositoryUrl.length > 60
                                ? `${data.repositoryUrl.substring(0, 60)}...`
                                : data.repositoryUrl
                              }
                            </code>
                          )
                          : (
                            <Typography
                              variant="body2"
                              className={classes.errorText}
                            >
                              Set repository url in the project's `package.json` file
                            </Typography>
                          )
                        }
                      </div>
                    </TwoColumnsLayout>
                  }
                  cell4={
                    <div style={{gridColumn: 'span 2'}}>
                      <TextField
                        label="Search tags"
                        margin="dense"
                        id="tagsElement"
                        type="text"
                        required={true}
                        fullWidth={true}
                        disabled={isLoading}
                        variant="outlined"
                        value={searchTags}
                        onChange={this.handleChangeSearchTags}
                        error={isSearchTagsError}
                        placeholder="tag1, tag2"
                        helperText="Add words for finding this component on the market. Use space to separate words. The limit is up to 5 words with 250 characters in total."
                      />
                      <TextField
                        label="Live demo URL"
                        margin="dense"
                        id="demoUrlElement"
                        type="text"
                        required={false}
                        fullWidth={true}
                        variant="outlined"
                        disabled={isLoading}
                        value={demoUrl}
                        onChange={this.handleChangeDemoUrl}
                        placeholder="https://demo.com"
                        helperText="Enter the live demo URL of the current project."
                      />
                    </div>
                  }
                />
              </div>
            )}
            {activeTabIndex === 1 && (
              <div className={classes.tabPane}>
                <OneColumnLayout>
                  <div>
                    <Typography variant="overline">Package files:</Typography>
                  </div>
                  <div className={classes.filesBox}>
                    {data.packageFiles.map(packageFile => {
                      return (
                        <div key={packageFile} className={classes.fileItem}>
                          <code className={classes.codeText}>
                            {packageFile}
                          </code>
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <Typography variant="overline">Dependencies:</Typography>
                  </div>
                  {data.dependencies.length > 0
                    ? (
                      <div className={classes.filesBox}>
                        {data.dependencies.map(dependency => {
                          return (
                            <div key={dependency} className={classes.fileItem}>
                              <code className={classes.codeText}>
                                {dependency}
                              </code>
                            </div>
                          );
                        })}
                      </div>
                    )
                    : (
                      <div className={classes.filesBox}>
                        NONE
                      </div>
                    )
                  }
                  <div>
                    <TextField
                      label="Extra dependencies"
                      margin="dense"
                      id="extraDependenciesElement"
                      type="text"
                      required={false}
                      fullWidth={true}
                      variant="outlined"
                      disabled={isLoading}
                      value={extraDeps}
                      onChange={this.handleChangeExtraDeps}
                      placeholder="module[@version]"
                      helperText="Add npm modules that should be installed additionally. Use space to separate modules."
                    />
                  </div>
                </OneColumnLayout>
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <div>
              <Button
                disabled={isLoading}
                onClick={this.handleClose}
              >
                Close
              </Button>
              <Button
                disabled={isLoading}
                type="submit"
                onClick={this.handleSubmit}
                color="primary"
              >
                Publish
              </Button>
            </div>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
}

export default withStyles(styles)(PublishFunctionsDialog);
