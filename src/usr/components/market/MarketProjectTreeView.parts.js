import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';

export const MarketProjectList = withStyles(theme => ({
}))(List);

export const MarketProjectListItem = withStyles(theme => ({
  root: {
    // boxSizing: 'inherit',
    cursor: 'default',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    userSelect: 'none',
  },
  dense: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: '6px'
  }
}))(ListItem);

export const MarketProjectListItemText = withStyles({
  root: {
    padding: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }
})(ListItemText);

export const MarketProjectListItemIcon = withStyles({
  root: {
    marginRight: 0,
    padding: '3px',
  }
})(ListItemIcon);

export const MarketProjectListItemButton = withStyles({
  root: {
    padding: '3px',
    fontSize: '1em',
  }
})(IconButton);
