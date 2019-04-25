import { withStyles } from '@material-ui/core/styles';
import Badge from '@material-ui/core/Badge';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';

export const ResourceList = withStyles(theme => ({
  root: {
    borderBottom: '1px solid #f5f5f5',
  },
}))(List);

export const ResourceListItem = withStyles(theme => ({
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
    paddingLeft: '16px'
  }
}))(ListItem);

export const ResourceListItemText = withStyles({
  root: {
    padding: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }
})(ListItemText);

export const ResourceListItemErrorText = withStyles({
  root: {
    padding: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  primary: {
    color: '#D50000',
  }
})(ListItemText);

export const ResourceListItemIcon = withStyles({
  root: {
    marginRight: 0,
    padding: '3px',
  }
})(ListItemIcon);

export const ResourceListItemButton = withStyles({
  root: {
    padding: '3px',
    fontSize: '1em',
  }
})(IconButton);

export const ResourceListSubheader = withStyles(theme => ({
  root: {
    cursor: 'default',
    lineHeight: 'normal',
    paddingTop: '6px',
    paddingBottom: '6px',
    paddingLeft: '16px',
    height: '36px',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  }
}))(ListSubheader);

export const ResourceSubheaderErrorBadge = withStyles(theme => ({
  colorSecondary: {
    width: '10px',
    height: '10px',
    top: '-3px',
    right: '-10px',
  }
}))(Badge);
