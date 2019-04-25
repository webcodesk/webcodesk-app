import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ResourceIcon from '../commons/ResourceIcon';
import {
  ResourceList,
  ResourceSubheaderErrorBadge,
  ResourceListItem,
  ResourceListItemText,
  ResourceListItemErrorText,
  ResourceListItemIcon,
  ResourceListItemButton,
  ResourceListSubheader,
} from './ResourcesTreeView.parts';
import ToolbarButton from '../commons/ToolbarButton';

import constants from '../../commons/constants';
import DraggableWrapper from './DraggableWrapper';

const TREE_VIEW_INDENT_WIDTH = 21;

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
  highlightedText: {
    borderRadius: '4px',
    padding: '4px',
    backgroundColor: '#fff176'
  },
  strikeThroughText: {
    textDecoration: 'line-through',
    color: theme.palette.grey['600'],
  },
  subheaderContainer: {
    display: 'flex',
    alignItems: 'center',
    height: '24px',
    paddingRight: '16px'
  },
  subheaderText: {
    flexGrow: 1,
  },
  subheaderButton: {
    flexGrow: 0,
  }
});

class ResourcesTreeView extends React.Component {
  static propTypes = {
    resourcesTreeViewObject: PropTypes.object,
    selectedResourceKey: PropTypes.string,
    selectedResource: PropTypes.object,
    selectedVirtualPath: PropTypes.string,
    expandedResourceKeys: PropTypes.object,
    highlightedResourceKeys: PropTypes.object,
    onSelectResourceTreeViewItem: PropTypes.func,
    onContextResourceTreeViewItem: PropTypes.func,
    onDoubleClickResourceTreeViewItem: PropTypes.func,
    onToggleResourceTreeViewItem: PropTypes.func,
    onItemDragStart: PropTypes.func,
    onItemDragEnd: PropTypes.func,
    onCreatePage: PropTypes.func,
    onCopyPage: PropTypes.func,
    onEditPage: PropTypes.func,
    onCreateFlow: PropTypes.func,
    onCopyFlow: PropTypes.func,
    onEditFlow: PropTypes.func,
    onDeletePage: PropTypes.func,
    onDeleteFlow: PropTypes.func,
    onCreateComponent: PropTypes.func,
    onCreateFunctions: PropTypes.func,
    onOpenMarket: PropTypes.func,
  };

  static defaultProps = {
    resourcesTreeViewObject: {},
    selectedResourceKey: null,
    selectedResource: null,
    selectedVirtualPath: null,
    expandedResourceKeys: {},
    highlightedResourceKeys: {},
    onSelectResourceTreeViewItem: () => {
      console.info('ResourcesTreeView.onSelectResourceTreeViewItem is not set');
    },
    onContextResourceTreeViewItem: () => {
      console.info('ResourcesTreeView.onContextResourceTreeViewItem is not set');
    },
    onDoubleClickResourceTreeViewItem: () => {
      console.info('ResourcesTreeView.onDoubleClickResourceTreeViewItem is not set');
    },
    onToggleResourceTreeViewItem: () => {
      console.info('ResourcesTreeView.onToggleResourceTreeViewItem is not set');
    },
    onItemDragStart: () => {
      console.info('ResourcesTreeView.onItemDragStart is not set');
    },
    onItemDragEnd: () => {
      console.info('ResourcesTreeView.onItemDragEnd is not set');
    },
    onCreatePage: () => {
      console.info('ResourcesTreeView.onCreatePage is not set');
    },
    onCopyPage: () => {
      console.info('ResourcesTreeView.onCopyPage is not set');
    },
    onEditPage: () => {
      console.info('ResourcesTreeView.onEditPage is not set');
    },
    onCreateFlow: () => {
      console.info('ResourcesTreeView.onCreateFlow is not set');
    },
    onCopyFlow: () => {
      console.info('ResourcesTreeView.onCopyFlow is not set');
    },
    onEditFlow: () => {
      console.info('ResourcesTreeView.onEditFlow is not set');
    },
    onDeletePage: () => {
      console.info('ResourcesTreeView.onDeletePage is not set');
    },
    onDeleteFlow: () => {
      console.info('ResourcesTreeView.onDeleteFlow is not set');
    },
    onCreateComponent: () => {
      console.info('ResourcesTreeView.onCreateComponent is not set');
    },
    onCreateFunctions: () => {
      console.info('ResourcesTreeView.onCreateFunctions is not set');
    },
    onOpenMarket: () => {
      console.info('ResourcesTreeView.onOpenMarket is not set');
    },
  };

  handleLivePreview = () => {
    this.props.onLivePreview();
  };

  handleToggleExpandItem = (key) => (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onToggleResourceTreeViewItem(key);
  };

  handleSelectItem = (key, virtualPath) => (e) => {
    this.props.onSelectResourceTreeViewItem({ resourceKey: key, virtualPath });
  };

  handleContextItem = (key, virtualPath) => (e) => {
    this.props.onContextResourceTreeViewItem({ resourceKey: key, virtualPath });
  };

  handleDoubleClickItem = (key) => (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onDoubleClickResourceTreeViewItem(key);
  };

  handleItemDragStart = (key) => {
    this.props.onItemDragStart(key);
  };

  handleItemDragEnd = (key) => {
    this.props.onItemDragEnd(key);
  };

  handleNoop = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  handleCreateNewResource = (resourceType) => () => {
    const {
      selectedResource,
      selectedVirtualPath,
      onCreatePage,
      onCreateFlow,
      onCreateComponent,
      onCreateFunctions
    } = this.props;
    let dirPath = '';
    if (resourceType === constants.GRAPH_MODEL_PAGES_ROOT_TYPE) {
      if (selectedResource && selectedResource.isInPages) {
        dirPath = selectedVirtualPath;
      }
      onCreatePage({ virtualPath: dirPath });
    } else if (resourceType === constants.GRAPH_MODEL_FLOWS_ROOT_TYPE) {
      if (selectedResource && selectedResource.isInFlows) {
        dirPath = selectedVirtualPath;
      }
      onCreateFlow({ virtualPath: dirPath });
    } else if (resourceType === constants.GRAPH_MODEL_COMPONENTS_ROOT_TYPE) {
      if (selectedResource && selectedResource.isInComponents) {
        dirPath = selectedVirtualPath;
      }
      onCreateComponent({ virtualPath: dirPath });
    } else if (resourceType === constants.GRAPH_MODEL_USER_FUNCTIONS_ROOT_TYPE) {
      if (selectedResource && selectedResource.isInUserFunctions) {
        dirPath = selectedVirtualPath;
      }
      onCreateFunctions({ virtualPath: dirPath });
    }
  };

  handleCopyResource = (resourceType) => () => {
    const { selectedResource, selectedVirtualPath, onCopyFlow, onCopyPage } = this.props;
    if (selectedResource) {
      if (selectedResource.isInPages && resourceType === constants.GRAPH_MODEL_PAGES_ROOT_TYPE) {
        onCopyPage({ resource: selectedResource, virtualPath: selectedVirtualPath });
      } else if (selectedResource.isInFlows && resourceType === constants.GRAPH_MODEL_FLOWS_ROOT_TYPE) {
        onCopyFlow({ resource: selectedResource, virtualPath: selectedVirtualPath });
      }
    }
  };

  // handleEditResource = (resourceType) => () => {
  //   const { selectedResource, onEditFlow, onEditPage } = this.props;
  //   if (resourceType === constants.GRAPH_MODEL_PAGES_ROOT_TYPE) {
  //     onEditPage(selectedResource);
  //   } else if(resourceType === constants.GRAPH_MODEL_FLOWS_ROOT_TYPE) {
  //     onEditFlow(selectedResource);
  //   }
  // };

  handleDeleteSelected = () => {
    const { selectedResource, onDeleteFlow, onDeletePage } = this.props;
    if (selectedResource) {
      if (selectedResource.isInFlows) {
        onDeleteFlow(selectedResource);
      } else if (selectedResource.isInPages) {
        onDeletePage(selectedResource);
      }
    }
  };

  handleOpenMarket = () => {
    this.props.onOpenMarket();
  };

  createLists = (resourcesList, virtualPath = '', level = 0) => {
    const { selectedResourceKey, expandedResourceKeys, highlightedResourceKeys, classes } = this.props;
    let list = [];
    let totalLevels = level;
    if (resourcesList && resourcesList.length > 0) {
      resourcesList.forEach(resourceItem => {
        const { type, props, key, children } = resourceItem;
        let listItems = [];
        let elementKey = `${key}_${type}`;
        if (children && children.length > 0 && expandedResourceKeys[key]) {
          let parentVirtualPath = virtualPath;
          if (type === constants.GRAPH_MODEL_DIR_TYPE) {
            parentVirtualPath = virtualPath && virtualPath.length > 0
              ? `${virtualPath}${constants.FILE_SEPARATOR}${props.displayName}`
              : props.displayName;
          }
          const { list: childList, totalLevels: childTotalLevels } =
            this.createLists(children, parentVirtualPath, level + 1);
          listItems = listItems.concat(childList);
          totalLevels = childTotalLevels;
        }
        const paddingLeft = `${20 + (level * TREE_VIEW_INDENT_WIDTH)}px`;
        if (type === constants.GRAPH_MODEL_DIR_TYPE) {
          list.push(
            <ResourceListItem
              key={elementKey}
              style={{ paddingLeft }}
              component="div"
              dense={true}
              disableGutters={true}
              selected={key === selectedResourceKey}
              onClick={this.handleSelectItem(key, virtualPath)}
              onContextMenu={this.handleContextItem(key, virtualPath)}
              onDoubleClick={this.handleToggleExpandItem(key)}
            >
              <div className={classes.listItemPrefixSector}>
                <ResourceListItemButton onClick={this.handleToggleExpandItem(key)}>
                  <ResourceIcon
                    isMuted={true}
                    isOutlined={expandedResourceKeys[key]}
                    resourceType={type}
                  />
                </ResourceListItemButton>
              </div>
              {props.hasErrors
                ? (
                  <ResourceListItemErrorText
                    primary={props.displayName}
                  />
                )
                : (
                  <ResourceListItemText
                    primary={props.displayName}
                  />
                )
              }
            </ResourceListItem>
          );
          if (expandedResourceKeys[key]) {
            list = list.concat(listItems);
          }
        } else if (type === constants.GRAPH_MODEL_FILE_TYPE) {
          if (
            children && children.length === 1
            && (
              children[0].type === constants.GRAPH_MODEL_COMPONENT_TYPE
              || children[0].type === constants.GRAPH_MODEL_FUNCTIONS_TYPE
              || children[0].type === constants.GRAPH_MODEL_PAGE_TYPE
              || children[0].type === constants.GRAPH_MODEL_FLOW_TYPE
            )
          ) {
            const { list: childList } = this.createLists(children, virtualPath, level);
            list = list.concat(childList);
          } else {
            list.push(
              <ResourceListItem
                key={elementKey}
                style={{ paddingLeft }}
                dense={true}
                component="div"
                disableGutters={true}
                selected={key === selectedResourceKey}
                onClick={this.handleSelectItem(key, virtualPath)}
                onContextMenu={this.handleContextItem(key, virtualPath)}
              >
                <div className={classes.listItemPrefixSector}>
                  <ResourceListItemButton onClick={this.handleToggleExpandItem(key)}>
                    <ResourceIcon
                      isMuted={true}
                      isOutlined={expandedResourceKeys[key]}
                      resourceType={type}
                    />
                  </ResourceListItemButton>
                </div>
                <ResourceListItemText primary={props.displayName}/>
              </ResourceListItem>
            );
            if (expandedResourceKeys[key]) {
              list = list.concat(listItems);
            }
          }
        } else if (type === constants.GRAPH_MODEL_FUNCTIONS_TYPE) {
          list.push(
            <ResourceListItem
              key={elementKey}
              style={{ paddingLeft }}
              dense={true}
              component="div"
              disableGutters={true}
              selected={key === selectedResourceKey}
              onClick={this.handleSelectItem(key, virtualPath)}
              onDoubleClick={this.handleDoubleClickItem(key)}
            >
              <div className={classes.listItemPrefixSector}>
                <ResourceListItemButton onClick={this.handleToggleExpandItem(key)}>
                  <ResourceIcon
                    isMuted={true}
                    resourceType={type}
                  />
                </ResourceListItemButton>
              </div>
              <ResourceListItemText
                primary={
                  highlightedResourceKeys[key]
                    ? <span className={classes.highlightedText}>{props.displayName}</span>
                    : props.displayName
                }
              />
            </ResourceListItem>
          );
          if (expandedResourceKeys[key]) {
            list = list.concat(listItems);
          }
        } else if (type === constants.GRAPH_MODEL_USER_FUNCTION_TYPE) {
          list.push(
            <DraggableWrapper
              onDragStart={this.handleItemDragStart}
              onDragEnd={this.handleItemDragEnd}
              key={elementKey}
              resourceKey={key}
            >
              <ResourceListItem
                key={elementKey}
                style={{ paddingLeft }}
                dense={true}
                component="div"
                disableGutters={true}
                selected={key === selectedResourceKey}
                onClick={this.handleSelectItem(key, virtualPath)}
                onDoubleClick={this.handleDoubleClickItem(key)}
              >
                <div className={classes.listItemPrefixSector}>
                  <ResourceListItemIcon>
                    <ResourceIcon
                      resourceType={type}
                    />
                  </ResourceListItemIcon>
                </div>
                <ResourceListItemText
                  title={props.functionName}
                  primary={
                    highlightedResourceKeys[key]
                      ? <span className={classes.highlightedText}>{props.displayName}</span>
                      : props.displayName
                  }
                />
              </ResourceListItem>
            </DraggableWrapper>
          );
        } else if (type === constants.GRAPH_MODEL_COMPONENT_TYPE) {
          list.push(
            <DraggableWrapper
              onDragStart={this.handleItemDragStart}
              onDragEnd={this.handleItemDragEnd}
              key={elementKey}
              resourceKey={key}
            >
              <ResourceListItem
                style={{ paddingLeft }}
                dense={true}
                component="div"
                disableGutters={true}
                selected={key === selectedResourceKey}
                onClick={this.handleSelectItem(key, virtualPath)}
                onDoubleClick={this.handleDoubleClickItem(key)}
              >
                <div className={classes.listItemPrefixSector}>
                  <ResourceListItemIcon>
                    <ResourceIcon
                      resourceType={type}
                    />
                  </ResourceListItemIcon>
                </div>
                <ResourceListItemText
                  title={props.componentName}
                  primary={
                    highlightedResourceKeys[key]
                      ? <span className={classes.highlightedText}>{props.displayName}</span>
                      : props.displayName
                  }
                />
              </ResourceListItem>
            </DraggableWrapper>
          );
        } else if (type === constants.GRAPH_MODEL_PAGE_TYPE) {
          list.push(
            <DraggableWrapper
              onDragStart={this.handleItemDragStart}
              onDragEnd={this.handleItemDragEnd}
              key={elementKey}
              resourceKey={key}
            >
              <ResourceListItem
                key={elementKey}
                style={{ paddingLeft }}
                dense={true}
                component="div"
                disableGutters={true}
                selected={key === selectedResourceKey}
                onClick={this.handleSelectItem(key, virtualPath)}
                onDoubleClick={this.handleDoubleClickItem(key)}
                onContextMenu={this.handleContextItem(key, virtualPath)}
              >
                <div className={classes.listItemPrefixSector}>
                  <ResourceListItemButton onClick={this.handleToggleExpandItem(key)}>
                    <ResourceIcon
                      isMuted={true}
                      resourceType={type}
                    />
                  </ResourceListItemButton>
                </div>
                {props.hasErrors
                  ? (
                    <ResourceListItemErrorText title={props.pagePath} primary={props.displayName}/>
                  )
                  : (
                    <ResourceListItemText
                      title={props.pagePath}
                      primary={
                        highlightedResourceKeys[key]
                          ? <span className={classes.highlightedText}>{props.displayName}</span>
                          : props.displayName
                      }
                    />
                  )
                }
              </ResourceListItem>
            </DraggableWrapper>
          );
          if (expandedResourceKeys[key]) {
            list = list.concat(listItems);
          }
        } else if (type === constants.GRAPH_MODEL_COMPONENT_INSTANCE_TYPE) {
          list.push(
            <DraggableWrapper
              onDragStart={this.handleItemDragStart}
              onDragEnd={this.handleItemDragEnd}
              key={elementKey}
              resourceKey={key}
            >
              <ResourceListItem
                key={elementKey}
                style={{ paddingLeft }}
                dense={true}
                component="div"
                disableGutters={true}
                selected={key === selectedResourceKey}
                onClick={this.handleSelectItem(key, virtualPath)}
                onDoubleClick={this.handleDoubleClickItem(key)}
              >
                <div className={classes.listItemPrefixSector}>
                  <ResourceListItemIcon>
                    <ResourceIcon
                      resourceType={type}
                    />
                  </ResourceListItemIcon>
                </div>
                <ResourceListItemText
                  title={props.componentName}
                  primary={
                    highlightedResourceKeys[key]
                      ? <span className={classes.highlightedText}>{props.displayName}</span>
                      : props.displayName
                  }
                />
              </ResourceListItem>
            </DraggableWrapper>
          );
        } else if (type === constants.GRAPH_MODEL_FLOW_TYPE) {
          let itemTextClassNames = '';
          if (props.isDisabled) {
            itemTextClassNames = classes.strikeThroughText;
          }
          if (highlightedResourceKeys[key]) {
            itemTextClassNames += ' ' + classes.highlightedText;
          }
          list.push(
            <ResourceListItem
              key={elementKey}
              style={{ paddingLeft }}
              dense={true}
              component="div"
              disableGutters={true}
              selected={key === selectedResourceKey}
              onClick={this.handleSelectItem(key, virtualPath)}
              onDoubleClick={this.handleDoubleClickItem(key)}
              onContextMenu={this.handleContextItem(key, virtualPath)}
            >
              <div className={classes.listItemPrefixSector}>
                <ResourceListItemButton onClick={this.handleToggleExpandItem(key)}>
                  <ResourceIcon
                    isMuted={true}
                    resourceType={type}
                  />
                </ResourceListItemButton>
              </div>
              {props.hasErrors
                ? (
                  <ResourceListItemErrorText
                    primary={<span className={itemTextClassNames}>{props.displayName}</span>}
                  />
                )
                : (
                  <ResourceListItemText
                    primary={<span className={itemTextClassNames}>{props.displayName}</span>}
                  />
                )
              }
            </ResourceListItem>
          );
          if (expandedResourceKeys[key]) {
            list = list.concat(listItems);
          }
        } else if (type === constants.GRAPH_MODEL_FLOW_COMPONENT_INSTANCE_TYPE) {
          list.push(
            <DraggableWrapper
              onDragStart={this.handleItemDragStart}
              onDragEnd={this.handleItemDragEnd}
              key={elementKey}
              resourceKey={key}
            >
              <ResourceListItem
                key={elementKey}
                style={{ paddingLeft }}
                dense={true}
                component="div"
                disableGutters={true}
                selected={key === selectedResourceKey}
                onClick={this.handleSelectItem(key, virtualPath)}
                onDoubleClick={this.handleDoubleClickItem(key)}
              >
                <div className={classes.listItemPrefixSector}>
                  <ResourceListItemIcon>
                    <ResourceIcon
                      resourceType={type}
                    />
                  </ResourceListItemIcon>
                </div>
                <ResourceListItemText
                  title={props.componentName}
                  primary={
                    highlightedResourceKeys[key]
                      ? <span className={classes.highlightedText}>{props.displayName}</span>
                      : props.displayName
                  }
                />
              </ResourceListItem>
            </DraggableWrapper>
          );
        } else if (type === constants.GRAPH_MODEL_FLOW_PAGE_TYPE) {
          list.push(
            <DraggableWrapper
              onDragStart={this.handleItemDragStart}
              onDragEnd={this.handleItemDragEnd}
              key={elementKey}
              resourceKey={key}
            >
              <ResourceListItem
                key={elementKey}
                style={{ paddingLeft }}
                dense={true}
                component="div"
                disableGutters={true}
                selected={key === selectedResourceKey}
                onClick={this.handleSelectItem(key, virtualPath)}
                onDoubleClick={this.handleDoubleClickItem(key)}
              >
                <div className={classes.listItemPrefixSector}>
                  <ResourceListItemIcon>
                    <ResourceIcon
                      isMuted={true}
                      resourceType={type}
                    />
                  </ResourceListItemIcon>
                </div>
                <ResourceListItemText
                  title={props.pagePath}
                  primary={
                    highlightedResourceKeys[key]
                      ? <span className={classes.highlightedText}>{props.displayName}</span>
                      : props.displayName
                  }
                />
              </ResourceListItem>
            </DraggableWrapper>
          );
        } else if (type === constants.GRAPH_MODEL_FLOW_USER_FUNCTION_TYPE) {
          list.push(
            <DraggableWrapper
              onDragStart={this.handleItemDragStart}
              onDragEnd={this.handleItemDragEnd}
              key={elementKey}
              resourceKey={key}
            >
              <ResourceListItem
                key={elementKey}
                style={{ paddingLeft }}
                dense={true}
                component="div"
                disableGutters={true}
                selected={key === selectedResourceKey}
                onClick={this.handleSelectItem(key, virtualPath)}
                onDoubleClick={this.handleDoubleClickItem(key)}
              >
                <div className={classes.listItemPrefixSector}>
                  <ResourceListItemIcon>
                    <ResourceIcon
                      resourceType={type}
                    />
                  </ResourceListItemIcon>
                </div>
                <ResourceListItemText
                  title={props.functionName}
                  primary={
                    highlightedResourceKeys[key]
                      ? <span className={classes.highlightedText}>{props.displayName}</span>
                      : props.displayName
                  }
                />
              </ResourceListItem>
            </DraggableWrapper>
          );
        }
      });
    }
    return { list, totalLevels };
  };

  createRootList = (resourceObject) => {
    const { children } = resourceObject;
    const { list, totalLevels } = this.createLists(children);
    return {
      totalLevels,
      rootResourceItem: resourceObject,
      list,
    };
  };

  render () {
    const { resourcesTreeViewObject, selectedResource, classes } = this.props;
    const rootLists = [];
    let maxWidth = 0;
    const { flows, pages, userComponents, userFunctions } = resourcesTreeViewObject;
    // sort roots in the custom order
    [flows, userFunctions, pages, userComponents].forEach(resourceObject => {
      if (resourceObject) {
        const { totalLevels, rootResourceItem, list } = this.createRootList(resourceObject);
        maxWidth = maxWidth < totalLevels ? totalLevels : maxWidth;
        rootLists.push({
          rootResourceItem,
          list,
        });
      }
    });
    let lists = [];
    const rootListStyle = { minWidth: `${240 + (TREE_VIEW_INDENT_WIDTH * maxWidth)}px` };
    if (rootLists && rootLists.length > 0) {
      let subheaderButtons;
      rootLists.forEach(rootListItem => {
        const { type, props, key } = rootListItem.rootResourceItem;
        subheaderButtons = [];
        if (type === constants.GRAPH_MODEL_FLOWS_ROOT_TYPE || type === constants.GRAPH_MODEL_PAGES_ROOT_TYPE) {
          subheaderButtons = [
            (<div key={`createNew_${key}`} className={classes.subheaderButton}>
              <ToolbarButton
                iconType="NoteAdd"
                primary={true}
                onClick={this.handleCreateNewResource(type)}
                tooltip="Create new"
              />
            </div>),
            (<div key={`copy_${key}`} className={classes.subheaderButton}>
              <ToolbarButton
                iconType="FileCopy"
                primary={true}
                disabled={
                  !selectedResource || (
                    type === constants.GRAPH_MODEL_FLOWS_ROOT_TYPE &&
                    (!selectedResource.isInFlows || !selectedResource.isFlow)
                  ) || (
                    type === constants.GRAPH_MODEL_PAGES_ROOT_TYPE &&
                    (!selectedResource.isInPages || !selectedResource.isPage)
                  )
                }
                tooltip="Copy"
                onClick={this.handleCopyResource(type)}
              />
            </div>),
            (<div key={`delete_${key}`} className={classes.subheaderButton}>
              <ToolbarButton
                iconType="Delete"
                primary={true}
                disabled={
                  !selectedResource || (
                    type === constants.GRAPH_MODEL_FLOWS_ROOT_TYPE &&
                    (!selectedResource.isInFlows || !selectedResource.isFlow)
                  ) || (
                    type === constants.GRAPH_MODEL_PAGES_ROOT_TYPE &&
                    (!selectedResource.isInPages || !selectedResource.isPage)
                  )
                }
                tooltip="Delete"
                onClick={this.handleDeleteSelected}
              />
            </div>)
          ];
        } else if (type === constants.GRAPH_MODEL_COMPONENTS_ROOT_TYPE) {
          subheaderButtons = [
            (<div key={`createNew_${key}`} className={classes.subheaderButton}>
              <ToolbarButton
                iconType="NoteAdd"
                primary={true}
                onClick={this.handleCreateNewResource(type)}
                tooltip="Scaffold a new component"
              />
            </div>),
            (<div key={`openMarket_${key}`} className={classes.subheaderButton}>
              <ToolbarButton
                iconType="CloudDownload"
                primary={true}
                onClick={this.handleOpenMarket}
                tooltip="Install components from the market"
              />
            </div>),
          ];
        } else if (type === constants.GRAPH_MODEL_USER_FUNCTIONS_ROOT_TYPE) {
          subheaderButtons = [
            (<div key={`createNew_${key}`} className={classes.subheaderButton}>
              <ToolbarButton
                iconType="NoteAdd"
                primary={true}
                onClick={this.handleCreateNewResource(type)}
                tooltip="Scaffold a new functions list"
              />
            </div>),
            (<div key={`openMarket_${key}`} className={classes.subheaderButton}>
              <ToolbarButton
                iconType="CloudDownload"
                primary={true}
                onClick={this.handleOpenMarket}
                tooltip="Install functions list from the market"
              />
            </div>),
          ];
        }
        lists.push(
          <ResourceList
            key={`${key}_${type}`}
            component="div"
            dense={true}
            style={rootListStyle}
            disablePadding={true}
            subheader={
              <ResourceListSubheader
                component="div"
                disableSticky={true}
                color="primary"
                disableGutters={true}
                onContextMenu={this.handleContextItem(key)}
              >
                <div className={classes.subheaderContainer}>
                  <div className={classes.subheaderText}>
                    {props.hasErrors
                      ? (
                        <ResourceSubheaderErrorBadge badgeContent={' '} color="secondary">
                          <span>{props.displayName}</span>
                        </ResourceSubheaderErrorBadge>
                      )
                      : (
                        <span>{props.displayName}</span>
                      )}
                  </div>
                  {subheaderButtons}
                </div>
              </ResourceListSubheader>
            }
          >
            {rootListItem.list}
          </ResourceList>
        );
      });
    }
    return (
      <div className={classes.root}>
        {lists}
        <div style={{ height: '7em', width: '100%' }}/>
      </div>
    );
  }
}

export default withStyles(styles)(ResourcesTreeView);
