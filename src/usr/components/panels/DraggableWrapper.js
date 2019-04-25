import React from 'react';
import PropTypes from 'prop-types';

class DraggableWrapper extends React.Component {
  static propTypes = {
    resourceKey: PropTypes.string,
    onDragStart: PropTypes.func,
    onDragEnd: PropTypes.func,
  };

  static defaultProps = {
    resourceKey: null,
    onDragStart: () => {
      console.info('DraggableWrapperForPage.onDragStart is not set');
    },
    onDragEnd: () => {
      console.info('DraggableWrapperForPage.onDragEnd is not set');
    },
  };

  handleDragStart = (e) => {
    const { resourceKey, onDragStart } = this.props;
    // console.info('Start dragging...');
    // e.target.style.backgroundColor = 'red';
    // var img = this.rootRef.cloneNode(true);
    // var img = document.createElement("img");
    // img.src = "http://kryogenix.org/images/hackergotchi-simpler.png";
    // e.dataTransfer.setDragImage(img, 0, 0);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.dropEffect = 'copy';
    // e.dataTransfer.setData("text/plain", "<strong>Body</strong>");

    onDragStart(resourceKey);
  };

  handleDragEnd = (e) => {
    const { resourceKey, onDragEnd} = this.props;
    // console.info('End dragging...');
    onDragEnd(resourceKey);
  };

  render () {
    return (
      <div
        draggable="true"
        onDragStart={this.handleDragStart}
        onDragEnd={this.handleDragEnd}
      >
        {this.props.children}
      </div>
    );
  }
}

export default DraggableWrapper;
