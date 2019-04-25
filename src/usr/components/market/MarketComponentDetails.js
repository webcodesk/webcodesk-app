import React from 'react';
import PropTypes from 'prop-types';
import MarkdownIt from 'markdown-it';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { PreTypography } from '../commons/Market.parts';
import {cutText} from "../commons/utils";

const styles = theme => ({
  root: {
    display: 'grid',
    gridTemplateColumns: '400px 1fr',
    gridGap: '16px',
    alignItems: 'start',
    justifyContent: 'start'
  },
  imageBox: {
    border: '1px solid #dddddd',
    borderRadius: '6px',
    marginBottom: '16px'
  },
  image: {
    width: '100%'
  }
});

class MarketComponentDetails extends React.Component {

  static propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    readmeText: PropTypes.string,
    imageSrc: PropTypes.string,
    onInstall: PropTypes.func,
  };

  static defaultProps = {
    title: 'Title',
    description: 'Description',
    readmeText: '',
    imageSrc: null,
    onInstall: () => {
      console.info('MarketComponentDetails.onInstall is not set');
    },
  };

  constructor(props, context) {
    super(props, context);
    this.markdown = new MarkdownIt();
  }

  handleInstall = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onInstall();
  };

  render () {
    const {classes, title, description, readmeText, imageSrc} = this.props;
    return (
      <div className={classes.root}>
        <div>
          {imageSrc && (
            <div className={classes.imageBox}>
              <img alt="Screenshot" className={classes.image} src={imageSrc} />
            </div>
          )}
          <Typography variant="h5" gutterBottom={true}>{cutText(title, 120)}</Typography>
          <PreTypography variant="body1" gutterBottom={true}>{description}</PreTypography>
          <Button variant="contained" color="primary" onClick={this.handleInstall}>Install</Button>
        </div>
        <div>
          <div
            className={`${classes.description} markdown-body`}
            dangerouslySetInnerHTML={{
              __html: this.markdown.render(readmeText)
            }}
          />
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(MarketComponentDetails);
