import uniqBy from 'lodash/uniqBy';
import { path } from 'usr/core/utils/electronUtils';
import { getIndexFileText } from './fileTemplates';
import constants from '../../commons/constants';
import {
  repairPath,
  removeFileAndEmptyDir,
  writeFileWhenDifferent
} from '../utils/fileUtils';
import { readDir } from '../utils/dirUtils';

function makeIndexFileListByResourcesTree (resourceModel, indicesDirPath, validChildren = null) {
  const { props, children } = resourceModel;
  let resultFiles = [];
  let importFiles = [];
  let childrenArray = validChildren || children;
  if (childrenArray && childrenArray.length > 0) {
    let membersListString = '';
    childrenArray.forEach(child => {
      const { type: childType, props: childProps } = child;
      if (childType === constants.GRAPH_MODEL_COMPONENT_STORIES_TYPE) {
        importFiles.push({
          defaultString: childProps.name,
          importPath: props.importPath,
        });
      } else if (childType === constants.GRAPH_MODEL_USER_FUNCTION_TYPE) {
        // Functions are always imported as member from the module
        membersListString += childProps.name + ',';
      } else if (childType === constants.GRAPH_MODEL_DIR_TYPE) {
        importFiles.push({
          defaultString: `${childProps.name}`,
          importPath: `./${childProps.name}`
        });
        resultFiles = resultFiles.concat(makeIndexFileListByResourcesTree(child, indicesDirPath));
      } else if (childType === constants.GRAPH_MODEL_FILE_TYPE) {
        if (childProps.resourceType === constants.RESOURCE_IN_USER_FUNCTIONS_TYPE) {
          importFiles.push({
            defaultString: `${childProps.name}`,
            importPath: `./${childProps.name}`
          });
          const functionsChildren = child.children;
          let validFunctionsChildren = [];
          if (functionsChildren && functionsChildren.length > 0) {
            functionsChildren.forEach(functionsChild => {
              if (functionsChild) {
                if (functionsChild.type === constants.GRAPH_MODEL_FUNCTIONS_TYPE) {
                  // here we have to skip this type in the hierarchy
                  validFunctionsChildren = validFunctionsChildren.concat(functionsChild.children);
                } else if (functionsChild.type === constants.GRAPH_MODEL_USER_FUNCTION_TYPE) {
                  validFunctionsChildren.push(functionsChild);
                }
              }
            });
          }
          resultFiles = resultFiles.concat(makeIndexFileListByResourcesTree(child, indicesDirPath, validFunctionsChildren));
        } else if (childProps.resourceType === constants.RESOURCE_IN_COMPONENTS_TYPE) {
          importFiles.push({
            defaultString: childProps.name,
            importPath: childProps.importPath,
          });
        } else {
          importFiles.push({
            defaultString: `${childProps.name}`,
            importPath: `./${childProps.name}`
          });
          resultFiles = resultFiles.concat(makeIndexFileListByResourcesTree(child, indicesDirPath));
        }
      }
    });
    if (membersListString.length > 0) {
      importFiles.push({
        membersListString: membersListString.substr(0, membersListString.length - 1),
        importPath: props.importPath,
      });
    }
  }
  let indexFilePath = props.indexImportPath
    ? path().join(indicesDirPath, props.indexImportPath, 'index.js')
    : path().join(indicesDirPath, 'index.js');
  indexFilePath = repairPath(indexFilePath);
  // let's remove identical by import path files:
  // that may occur when we detect .ts(.tsx) and .js(.jsx) files with the equal names
  importFiles = uniqBy(importFiles, 'importPath');
  resultFiles.push({
    filePath: indexFilePath,
    fileBody: getIndexFileText({ importFiles }),
  });
  return resultFiles;
}

const verifiedFilesPaths = new Map();

function generateIndexFiles (resourcesTrees, indexRootDirName, appIndicesDirPath,) {
  const fileList =
    makeIndexFileListByResourcesTree(resourcesTrees, path().join(appIndicesDirPath, indexRootDirName));
  const validFileList = [];
  fileList.forEach(file => {
    verifiedFilesPaths.set(file.filePath, true);
    validFileList.push(file);
  });
  let sequence = Promise.resolve();
  if (validFileList && validFileList.length > 0) {
    validFileList.forEach(indexFile => {
      sequence = sequence.then(() => {
        const { filePath, fileBody } = indexFile;
        return writeFileWhenDifferent(filePath, fileBody)
          .catch(error => {
            console.error(`Can not create file "${filePath}" `, error);
          });
      });
    });
  }
  return sequence;
}

async function cleanIndicesDir (appIndicesDirPath) {
  const indexFileList = await readDir(appIndicesDirPath);
  let sequence = Promise.resolve();
  if (indexFileList && indexFileList.length > 0) {
    indexFileList.forEach(filePath => {
      if (!verifiedFilesPaths.get(repairPath(filePath))) {
        // candidate to be deleted
        sequence = sequence.then(() => {
          return removeFileAndEmptyDir(filePath, appIndicesDirPath);
        });
      }
    });
  }
  return sequence;
}

export function generateFiles (resourceTrees, appIndicesDirPath) {
  let sequence = Promise.resolve();
  if (resourceTrees && resourceTrees.length > 0) {
    const importFiles = [];
    verifiedFilesPaths.clear();
    resourceTrees.forEach(resourceTree => {
      sequence = sequence.then(() => {
        importFiles.push(
          {
            defaultString: resourceTree.indexDirName,
            importPath: `./${resourceTree.indexDirName}`
          });
        return generateIndexFiles(resourceTree.tree, resourceTree.indexDirName, appIndicesDirPath);
      });
    });
    sequence = sequence.then(() => {
      const filePath = repairPath(path().join(appIndicesDirPath, 'index.js'));
      const fileBody = getIndexFileText({ importFiles });
      return writeFileWhenDifferent(filePath, fileBody)
        .then(() => {
          verifiedFilesPaths.set(filePath, true);
        });
    });
    sequence = sequence
      .then(() => {
        return cleanIndicesDir(appIndicesDirPath);
      });
  }
  return sequence;
}
