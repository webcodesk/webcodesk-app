import {readFileSync, repairPath} from "../utils/fileUtils";
import * as constants from "../../commons/constants";
import * as electronUtils from "../utils/electronUtils";

export function getModuleName(dependencyName) {
  if (dependencyName && dependencyName.length > 0) {
    let parts;
    let firsChar = '';
    if (dependencyName[0].indexOf('@') === 0) {
      // we have scoped module
      parts = dependencyName.substr(1).split('@');
      firsChar = '@';
    } else {
      parts = dependencyName.split('@');
    }
    if (parts && parts.length > 1) {
      return `${firsChar}${parts[0]}`;
    }
  }
  return dependencyName;
}

export function getImportModuleName (importPath) {
  importPath = repairPath(importPath);
  const importParts = importPath.split(constants.FILE_SEPARATOR);
  if (importParts[0].indexOf('@') === 0) {
    // we have scoped module
    return `${importParts[0]}${constants.FILE_SEPARATOR}${importParts[1]}`;
  } else {
    return `${importParts[0]}`;
  }
}

export function getModuleVersion (projectDirPath, importPath) {
  try {
    const modulePackageFilePath = repairPath(electronUtils.path().join(
      projectDirPath,
      constants.NODE_MODULES_DIR_NAME,
      importPath,
      'package.json'
    ));
    const fileData = readFileSync(modulePackageFilePath);
    if (fileData) {
      const jsonData = JSON.parse(fileData);
      return jsonData.version;
    }
  } catch (e) {
    console.error(e.message);
    return null;
  }
}