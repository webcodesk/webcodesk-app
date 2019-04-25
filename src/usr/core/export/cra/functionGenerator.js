import forOwn from 'lodash/forOwn';
import template from 'lodash/template';
import { repairPath } from '../../utils/fileUtils';
import { path } from '../../utils/electronUtils';
import * as constants from '../../../commons/constants';
import { format, getFunctionImportPathByName, getFunctionsList } from '../utils';

let dirPath;

const functionContent = `
import { <%= functionParams.importName %> } from '<%= functionParams.functionImportPath %>';

export default <%= functionParams.importName %>;
`;

function generateFunction(functionPath) {
  const filePath = repairPath(path().join(dirPath, `${functionPath.appFunctionImportPath}.js`));
  const fileData = template(functionContent)(
    { functionParams: functionPath }
  );
  return {
    filePath,
    fileData: format(fileData),
  }
}

export function generate(destDirPath, resources) {
  const fileList = [];
  const { componentInstances } = resources;
  dirPath = repairPath(path().join(
    destDirPath,
    constants.DIR_NAME_SRC,
  ));
  let functionList = [];
  forOwn(componentInstances, (value, prop) => {
    functionList = getFunctionsList(value, functionList);
  });
  if (functionList.length > 0) {
    let functionPaths;
    functionList.forEach(functionName => {
      functionPaths = getFunctionImportPathByName(functionName);
      fileList.push(generateFunction(functionPaths));
    });
  }
  return fileList;
}
