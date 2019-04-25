import template from 'lodash/template';
import { repairPath } from '../../utils/fileUtils';
import { path } from '../../utils/electronUtils';
import * as constants from '../../../commons/constants';
import { format, getFunctionImportPathByName } from '../utils';

let dirPath;

const emptyFileContent = `
import React from 'react';
class StartWrapper extends React.Component {
  render () {
    return this.props.children;
  }
}
export default StartWrapper;
`;

const fileContent = `
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
<% if (hasForwardActions) { %>
import queryString from 'query-string';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import isUndefined from 'lodash/isUndefined';
<% } %>
<% importList.forEach(function(importItem) { %>
import <%= importItem.importName %> from '<%= importItem.importPath %>';
<% }) %>

const actions = {
  <% actionsList.forEach(function(actionItem) { %>
    <%= actionItem.actionName %>: function() {
      const arg = arguments[0];
      return function (dispatch, getState, helpers) {
        <% actionItem.bodyItems.forEach(function(bodyItem) { %>
          <%= bodyItem %>\n
        <% }) %>
      }
    }
  <% }) %>
};

class StartWrapper extends React.Component {

  componentDidMount () {
    <% actionsList.forEach(function(actionItem) { %>
    this.props.actions.<%= actionItem.actionName %>();
    <% }) %>
  }

  render () {
    return this.props.children;
  }
}

const mapDispatchToProps = (dispatch) => {
  return { actions: bindActionCreators(actions, dispatch) };
};

export default connect(null, mapDispatchToProps)(StartWrapper);
`;

const functionContent = `
  <% if (bodyParams.functionName) { %>
  try {
    const <%= bodyParams.functionResultName %> = <%= bodyParams.functionName %>(<%= bodyParams.functionPayloadName %>)((type, <%= bodyParams.functionName %>_payload) => {
      <% bodyParams.functionEvents.forEach(function(event) { %>
        <% if (event.eventType !== 'caughtException') { %>
          if (type === '<%= event.eventType %>') {
            <% event.eventTargets.forEach(function(eventTarget) { %>
              <%= event.callback(eventTarget, bodyParams.functionName + '_payload') %>
            <% }) %>  
          }
        <% } %>
      <% }) %>   
    });
    if (<%= bodyParams.functionResultName %> && <%= bodyParams.functionResultName %>.then) {
      <%= bodyParams.functionResultName %>.catch(error => {
      
        <% bodyParams.functionEvents.forEach(function(event) { %>
          <% if (event.eventType === 'caughtException') { %>
            <% event.eventTargets.forEach(function(eventTarget) { %>
              <%= event.callback(eventTarget, 'error') %>
            <% }) %>  
          <% } %>
        <% }) %>   
      
        console.error(error.message);
      });
    }
  } catch(error) {

    <% bodyParams.functionEvents.forEach(function(event) { %>
      <% if (event.eventType === 'caughtException') { %>
        <% event.eventTargets.forEach(function(eventTarget) { %>
          <%= event.callback(eventTarget, 'error') %>
        <% }) %>  
      <% } %>
    <% }) %>   

    console.error(error.message);
  }
  <% } else if (bodyParams.containerKey) { %>
    <% if (bodyParams.forwardPath) { %>
      let pathString = '<%= bodyParams.forwardPath %>';
      if (!isUndefined(<%= bodyParams.functionPayloadName %>)) {
        if (isNumber(<%= bodyParams.functionPayloadName %>) || isString(<%= bodyParams.functionPayloadName %>)) {
          pathString = pathString + '/' + <%= bodyParams.functionPayloadName %>;
        } else if (isObject(<%= bodyParams.functionPayloadName %>) || isArray(<%= bodyParams.functionPayloadName %>)) {
          pathString = pathString + '?' + queryString.stringify(<%= bodyParams.functionPayloadName %>);
        }
      }
      helpers.history.push(pathString);
    <% } else { %>
      dispatch({ 
        type: '<%= bodyParams.containerKey %>', 
        payload: { 
          '<%= bodyParams.propertyName %>': <%= bodyParams.functionPayloadName %> 
        } 
      });
    <% } %>
  <% } %>
`;

function getActionBody (target, functionImportList, publicUrl, payloadName = 'arg') {
  const bodyParams = {};
  if (target) {
    const { type, props, events } = target;
    if (type === constants.FRAMEWORK_ACTION_SEQUENCE_USER_FUNCTION_TYPE) {
      const { appFunctionImportPath } = getFunctionImportPathByName(props.functionName);
      let foundFunction = functionImportList.find(i => i.importPath === appFunctionImportPath);
      if (foundFunction) {
        bodyParams.functionName = foundFunction.importName;
        bodyParams.functionResultName = `${foundFunction.importName}_result`;
        bodyParams.functionPayloadName = payloadName;
        bodyParams.functionEvents = [];
        if (events && events.length > 0) {
          events.forEach(event => {
            bodyParams.functionEvents.push({
              eventType: event.name,
              eventTargets: event.targets || [],
              callback: (target, payloadName) => {
                return getActionBody(target, functionImportList, publicUrl, payloadName);
              }
            });
          });
        }
      }
    } else if (type === constants.FRAMEWORK_ACTION_SEQUENCE_COMPONENT_TYPE) {
      const {componentName, componentInstance, propertyName, forwardPath} = props;
      if (componentName && componentInstance) {
        // here we have a page component
        bodyParams.containerKey = `${componentName}_${componentInstance}`;
        bodyParams.propertyName = propertyName;
      } else if (forwardPath) {
        bodyParams.containerKey = `applicationPage_${forwardPath}`;
        // here is just a page where we have to forward to
        if (publicUrl) {
          bodyParams.forwardPath = `${publicUrl}/${forwardPath}`;
        } else {
          bodyParams.forwardPath = `${forwardPath}`;
        }
      }
      bodyParams.functionPayloadName = payloadName;
    }
  }
  return template(functionContent)({ bodyParams });
}

function testActionHasForward (target) {
  let result = false;
  if (target) {
    const { type, props, events } = target;
    if (type === constants.FRAMEWORK_ACTION_SEQUENCE_USER_FUNCTION_TYPE) {
      if (events && events.length > 0) {
        events.forEach(event => {
          if (event.targets && event.targets.length > 0) {
            event.targets.forEach(eventTarget => {
              if (testActionHasForward(eventTarget)) {
                result = true;
              }
            });
          }
        });
      }
    } else if (type === constants.FRAMEWORK_ACTION_SEQUENCE_COMPONENT_TYPE) {
      if (props.forwardPath) {
        result = true;
      }
    }
  }
  return result;
}

function generateStartWrapper (componentInstances, publicUrl) {
  const fileObject = {};
  try {
    let fileData = '';
    const filePath = repairPath(path().join(dirPath, 'StartWrapper.js'));
    const applicationStartWrapper = componentInstances['applicationStartWrapper_wrapperInstance'];
    if (applicationStartWrapper) {
      const importList = applicationStartWrapper.functionsList;
      const actionsList = [];
      let hasForwardActions = false;
      if (applicationStartWrapper.events && applicationStartWrapper.events.length > 0) {
        applicationStartWrapper.events.forEach(event => {
          const actionItem = {
            actionName: event.name,
            bodyItems: [],
          };
          if (event.targets && event.targets.length > 0) {
            event.targets.forEach(eventTarget => {
              actionItem.bodyItems.push(getActionBody(eventTarget, importList, publicUrl));
              if (testActionHasForward(eventTarget)) {
                hasForwardActions = true;
              }
            });
          }
          actionsList.push(actionItem);
        });
      }
      fileData = template(fileContent)({ importList, actionsList, hasForwardActions });
    } else {
      fileData = emptyFileContent;
    }
    fileObject.filePath = filePath;
    fileObject.fileData = format(fileData);
  } catch (e) {
    console.error(`Can not create app/startWrapper/StartWrapper.js file: ${e.message}`);
  }
  return fileObject;
}

export function generate (destDirPath, resources) {
  const fileList = [];
  const { componentInstances, publicUrl } = resources;
  dirPath = repairPath(path().join(
    destDirPath,
    constants.DIR_NAME_SRC,
    constants.DIR_NAME_APP,
    constants.EXPORT_DIR_NAME_START_WRAPPER
  ));
  fileList.push(generateStartWrapper(componentInstances, publicUrl));
  return fileList;
}
