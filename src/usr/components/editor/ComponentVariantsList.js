import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

const VariantListItem = withStyles(theme => ({
  root: {
    alignItems: 'flex-start',
    position: 'relative'
  },
  dense: {
    paddingTop: '2px',
    paddingBottom: '2px',
  }
}))(ListItem);

const VariantListItemText = withStyles({
  root: {
    padding: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }
})(ListItemText);

const styles = theme => ({
  root: {
    padding: '10px',
    minWidth: '150px'
  },
});

class ComponentVariantsList extends React.Component {
  static propTypes = {
    variants: PropTypes.array,
    selectedIndex: PropTypes.number,
    onChangeSelected: PropTypes.func,
  };

  static defaultProps = {
    variants: [],
    selectedIndex: 0,
    onChangeSelected: () => {
      console.info('ComponentVariantsList.onChangeSelected is not set');
    }
  };

  handleListItemClick = (index) => (event) => {
    this.props.onChangeSelected(index);
  };

  render () {
    const { selectedIndex, variants, classes } = this.props;
    const list = [];
    if (variants && variants.length > 0) {
      variants.forEach((variant, index) => {
        list.push(
          <VariantListItem
            key={`storyListItem_${index}`}
            button={true}
            selected={selectedIndex === index + 1}
            onClick={this.handleListItemClick(index + 1)}
          >
            <VariantListItemText primary={variant}/>
          </VariantListItem>
        );
      });
    }
    return (
      <div className={classes.root}>
        <List component="nav" disablePadding={true} dense={true}>
          <VariantListItem
            key="storyListItem_default"
            button={true}
            selected={selectedIndex === 0}
            onClick={this.handleListItemClick(0)}
          >
            <VariantListItemText primary="Default Story"/>
          </VariantListItem>
          {list}
        </List>
      </div>
    );
  }
}

export default withStyles(styles)(ComponentVariantsList);
