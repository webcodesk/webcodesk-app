import forOwn from 'lodash/forOwn';
import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import {
  MarketProjectListItem,
  MarketProjectListItemText,
  MarketProjectListItemButton
} from './MarketProjectTreeView.parts';

import ResourceIcon from '../commons/ResourceIcon';
import constants from '../../commons/constants';

const styles = theme => ({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    overflow: 'auto',
  },
  listItemPrefixSector: {
    display: 'flex',
    alignItems: 'center',
    width: '24px',
  },
});

const TREE_VIEW_INDENT_WIDTH = 21;

const rootListStyle = {
  minWidth: `${180 + (TREE_VIEW_INDENT_WIDTH * 3)}px`
};

class MarketProjectTreeView extends React.Component {
  static propTypes = {
    selectedItem: PropTypes.object,
    treeData: PropTypes.object,
    onSelectItem: PropTypes.func,
  };

  static defaultProps = {
    selectedItem: {},
    treeData: {},
    onSelectItem: () => {
      console.info('MarketProjectTreeView.onSelectItem is not set');
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      collapsedKeys: {}
    };
  }

  handleToggleExpandKey = (key) => (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const collapsedKeys = {...this.state.collapsedKeys};
    collapsedKeys[key] = !collapsedKeys[key];
    this.setState({collapsedKeys});
  };

  handleSelectItem = (group, componentId) => (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const { treeData, onSelectItem } = this.props;
    onSelectItem(treeData, group, componentId);
  };

  createRootList = (treeData) => {
    const {classes, selectedItem} = this.props;
    const {collapsedKeys} = this.state;
    const result = [];
    const {projectId, name: projectName, groups} = treeData;
    let selectedItemKey;
    if (selectedItem.componentId) {
      selectedItemKey = `component_${selectedItem.componentId}`;
    } else if (selectedItem.groupName) {
      selectedItemKey = `${projectId}_group_${selectedItem.groupName}`;
    } else if (selectedItem.projectId) {
      selectedItemKey = `project_${selectedItem.projectId}`;
    }
    const projectItemKey = `project_${projectId}`;
    result.push(
      <MarketProjectListItem
        key={projectItemKey}
        style={rootListStyle}
        dense={true}
        component="div"
        disableGutters={true}
        selected={projectItemKey === selectedItemKey}
        onClick={this.handleSelectItem()}
      >
        <div className={classes.listItemPrefixSector}>
          <MarketProjectListItemButton onClick={this.handleToggleExpandKey(projectItemKey)}>
            <ResourceIcon
              resourceType={constants.MARKET_PROJECT_TYPE}
            />
          </MarketProjectListItemButton>
        </div>
        <MarketProjectListItemText
          primary={projectName}
        />
      </MarketProjectListItem>
    );
    if (!collapsedKeys[projectItemKey] && groups) {
      forOwn(groups, (groupItem, groupName) => {
        const groupItemKey = `${projectId}_group_${groupName}`;
        result.push(
          <MarketProjectListItem
            key={groupItemKey}
            style={{paddingLeft: '20px'}}
            dense={true}
            component="div"
            disableGutters={true}
            selected={selectedItemKey === groupItemKey}
            onClick={this.handleSelectItem(groupName)}
          >
            <div className={classes.listItemPrefixSector}>
              <MarketProjectListItemButton onClick={this.handleToggleExpandKey(groupItemKey)}>
                <ResourceIcon
                  isOutlined={!collapsedKeys[groupItemKey]}
                  resourceType={constants.GRAPH_MODEL_DIR_TYPE}
                />
              </MarketProjectListItemButton>
            </div>
            <MarketProjectListItemText
              primary={groupName}
            />
          </MarketProjectListItem>
        );
        if (!collapsedKeys[groupItemKey] && groupItem.components && groupItem.components.length > 0) {
          let componentItemKey;
          groupItem.components.forEach(componentItem => {
            componentItemKey = `component_${componentItem.id}`;
            result.push(
              <MarketProjectListItem
                key={componentItemKey}
                style={{paddingLeft: `${20 + TREE_VIEW_INDENT_WIDTH}px`}}
                dense={true}
                component="div"
                disableGutters={true}
                selected={selectedItemKey === componentItemKey}
                onClick={this.handleSelectItem(groupName, componentItem.id)}
              >
                <div className={classes.listItemPrefixSector}>
                  <ResourceIcon
                    resourceType={
                      componentItem.type === 'component'
                        ? constants.GRAPH_MODEL_COMPONENT_TYPE
                        : constants.GRAPH_MODEL_USER_FUNCTION_TYPE
                    }
                  />
                </div>
                <MarketProjectListItemText
                  primary={componentItem.name}
                />
              </MarketProjectListItem>
            );
          });
        }
      });
    }
    return result;
  };

  render() {
    const {classes, treeData} = this.props;
    return (
      <div className={classes.root}>
        {this.createRootList(treeData)}
      </div>
    );
  }
}

export default withStyles(styles)(MarketProjectTreeView);
