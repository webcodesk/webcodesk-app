import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MarkdownIt from 'markdown-it';

const styles = theme => ({
  root: {
    padding: '10px',
    minWidth: '150px',
  },
  description: {
    fontSize: '14px'
  },
  propertyItem: {
    marginTop: '10px',
    marginBottom: '10px'
  },
  propertyItemTitle: {
    fontWeight: 'bold'
  },
  propertyItemDescription: {
    fontWeight: 400
  },
  propertyItemNoDescription: {
    color: '#b3b3b3',
    fontWeight: 400
  },
});

class ComponentDescription extends React.Component {
  static propTypes = {
    displayName: PropTypes.string,
    comments: PropTypes.array,
    properties: PropTypes.array,
  };

  static defaultProps = {
    displayName: null,
    comments: [],
    properties: [],
  };

  constructor (props) {
    super(props);
    this.markdown = new MarkdownIt();
  }

  render () {
    const {displayName, comments, properties, classes} = this.props;
    if (displayName) {
      let descriptionText = comments && comments.length > 0
        ? comments.join('\n').trim()
        : `${displayName} (no description)`;
      descriptionText += '\n\n **** \n\n Properties: \n\n';
      properties.forEach(property => {
        let propertyComments = property.comments && property.comments.length > 0
          ? property.comments.join('\n').trim()
          : 'no description';
        descriptionText += `* **${property.name}** - ${propertyComments}\n\n\n`;
      });
      return (
        <div className={classes.root}>
          <div
            className={classes.description}
            dangerouslySetInnerHTML={{
              __html: this.markdown.render(descriptionText)
            }}
          />
        </div>
      );
    }
    return <span>Empty description</span>
  }
}

export default withStyles(styles)(ComponentDescription);
