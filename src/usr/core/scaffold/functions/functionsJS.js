import template from 'lodash/template';
import { repairPath } from '../../utils/fileUtils';
import { path } from '../../utils/electronUtils';
import { checkFileExists } from '../utils';
import { format } from '../../export/utils';

const templateContent = `
let localState = {
  value: <% if (valueType === 'object') { %> {} <% } else { %> '' <% } %>
};

<% if (functionsVariants['setValue'] === true) { %>
/*
  Sets value 
  
  Parameters:
 * **value** - value passed in to local state

 */ 
export const <%= fileName %>_setValue = (value) => (dispatch) => {
  localState.value =  <% if (valueType === 'object') { %> {...value} <% } else { %> value <% } %>;
};
<% } %>

<% if (functionsVariants['getValue'] === true) { %>
/*
  Gets value 

  Dispatching:
 * **value** - a value from the local state

 */ 
export const <%= fileName %>_getValue = (value) => (dispatch) => {
  dispatch('value', localState.value);
};
<% } %>

<% if (functionsVariants['setAndGetValue'] === true) { %>
/*
  Sets and gets value 

  Parameters:
 * **value** - value passed in to local state

  Dispatching:
 * **value** - a value from the local state

 */ 
export const <%= fileName %>_setAndGetValue = (value) => (dispatch) => {
  localState.value =  <% if (valueType === 'object') { %> {...value} <% } else { %> value <% } %>;
  dispatch('value', localState.value);
};
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

