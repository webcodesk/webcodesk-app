import React from 'react';
import PropTypes from 'prop-types';
import constants from '../../commons/constants';
import Image from '@material-ui/icons/Image';
import Description from '@material-ui/icons/Description';
import DescriptionOutlined from '@material-ui/icons/DescriptionOutlined';
import Folder from '@material-ui/icons/Folder';
import FolderOutlined from '@material-ui/icons/FolderOutlined';
import Dashboard from '@material-ui/icons/Dashboard';
import DashboardOutlined from '@material-ui/icons/DashboardOutlined';
import CropOriginal from '@material-ui/icons/CropOriginal';
import Wallpaper from '@material-ui/icons/Wallpaper';
import Category from '@material-ui/icons/Category';
import Directions from '@material-ui/icons/Directions';
import DirectionsOutlined from '@material-ui/icons/DirectionsOutlined';
import SlowMotionVideo from '@material-ui/icons/SlowMotionVideo';
import Star from '@material-ui/icons/Star';
import Dns from '@material-ui/icons/Dns';
import DnsOutlined from '@material-ui/icons/DnsOutlined';
import GroupWork from '@material-ui/icons/GroupWork';
import GroupWorkOutlined from '@material-ui/icons/GroupWorkOutlined';

class ResourceIcon extends React.Component {
  static propTypes = {
    resourceType: PropTypes.string,
    isOutlined: PropTypes.bool,
    isMuted: PropTypes.bool,
  };

  static defaultProps = {
    resourceType: null,
    isOutlined: false,
    isMuted: false,
  };

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    const {resourceType, isOutlined, isMuted} = this.props;
    return resourceType !== nextProps.resourceType
      || isOutlined !== nextProps.isOutlined
      || isMuted !== nextProps.isMuted;
  }

  render () {
    const { resourceType, isOutlined, isMuted } = this.props;
    let result = null;
    let color = 'inherit';
    if (isMuted) {
      color = 'disabled';
    }
    switch (resourceType) {
      case constants.GRAPH_MODEL_COMPONENT_TYPE:
        result = (<CropOriginal fontSize="inherit" style={{color: '#795548'}} />);
        break;
      case constants.GRAPH_MODEL_COMPONENT_INSTANCE_TYPE:
      case constants.PAGE_COMPONENT_TYPE:
      case constants.GRAPH_MODEL_FLOW_COMPONENT_INSTANCE_TYPE:
        result = (<Image fontSize="inherit" style={{color: '#2196F3'}} />);
        break;
      case constants.PAGE_PLACEHOLDER_TYPE:
        result = (<Wallpaper fontSize="inherit" color="disabled" />);
        break;
      case constants.GRAPH_MODEL_PAGE_TYPE:
      case constants.GRAPH_MODEL_FLOW_PAGE_TYPE:
        result = isOutlined
          ? (<DashboardOutlined fontSize="inherit" style={{color: '#3F51B5'}} />)
          : (<Dashboard fontSize="inherit" style={{color: '#3F51B5'}} />);
        break;
      case constants.GRAPH_MODEL_FUNCTIONS_TYPE:
        result = isOutlined
          ? (<DnsOutlined fontSize="inherit" style={{color: '#006064'}} />)
          : (<Dns fontSize="inherit" style={{color: '#006064'}} />);
        break;
      case constants.GRAPH_MODEL_USER_FUNCTION_TYPE:
      case constants.GRAPH_MODEL_FLOW_USER_FUNCTION_TYPE:
        result = (<Category fontSize="inherit" style={{color: '#009688'}} />);
        break;
      case constants.GRAPH_MODEL_FLOW_TYPE:
        result = isOutlined
          ? (<DirectionsOutlined fontSize="inherit" style={{color: '#FF9800'}} />)
          : (<Directions fontSize="inherit" style={{color: '#FF9800'}} />);
        break;
      case constants.GRAPH_MODEL_DIR_TYPE:
        result = isOutlined
          ? (<FolderOutlined fontSize="inherit" color={color} />)
          : (<Folder fontSize="inherit" color={color} />);
        break;
      case constants.GRAPH_MODEL_FILE_TYPE:
        result = isOutlined
          ? (<DescriptionOutlined fontSize="inherit" color={color} />)
          : (<Description fontSize="inherit" color={color} />);
        break;
      case constants.MARKET_PROJECT_TYPE:
        result = isOutlined
          ? (<GroupWorkOutlined fontSize="inherit" style={{color: '#3F51B5'}} />)
          : (<GroupWork fontSize="inherit" style={{color: '#3F51B5'}} />);
        break;
      case constants.RESOURCE_EDITOR_TAB_LIVE_PREVIEW_TYPE:
        result = (<SlowMotionVideo fontSize="inherit" style={{color: '#2e7d32'}} />);
        break;
      default:
        result = (<Star fontSize="inherit" color={color} />);
        break;
    }
    return result;
  }
}

export default ResourceIcon;
