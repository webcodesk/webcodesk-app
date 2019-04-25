import template from 'lodash/template';
import { repairPath } from '../../utils/fileUtils';
import { path } from '../../utils/electronUtils';
import { checkFileExists } from '../utils';
import { format } from '../../export/utils';

const templateContent = `
import React from 'react';
import PropTypes from 'prop-types';

const rootStyle = {
    padding: '2em',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
};

/*
  <%= componentName %> component generated by Webcodesk 
 */
class <%= componentName %> extends React.Component {
  constructor (props) {
    super(props);
  }
  
  handleClick = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const { onClick, data } = this.props;
    onClick(data);
  };

  render () {
    const { data } = this.props;
    return (
      <div style={rootStyle}>
        <button onClick={this.handleClick}>Click</button>
      </div>
    );
  }
}

<%= componentName %>.propTypes = {
  // any arbitrary data
  data: PropTypes.object,
  // send the data by click
  onClick: PropTypes.func,
};

<%= componentName %>.defaultProps = {
  data: {},
  onClick: () => {
    // is not set
  },
};

export default <%= componentName %>;
`;

export async function createFiles (componentName, dirName, destDirPath, fileExtension) {
  const fileObjects = [];
  let fileExists;
  const componentFilePath = repairPath(path().join(destDirPath, dirName, `${componentName}${fileExtension}`));
  fileExists = await checkFileExists(componentFilePath);
  if (fileExists) {
    throw Error(`The file with the "${componentName}${fileExtension}" name already exists.`);
  }
  fileObjects.push({
    filePath: componentFilePath,
    fileData: format(template(templateContent)({
      componentName
    }))
  });
  return fileObjects;
}