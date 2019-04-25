import template from 'lodash/template';
import { repairPath } from '../../utils/fileUtils';
import { path } from '../../utils/electronUtils';
import { checkFileExists } from '../utils';
import { format } from '../../export/utils';

const templateContent = `
interface LocalState {
  <% if (valueType === 'object') { %> 
    value: any;
  <% } else { %> 
    value: string; 
  <% } %>
}

let localState: LocalState = {
  <% if (valueType === 'object') { %> 
    value: {}
  <% } else { %> 
    value: '' 
  <% } %>
};

<% if (functionsVariants['setValue'] === true) { %>
/*
  Sets value 
 */ 
  <% if (valueType === 'object') { %> 
    export const <%= fileName %>_setValue = (value: any) => (dispatch) => {
      localState.value =  {...value};
    };
  <% } else { %> 
    export const <%= fileName %>_setValue = (value: string) => (dispatch) => {
      localState.value = value;
    };
  <% } %>
<% } %>

<% if (functionsVariants['getValue'] === true) { %>
/*
  Gets value 
 */ 
export const <%= fileName %>_getValue = () => (dispatch: (string, any) => void) => {
  dispatch('value', localState.value);
};
<% } %>

<% if (functionsVariants['setAndGetValue'] === true) { %>
/*
  Sets and gets value 
 */ 
  <% if (valueType === 'object') { %> 
    export const <%= fileName %>setAndGetValue = (value: any) => (dispatch: (string, any) => void) => {
      localState.value =  {...value};
      dispatch('value', localState.value);
    };
  <% } else { %> 
    export const <%= fileName %>setAndGetValue = (value: string) => (dispatch: (string, any) => void) => {
      localState.value = value;
      dispatch('value', localState.value);
    };
  <% } %>
<% } %>
`;

export async function createFiles (
  functionsVariants, valueType, fileName, dirName, destDirPath, fileExtension
) {
  const fileObjects = [];
  let fileExists;
  const componentFilePath = repairPath(path().join(destDirPath, dirName, `${fileName}${fileExtension}`));
  fileExists = await checkFileExists(componentFilePath);
  if (fileExists) {
    throw Error(`The file with the "${fileName}${fileExtension}" name already exists.`);
  }
  fileObjects.push({
    filePath: componentFilePath,
    fileData: format(template(templateContent)({
      functionsVariants,
      valueType,
      fileName
    }))
  });
  return fileObjects;
}

