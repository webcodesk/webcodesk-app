import isEmpty from 'lodash/isEmpty';
import values from 'lodash/values';
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import * as constants from '../../commons/constants';
import ResourceIcon from '../commons/ResourceIcon';
import PlaceholderSpan from '../commons/PlaceholderSpan';

const styles = theme => ({
  mutedText: {
    color: theme.palette.text.disabled,
  },
  errorText: {
    color: '#D50000',
  }
});

const PageTreeListItem = withStyles(theme => ({
  root: {
    alignItems: 'flex-start',
    position: 'relative',
    cursor: 'default',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    userSelect: 'none',
  },
  dense: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  }
}))(ListItem);

const PageTreeListItemText = withStyles({
  root: {
    padding: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }
})(ListItemText);

const PageTreeListItemIcon = withStyles({
  root: {
    marginRight: 0,
    padding: '3px',
  }
})(ListItemIcon);

class PageTreeItem extends React.Component {
  static propTypes = {
    node: PropTypes.object,
    paddingLeft: PropTypes.string,
    draggedItem: PropTypes.object,
    onClick: PropTypes.func,
    onErrorClick: PropTypes.func,
    onDrop: PropTypes.func,
  };

  static defaultProps = {
    node: null,
    paddingLeft: '0px',
    draggedItem: null,
    onClick: () => {
      console.info('PageTreeItem.onClick is not set');
    },
    onErrorClick: () => {
      console.info('PageTreeItem.onErrorClick is not set');
    },
    onDrop: () => {
      console.info('PageTreeItem.onDrop is not set');
    },
  };

  handleClick = () => {
    const { node: { key } } = this.props;
    this.props.onClick(key);
  };

  handleErrorClick = () => {
    const { node: {key, props}, onErrorClick, onClick } = this.props;
    if (props && props.errors) {
      onErrorClick(values(props.errors).map(error => ({message: error})));
    }
    onClick(key);
  };

  handleItemDrop = (droppedItem) => {
    const {node, onDrop} = this.props;
    if (droppedItem && node) {
      onDrop({
        destination: {
          key: node.key,
        },
        source: droppedItem,
      });
    }
  };

  render () {
    if (!this.props.node) {
      return null;
    }
    const { draggedItem, classes, node: {key, type, props}, paddingLeft } = this.props;
    if (type === constants.PAGE_COMPONENT_TYPE) {
      return (
        <PageTreeListItem
          key={key}
          style={{paddingLeft}}
          button={false}
          onClick={!isEmpty(props.errors) ? this.handleErrorClick : this.handleClick}
          selected={props.isSelected}
        >
          <PageTreeListItemIcon>
            <ResourceIcon resourceType={type} />
          </PageTreeListItemIcon>
          <PageTreeListItemText
            title={props.componentName}
            primary={
              isEmpty(props.errors)
                ? (
                  <span style={{whiteSpace: 'nowrap'}}>
                    <span className={classes.mutedText}>{props.elementProperty || 'root'}:&nbsp;</span>
                    <span>{props.componentInstance}</span>
                  </span>
                )
                  : (
                  <span className={classes.errorText} style={{whiteSpace: 'nowrap'}}>
                    <span>{props.elementProperty || 'root'}:&nbsp;</span>
                    <span>{props.componentInstance}</span>
                  </span>
                )
            }
          />
        </PageTreeListItem>
      );
    }
    return (
      <PageTreeListItem
        key={key}
        style={{paddingLeft}}
      >
        <PageTreeListItemIcon>
          <ResourceIcon resourceType={type} />
        </PageTreeListItemIcon>
        <PageTreeListItemText
          title={props.componentName}
          primary={
            props.componentInstance
              ? (
                <span style={{ whiteSpace: 'nowrap' }}>
                  <span className={classes.mutedText}>{props.elementProperty || 'root'}:&nbsp;</span>
                  <span>{props.componentInstance}</span>
                </span>
              )
              : (
                <span style={{ display: 'flex', whiteSpace: 'nowrap' }}>
                  <span className={classes.mutedText}>{props.elementProperty || 'root'}:&nbsp;</span>
                    <PlaceholderSpan
                      draggedItem={draggedItem}
                      onDrop={this.handleItemDrop}
                    >
                      &nbsp;
                    </PlaceholderSpan>
                </span>
              )

          }
        />
      </PageTreeListItem>
    );
  }
}

export default withStyles(styles)(PageTreeItem);
