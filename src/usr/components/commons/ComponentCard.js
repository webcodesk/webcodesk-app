import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import CloudDownload from '@material-ui/icons/CloudDownload';
import CropOriginal from '@material-ui/icons/CropOriginal';
import Public from '@material-ui/icons/Public';
import DesktopMac from '@material-ui/icons/DesktopMac';
import OpenInNew from '@material-ui/icons/OpenInNew';
import StarRate from '@material-ui/icons/StarRate';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import CardContent from '@material-ui/core/CardContent';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import {
  CommonCard,
  CommonCardContent,
  CommonCardActionArea,
  CommonCardHeader,
  CommonCardAvatar,
} from './Card.parts';
import { PreTypography } from './Market.parts';
import {cutText} from "./utils";

const styles = theme => ({
  cardHeader: {
    borderTop: '4px solid #2196F3'
  },
  cardAvatar: {
    backgroundColor: '#2196F3',
  },
  imageBox: {
    height: '187px',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
  },
  downloadCount: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    flexWrap: 'nowrap',
    minWidth: '100px',
  },
  license: {
    display: 'flex',
    alignItems: 'center'
  },
  licenseLabel: {
    flexGrow: 1,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    color: '#9e9e9e'
  },
  licenseIcon: {
    color: '#9e9e9e'
  },
  bottomNavigation: {
    backgroundColor: '#eeeeee'
  },
  bottomNavigationButton: {
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    }
  },
  bottomNavigationIcon: {
    '&:hover': {
      color: theme.palette.primary.main
    }
  }
});

class ComponentCard extends React.Component {
  static propTypes = {
    headerTitle: PropTypes.string,
    subheaderTitle: PropTypes.string,
    imageSrc: PropTypes.string,
    content: PropTypes.string,
    downloadCount: PropTypes.number,
    license: PropTypes.string,
    repoUrl: PropTypes.string,
    demoUrl: PropTypes.string,
    hasActions: PropTypes.bool,
    onClick: PropTypes.func,
    onInstall: PropTypes.func,
    onOpenSourceCode: PropTypes.func,
    onOpenLiveDemo: PropTypes.func,
  };

  static defaultProps = {
    headerTitle: 'Header title',
    subheaderTitle: 'Subheader title',
    imageSrc: '',
    content: null,
    downloadCount: 0,
    hasActions: false,
    onClick: () => {
      console.info('ComponentCard.onClick is not set');
    },
    onInstall: () => {
      console.info('ComponentCard.onInstall is not set');
    },
    onOpenSourceCode: () => {
      console.info('ComponentCard.onOpenSourceCode is not set');
    },
    onOpenLiveDemo: () => {
      console.info('ComponentCard.onOpenLiveDemo is not set');
    },
  };

  handleClick = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onClick();
  };

  handleInstall = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onInstall();
  };

  handleOpenSourceCode = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onOpenSourceCode();
  };

  handleOpenLiveDemo = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onOpenLiveDemo();
  };

  render() {
    const {
      classes,
      headerTitle,
      subheaderTitle,
      imageSrc,
      content,
      downloadCount,
      license,
      repoUrl,
      demoUrl,
      hasActions
    } = this.props;
    let descriptionText = content
      ? content.trim()
      : 'No description';
    if (descriptionText.length > 250) {
      descriptionText = descriptionText.substring(0, 250) + '...';
    }
    const headerTitleText = cutText(headerTitle, 100);
    const subheaderTitleText = cutText(subheaderTitle, 100);
    return (
      <CommonCard>
        <CommonCardActionArea
          component="div"
          title="Read more about component"
          onClick={this.handleClick}
          className={classes.cardHeader}
        >
          <CommonCardHeader
            avatar={
              <CommonCardAvatar className={classes.cardAvatar}>
                <CropOriginal fontSize="inherit"/>
              </CommonCardAvatar>
            }
            title={headerTitleText}
            subheader={subheaderTitleText}
          />
          <Divider/>
          <div className={classes.imageBox}>
            <img alt="Screenshot" src={imageSrc} className={classes.image}/>
          </div>
          <Divider/>
          <CommonCardContent>
            <PreTypography variant="body2" gutterBottom={true}>
              {descriptionText}
            </PreTypography>
          </CommonCardContent>
          <CardContent>
            <Typography variant="caption">
            <div className={classes.license}>
              <Public className={classes.licenseIcon} fontSize="inherit"/>
              <div className={classes.licenseLabel}>
                  &nbsp;License: &nbsp;{license || 'NONE'}
              </div>
              {downloadCount > 1 && (
                <div className={classes.downloadCount}>
                  <StarRate className={classes.licenseIcon} fontSize="inherit" />
                  <div className={classes.licenseIcon}>&nbsp;{downloadCount}</div>
                </div>
              )}
            </div>
            </Typography>
          </CardContent>
        </CommonCardActionArea>
        {hasActions && (
          <Divider/>
        )}
        {hasActions && (
          <BottomNavigation
            showLabels
            className={classes.bottomNavigation}
          >
            <BottomNavigationAction
              label="Install"
              className={classes.bottomNavigationButton}
              icon={<CloudDownload className={classes.bottomNavigationIcon} />}
              onClick={this.handleInstall}
            />
            {repoUrl && (
              <BottomNavigationAction
                label="Source"
                className={classes.bottomNavigationButton}
                icon={<OpenInNew className={classes.bottomNavigationIcon} />}
                onClick={this.handleOpenSourceCode}
              />
            )}
            {demoUrl && (
              <BottomNavigationAction
                label="Live Demo"
                className={classes.bottomNavigationButton}
                icon={<DesktopMac className={classes.bottomNavigationIcon} />}
                onClick={this.handleOpenLiveDemo}
              />
            )}
          </BottomNavigation>
        )}
      </CommonCard>
    );
  }
}

export default withStyles(styles)(ComponentCard);
