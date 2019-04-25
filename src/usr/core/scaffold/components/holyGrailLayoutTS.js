import template from 'lodash/template';
import { repairPath } from '../../utils/fileUtils';
import { path } from '../../utils/electronUtils';
import { format } from '../../export/utils';
import { checkFileExists } from '../utils';

const templateContent = `
import React from 'react';
import PropTypes from 'prop-types';
import s from './<%= componentName %>.module.css';

const placeholderStyle = {
  padding: '1em',
  border: '1px dashed #cccccc',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const Placeholder = ({title}) => {
  return (
    <div style={placeholderStyle}>
      <code>
        {title}
      </code>
    </div>
  );
}

const <%= componentName %> = (props: <%= componentName %>Props) => {
  const {header, sidebarLeft, sidebarRight, content, footer} = props;
  return (
    <div className={s.wrapper}>
      <div className={s.header}>{header}</div>
      <div className={s.sidebar}>{sidebarLeft}</div>
      <div className={s.sidebar2}>{sidebarRight}</div>
      <div className={s.content}>{content}</div>
      <div className={s.footer}>{footer}</div>
    </div>
  );
}

<%= componentName %>.propTypes = {
  header: PropTypes.element,
  sidebarLeft: PropTypes.element,
  sidebarRight: PropTypes.element,
  content: PropTypes.element,
  footer: PropTypes.element,
};

<%= componentName %>.defaultProps = {
  header: <Placeholder title="header" />,
  sidebarLeft: <Placeholder title="sidebarLeft" />,
  sidebarRight: <Placeholder title="sidebarRight" />,
  content: <Placeholder title="content" />,
  footer: <Placeholder title="footer" />,
};

export default <%= componentName %>;
`;

const templateContentCSS = `
.sidebar {
    grid-area: sidebar;
}

.sidebar2 {
    grid-area: sidebar2;
}

.content {
    grid-area: content;
}

.header {
    grid-area: header;
}

.footer {
    grid-area: footer;
}

.wrapper {
    display: grid;
    grid-gap: 1em;
    grid-template-areas:
            "header"
            "sidebar"
            "content"
            "sidebar2"
            "footer"
}

@media only screen and (min-width: 500px)  {
    .wrapper {
        grid-template-columns: 20% auto;
        grid-template-areas:
                "header   header"
                "sidebar  content"
                "sidebar2 sidebar2"
                "footer   footer";
    }
}

@media only screen and (min-width: 600px)   {
    .wrapper {
        grid-gap: 20px;
        grid-template-columns: minmax(120px, 300px) auto minmax(120px, 300px);
        grid-template-areas:
                "header  header  header"
                "sidebar content sidebar2"
                "footer  footer  footer";
    }
}

`;

const templateContentD_TS = `
interface <%= componentName %>Props {
  header: JSX.Element;
  sidebarLeft: JSX.Element;
  sidebarRight: JSX.Element;
  content: JSX.Element;
  footer: JSX.Element;
}
`;

export async function createFiles(componentName, dirName, destDirPath, fileExtension) {
  const fileObjects = [];
  let fileExists;
  const componentFilePath = repairPath(path().join(destDirPath, dirName, `${componentName}${fileExtension}`));
  fileExists = await checkFileExists(componentFilePath);
  if (fileExists) {
    throw Error(`The file with the "${componentName}${fileExtension}" name already exists.`);
  }
  const cssFilePath = repairPath(path().join(destDirPath, dirName, `${componentName}.module.css`));
  fileExists = await checkFileExists(cssFilePath);
  if (fileExists) {
    throw Error(`The file with the "${componentName}.module.css" name already exists.`);
  }
  const typesFilePath = repairPath(path().join(destDirPath, dirName, `i${componentName}.d.ts`));
  fileExists = await checkFileExists(typesFilePath);
  if (fileExists) {
    throw Error(`The file with the "i${componentName}.d.ts" name already exists.`);
  }
  fileObjects.push({
    filePath: componentFilePath,
    fileData: format(template(templateContent)({
      componentName
    }))
  });
  fileObjects.push({
    filePath: cssFilePath,
    fileData: template(templateContentCSS)({
      componentName
    })
  });
  fileObjects.push({
    filePath: typesFilePath,
    fileData: template(templateContentD_TS)({
      componentName
    })
  });
  return fileObjects;
}