import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Cell } from 'styled-css-grid';
import UserFunctionDescription from '../commons/UserFunctionDescription';
import { CommonToolbar, CommonToolbarDivider } from '../commons/Commons.parts';
import ToolbarButton from '../commons/ToolbarButton';
import SourceCodeEditor from '../commons/SourceCodeEditor';

const styles = theme => ({
  root: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    overflow: 'auto'
  },
  centralPane: {
    position: 'absolute',
    top: '39px',
    bottom: 0,
    right: 0,
    left: 0,
  },
  topPane: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '39px',
    right: 0,
    minWidth: '800px'
  },
  gridContainer: {
    minWidth: '600px',
    padding: '30px',
  }
});

class FunctionsFileView extends React.Component {
  static propTypes = {
    isVisible: PropTypes.bool,
    data: PropTypes.object,
    sourceCode: PropTypes.string,
    onSearch: PropTypes.func,
    onPublish: PropTypes.func,
    onSaveChanges: PropTypes.func,
  };

  static defaultProps = {
    isVisible: true,
    data: {},
    sourceCode: '',
    onSearch: () => {
      console.info('FunctionsFileView.onSearch is not set');
    },
    onPublish: () => {
      console.info('FunctionsFileView.onPublish is not set');
    },
    onSaveChanges: () => {
      console.info('FunctionsFileView.onSaveChanges is not set');
    },
  };

  constructor (props) {
    super(props);
    this.state = {
      isSourceCodeOpen: false,
      localSourceCode: this.props.sourceCode,
      sourceCodeUpdateCounter: 0,
    };
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    const { sourceCode, isVisible } = this.props;
    const { sourceCodeUpdateCounter } = this.state;
    if (prevProps.isVisible !== isVisible) {
      if (!isVisible && sourceCodeUpdateCounter > 0) {
        this.handleSaveChanges();
      }
    }
    if (sourceCode !== prevProps.sourceCode && sourceCodeUpdateCounter === 0) {
      this.setState({
        localSourceCode: sourceCode
      });
    }
  }

  handleToggleSourceCode = () => {
    this.setState({
      isSourceCodeOpen: !this.state.isSourceCodeOpen,
    });
  };

  handleChangeSourceCode = ({ script, hasErrors }) => {
    this.setState({
      localSourceCode: script,
      sourceCodeUpdateCounter: this.state.sourceCodeUpdateCounter + 1
    });
  };

  handleSaveChanges = () => {
    this.props.onSaveChanges(this.state.localSourceCode);
    this.setState({
      sourceCodeUpdateCounter: 0
    });
  };

  handlePublish = () => {
    const {data, onPublish} = this.props;
    onPublish({data});
  };

  render () {
    const { classes, data, onSearch } = this.props;
    const { localSourceCode, sourceCodeUpdateCounter, isSourceCodeOpen } = this.state;
    return (
      <div className={classes.root}>
        <div className={classes.topPane}>
          {isSourceCodeOpen
            ? (
              <CommonToolbar disableGutters={true} dense="true">
                <ToolbarButton
                  iconType="ArrowBack"
                  title="Functions Descriptions"
                  onClick={this.handleToggleSourceCode}
                  tooltip="Switch to the functions descriptions view"
                />
                <CommonToolbarDivider/>
                <ToolbarButton
                  iconType="Save"
                  iconColor="#4caf50"
                  title="Save Changes"
                  onClick={this.handleSaveChanges}
                  tooltip="Save recent changes"
                  switchedOn={sourceCodeUpdateCounter > 0}
                  disabled={sourceCodeUpdateCounter === 0}
                />
              </CommonToolbar>
            )
            : (
              <CommonToolbar disableGutters={true} dense="true">
                {/*<ToolbarButton*/}
                  {/*iconType="CloudUpload"*/}
                  {/*title="Publish"*/}
                  {/*onClick={this.handlePublish}*/}
                  {/*tooltip="Publish functions to the market"*/}
                {/*/>*/}
                {/*<CommonToolbarDivider/>*/}
                <ToolbarButton
                  iconType="Edit"
                  title="Source Code"
                  onClick={this.handleToggleSourceCode}
                  tooltip="Switch to the source code editor"
                />
              </CommonToolbar>
            )
          }
        </div>
        <div className={classes.centralPane}>
          {isSourceCodeOpen
            ? (
              <SourceCodeEditor
                isVisible={true}
                data={{ script: localSourceCode }}
                onChange={this.handleChangeSourceCode}
              />
            )
            : (
              <div className={classes.gridContainer}>
                <Grid columns={2} gap="30px">
                  {data.functionsDescriptions && data.functionsDescriptions.map(functionDescription => {
                    return (
                      <Cell
                        key={functionDescription.displayName}
                        width={1}
                        height={1}
                      >
                        <UserFunctionDescription
                          displayName={functionDescription.displayName}
                          comments={functionDescription.comments}
                          onSearchClick={onSearch}
                        />
                      </Cell>
                    );
                  })}
                </Grid>
              </div>
            )
          }
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(FunctionsFileView);
