import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import PageTreeItem from './PageTreeItem';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    padding: '10px'
  },
  contentPane: {
    position: 'absolute',
    top: '32px',
    bottom: 0,
    right: 0,
    left: 0,
  }
});

class PageTree extends React.Component {
  static propTypes = {
    componentsTree: PropTypes.object,
    draggedItem: PropTypes.object,
    onItemClick: PropTypes.func,
    onItemErrorClick: PropTypes.func,
    onItemDrop: PropTypes.func,
  };

  static defaultProps = {
    componentsTree: null,
    draggedItem: null,
    onItemClick: () => {
      console.info('PageTree.onItemClick is not set');
    },
    onItemErrorClick: () => {
      console.info('PageTree.onItemErrorClick is not set');
    },
    onItemDrop: () => {
      console.info('PageTree.onItemDrop is not set');
    },
  };

  handleItemClick = (key) => {
    this.props.onItemClick(key);
  };

  handleItemErrorClick = (messages) => {
    this.props.onItemErrorClick(messages);
  };

  handleItemDrop = (data) => {
    this.props.onItemDrop(data);
  };

  createList = (node, draggedItem, level = 0) => {
    let result = [];
    if (node) {
      const { key, type, props, children } = node;
      const paddingLeft = `${(level * 16)}px`;
      result.push(
        <PageTreeItem
          key={key}
          node={{key, type, props}}
          paddingLeft={paddingLeft}
          onClick={this.handleItemClick}
          onErrorClick={this.handleItemErrorClick}
          onDrop={this.handleItemDrop}
          draggedItem={draggedItem}
        />
      );
      if (children && children.length > 0) {
        result = result.concat(children.map(child => this.createList(child, draggedItem, level + 1)));
      }
    }
    return result;
  };

  render () {
    const {classes, draggedItem} = this.props;
    return (
      <div className={classes.root}>
        <List
          key="pageTree"
          dense={true}
          disablePadding={true}
        >
          {this.createList(this.props.componentsTree, draggedItem)}
        </List>
      </div>
    );
  }
}

export default withStyles(styles)(PageTree);
