import { readDir } from 'usr/core/utils/dirUtils';
import { repairPath, readFile } from 'usr/core/utils/fileUtils';
import { findFunctionDeclarations } from './functionsParser';
import { findComponentDeclarations } from './componentsParser';
import { findComponentStoryDeclarations } from './componentStoriesParser';
import { findPageDeclarations } from './pagesParser';
import { findFlowDeclarations } from './flowsParser';
import { path } from '../utils/electronUtils';
import * as config from '../config/config';
import constants  from '../../commons/constants';
import { isFile } from '../utils/fileUtils';
import DeclarationsInFile from './DeclarationsInFile';

const validFileExtensions = {
  '.js': true, '.jsx': true, '.ts': true, '.tsx': true, '.json': true
};

const componentStoriesFileSuffix = '.stories';


export const createEmptyResource = (filePath) => {
  return [
    new DeclarationsInFile(
      constants.RESOURCE_IN_COMPONENT_STORIES_TYPE,
      [],
      filePath
    ),
    new DeclarationsInFile(
      constants.RESOURCE_IN_USER_FUNCTIONS_TYPE,
      [],
      filePath
    ),
    new DeclarationsInFile(
      constants.RESOURCE_IN_COMPONENTS_TYPE,
      [],
      filePath
    ),
    new DeclarationsInFile(
      constants.RESOURCE_IN_PAGES_TYPE,
      [],
      filePath
    ),
    new DeclarationsInFile(
      constants.RESOURCE_IN_FLOWS_TYPE,
      [],
      filePath
    ),
  ];
};

/**
 *
 * @param filePath
 * @param fileData
 * @returns {*}
 */
const parseFileData = (filePath, fileData) => {
  const result = [];
  const extName = path().extname(filePath);
  if (validFileExtensions[extName]) {
    if (filePath.indexOf(config.usrSourceDir) === 0) {
      const baseName = path().basename(filePath, extName);
      if (baseName.endsWith(componentStoriesFileSuffix)) {
        result.push(new DeclarationsInFile(
          constants.RESOURCE_IN_COMPONENT_STORIES_TYPE,
          findComponentStoryDeclarations(fileData),
          filePath
        ));
      } else {
        result.push(new DeclarationsInFile(
          constants.RESOURCE_IN_USER_FUNCTIONS_TYPE,
          findFunctionDeclarations(fileData),
          filePath
        ));
        result.push(new DeclarationsInFile(
          constants.RESOURCE_IN_COMPONENTS_TYPE,
          findComponentDeclarations(fileData, baseName),
          filePath
        ));
      }
    } else if (filePath.indexOf(config.etcPagesSourceDir) === 0) {
      result.push(new DeclarationsInFile(
        constants.RESOURCE_IN_PAGES_TYPE,
        findPageDeclarations(fileData),
        filePath
      ));
    } else if (filePath.indexOf(config.etcFlowsSourceDir) === 0) {
      result.push(new DeclarationsInFile(
        constants.RESOURCE_IN_FLOWS_TYPE,
        findFlowDeclarations(fileData),
        filePath
      ));
    }
  }
  return result;
};

/**
 *
 * @param filePath
 * @returns Promise{filePath, functionDeclarations,  componentDeclarations}
 */
const parseFileAsync = (filePath) => {
  return readFile(filePath)
    .then(fileData => {
      return parseFileData(filePath, fileData);
    });
};

const parseDir = async (dirPath) => {
  let foundFiles;
  try {
    foundFiles = await readDir(dirPath);
  } catch (e) {
    console.error(e);
  }
  let declarationsInFiles = [];
  const parseFileTasks = [];
  if (foundFiles && foundFiles.length > 0) {
    foundFiles.forEach(foundFile => {
      parseFileTasks.push(
        parseFileAsync(repairPath(foundFile))
          .then(declarationsInFile => {
            declarationsInFiles = declarationsInFiles.concat(declarationsInFile);
          })
          .catch(err => console.error(`Error parsing of the file ${foundFile}: `, err))
      )
    });
  }
  await Promise.all(parseFileTasks);
  return declarationsInFiles;
};

const parseFile = (filePath) => {
  return parseFileAsync(filePath)
    .then(declarationsInFile => {
      return declarationsInFile;
    })
    .catch(err => console.error(`Error parsing of the file ${filePath}: `, err));
};

export const parseResource = async (resourcePath, resourceFileData = null) => {
  const validResourcePath = repairPath(resourcePath);
  let declarationsInFiles = null;
  if (resourceFileData) {
    declarationsInFiles = parseFileData(validResourcePath, resourceFileData);
  } else {
    const isFileResource = await isFile(validResourcePath);
    if (isFileResource) {
      declarationsInFiles = await parseFile(validResourcePath);
    } else {
      declarationsInFiles = await parseDir(validResourcePath);
    }
  }
  return declarationsInFiles;
};
