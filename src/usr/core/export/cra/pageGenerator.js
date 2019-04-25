import template from 'lodash/template';
import { repairPath } from '../../utils/fileUtils';
import { path } from '../../utils/electronUtils';
import * as constants from '../../../commons/constants';
import { format } from '../utils';

let dirPath;

const pageComponentContent = `
import React from 'react';
<% if (hasPopulatedProps) { %>
import queryString from 'query-string';
import isUndefined from 'lodash/isUndefined';
<% } %>
<% importList.forEach(function(importItem) { %>
import <%= importItem.importName %> from '<%= importItem.importPath %>';
<% }) %>

class Page extends React.Component {

  <% if (hasPopulatedProps) { %>
  getPropertyValueFromParameters = () => {
    const {location, match} = this.props;
    const parameterValue = match.params ? match.params['parameter'] : undefined;
    if (!isUndefined(parameterValue)){
      return parameterValue;
    }
    if (location && location.search) {
      return queryString.parse(location.search);
    }
    return null;
  };
  <% } %>
  
  render () {
    return (
      <%= renderBody %>
    )
  }
}

export default Page;
`;

const renderBodyContent = `
<<%= bodyParams.name %>
  <% bodyParams.props.forEach(function(propItem) { %>
    <% if (propItem.isElementProperty) { %>
      <%= propItem.propName %>={<%= propItem.callback(propItem.treeNode) %>}
    <% } else if (propItem.isPopulatedProperty) { %>
      <%= propItem.propName %>={this.getPropertyValueFromParameters()}
    <% } %>
  <% }) %>
/>
`;

function getRenderBody(componentsTreeNode, importList, componentInstances) {
  const bodyParams = {name: '', props: []};
  if (componentsTreeNode) {
    const {type, props, children} = componentsTreeNode;
    if (type === constants.PAGE_COMPONENT_TYPE) {
      const {componentName, componentInstance} = props;
      const foundComponent = componentInstances[`${componentName}_${componentInstance}`];
      if (foundComponent) {
        const foundImportItem = importList.find(i => i.importPath === foundComponent.containerImportPath);
        if (foundImportItem) {
          bodyParams.name = foundImportItem.importName;
          bodyParams.props = [];
          if (foundComponent.propsList && foundComponent.propsList.length > 0) {
            foundComponent.propsList.forEach(componentProperty => {
              if (componentProperty && componentProperty.value.populatePath) {
                bodyParams.props.push({
                  isPopulatedProperty: true,
                  propName: componentProperty.name,
                });
              }
            });
          }
          if (children && children.length > 0) {
            children.forEach(child => {
              if (child) {
                const {props} = child;
                if (props.elementProperty) {
                  bodyParams.props.push({
                    isElementProperty: true,
                    propName: props.elementProperty,
                    treeNode: child,
                    callback: (treeNode) => {
                      return getRenderBody(treeNode, importList, componentInstances);
                    }
                  });
                }
              }
            });
          }
        }
      }
    }
  }
  if(bodyParams.name) {
    return template(renderBodyContent)({bodyParams});
  } else {
    return '<span/>';
  }
}

function generatePageComponent(pageItem, componentInstances) {
  const fileObject = {};

  try {
    const filePath = repairPath(path().join(dirPath, `${pageItem.importPath}.js`));
    const importList = [];
    let hasPopulatedProps = false;
    if (pageItem && pageItem.componentInstances && pageItem.componentInstances.length > 0) {
      let foundComponent;
      pageItem.componentInstances.forEach((componentInstanceItem, index) => {
        foundComponent = componentInstances[componentInstanceItem.componentKey];
        if (foundComponent) {
          importList.push({
            importName: `C${index + 1}`,
            importPath: foundComponent.containerImportPath
          });
          if (foundComponent.propsList && foundComponent.propsList.length > 0) {
            foundComponent.propsList.forEach(componentProperty => {
              if (componentProperty && componentProperty.value.populatePath) {
                hasPopulatedProps = true;
              }
            });
          }
        }
      });
    }
    const renderBody = getRenderBody(pageItem.componentsTree, importList, componentInstances);
    const fileData = template(pageComponentContent)(
      {importList, renderBody, hasPopulatedProps}
    );
    fileObject.filePath = filePath;
    fileObject.fileData = format(fileData);
  } catch (error) {
    console.error(`Can not create page file: ${error.message}`);
  }
  return fileObject;
}

export function generate(destDirPath, resources) {
  const fileList = [];
  const { pages, componentInstances } = resources;
  dirPath = repairPath(path().join(
    destDirPath,
    constants.DIR_NAME_SRC,
  ));
  if (pages && pages.pageList && pages.pageList.length > 0) {
    pages.pageList.forEach(pageItem => {
      fileList.push(generatePageComponent(pageItem, componentInstances));
    });
  }
  return fileList;
}
