import React from 'react';
import PropTypes from 'prop-types';
import constants from '../../commons/constants';

const containerStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  overflowX: 'auto',
  backgroundColor: '#f5f5f5',
};

const defaultInnerContainerStyle = {
  position: 'absolute',
  top: '1em',
  left: '1em',
  bottom: '1em',
  right: '1em',
};

const webViewStyle = {
  position: 'relative',
  height: '100%',
  width: '100%',
  backgroundColor: '#ffffff'
};

class IFrame extends React.Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    onIFrameMessage: PropTypes.func,
    width: PropTypes.string,
    top: PropTypes.string,
    left: PropTypes.string,
    padding: PropTypes.string,
    onIFrameReady: PropTypes.func,
    onDevToolClosedManually: PropTypes.func,
  };

  static defaultProps = {
    width: constants.MEDIA_QUERY_WIDTH_AUTO_NAME,
    onIFrameMessage: (message) => {
      console.info('IFrame received the message: ', message);
    },
    onIFrameReady: () => {
      console.info('IFrame.onIFrameReady is not set');
    },
    onDevToolClosedManually: () => {
      console.info('IFrame.onDevToolClosedManually is not set');
    },
  };

  constructor (props) {
    super(props);
    this.frameWindow = React.createRef();
    this.sendMessage = this.sendMessage.bind(this);
  }

  componentDidMount () {
    if (this.frameWindow.current) {
      this.frameWindow.current.addEventListener('did-stop-loading', this.handleDidFinishLoad);
      this.frameWindow.current.addEventListener('did-fail-load', this.handleDidFailLoad);
      this.frameWindow.current.addEventListener('devtools-closed', this.handleDevtoolClosed);
      this.frameWindow.current.addEventListener('ipc-message', this.handleIFrameMessage);
    }
  }

  componentWillUnmount () {
    if (this.frameWindow.current) {
      this.frameWindow.current.removeEventListener('ipc-message', this.handleIFrameMessage);
      this.frameWindow.current.removeEventListener('devtools-closed', this.handleDevtoolClosed);
      this.frameWindow.current.removeEventListener('did-fail-load', this.handleDidFailLoad);
      this.frameWindow.current.removeEventListener('did-stop-loading', this.handleDidFinishLoad);
    }
  }

  shouldComponentUpdate (nextProps, nextState, nextContent) {
    const { url, width } = this.props;
    const { url: nextUrl, width: nextWidth } = nextProps;
    return url !== nextUrl || width !== nextWidth;
  }

  handleDidFinishLoad = () => {
    if (this.frameWindow.current) {
      const url = this.frameWindow.current.getURL();
      this.props.onIFrameReady(url);
    }
  };

  handleDidFailLoad = () => {
    // do nothing?
  };

  handleDevtoolClosed = () => {
    this.props.onDevToolClosedManually();
  };

  sendMessage (message) {
    if (this.frameWindow.current) {
      this.frameWindow.current.send('message', message);
    }
  }

  handleIFrameMessage = (e) => {
    const { args } = e;
    if (args[0]) {
      const { onIFrameMessage } = this.props;
      onIFrameMessage(args[0]);
    }
  };

  openDevTools = () => {
    if (this.frameWindow.current) {
      this.frameWindow.current.openDevTools();
    }
  };

  closeDevTools = () => {
    if (this.frameWindow.current) {
      this.frameWindow.current.closeDevTools();
    }
  };

  reloadPage = () => {
    if (this.frameWindow.current) {
      this.frameWindow.current.reload();
    }
  };

  goForward = () => {
    if (this.frameWindow.current) {
      this.frameWindow.current.goForward();
    }
  };

  goBack = () => {
    if (this.frameWindow.current) {
      this.frameWindow.current.goBack();
    }
  };

  loadURL = (url) => {
    if (this.frameWindow.current) {
      this.frameWindow.current.loadURL(url);
    }
  };

  capturePage = (callback) => {
    if (this.frameWindow.current) {
      const rect = this.frameWindow.current.getBoundingClientRect();
      this.frameWindow.current.getWebContents().capturePage(
        {x: 0, y: 0, width: rect.width, height: rect.height},
        (image) => {
          callback(image);
        }
      );
    }
  };

  render () {
    const { url, width } = this.props;
    let innerContainerStyle;
    if (width === constants.MEDIA_QUERY_WIDTH_AUTO_NAME) {
      innerContainerStyle = defaultInnerContainerStyle;
    } else {
      innerContainerStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: constants.LIVE_PREVIEWS[width].width,
        padding: '1em',
        backgroundColor: containerStyle.backgroundColor,
      };
    }
    return (
      <div style={containerStyle}>
        <div style={innerContainerStyle}>
          <webview
            nodeintegration="true"
            disablewebsecurity="true"
            autosize="true"
            ref={this.frameWindow}
            style={webViewStyle}
            src={url}
          >
          </webview>
        </div>
      </div>
    );
  }
}

export default IFrame;
