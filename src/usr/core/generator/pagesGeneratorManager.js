import { path } from '../utils/electronUtils';
import constants from '../../commons/constants';
import { getIndexFileText, getArrayDefaultExportFileText } from './fileTemplates';
import {
  removeFileAndEmptyDir,
  repairPath,
  writeFileWhenDifferent
} from '../utils/fileUtils';
import { readDir } from '../utils/dirUtils';
import PageComposerManager from '../pageComposer/PageComposerManager';

function createComponentsTree(model, level = 0) {
  if (model && model.props) {
    const { type, children, props: {componentName, componentInstance, elementProperty} } = model;
    if (type === constants.PAGE_COMPONENT_TYPE) {
      const localRoot = {
        type: componentName,
        instance: componentInstance,
        props: {}
      };
      if (children && children.length > 0) {
        children.forEach(child => {
          const {key, value} = createComponentsTree(child, level + 1);
          if (key && value) {
            localRoot.props[key] = value;
          }
        });
      }
      if (elementProperty) {
        return {
          key: elementProperty,
          value: localRoot,
        }
      }
      return localRoot;
    }
  }
  return {};
}

export function makeIndexFileListByResourcesTree (resourceModel, destDirPath, replaceImportDir) {
  let resultFiles = [];
  if (resourceModel) {
    const { props, children } = resourceModel;
    const schemaImportPath = props && props.indexImportPath
      ? props.indexImportPath.replace(replaceImportDir, '')
      : null;
    let indexFilePath = schemaImportPath && schemaImportPath.length > 0
      ? path().join(destDirPath, schemaImportPath, 'index.js')
      : path().join(destDirPath, 'index.js');
    indexFilePath = repairPath(indexFilePath);
    const importFiles = [];
    if (children && children.length > 0) {
      children.forEach(child => {
        const { type: childType, props: childProps } = child;
        if (childType === constants.GRAPH_MODEL_FILE_TYPE) {
          importFiles.push({
            defaultString: childProps.name,
            importPath: `./${childProps.name}`,
          });
        } else if (childType === constants.GRAPH_MODEL_DIR_TYPE) {
          importFiles.push({
            defaultString: `${childProps.name}`,
            importPath: `./${childProps.name}`
          });
          resultFiles = resultFiles.concat(makeIndexFileListByResourcesTree(child, destDirPath, replaceImportDir));
        }
      });
    }
    resultFiles.push({
      filePath: indexFilePath,
      fileBody: getIndexFileText({ importFiles }),
    });
  }
  return resultFiles;
}

export function makeFileListByResourcesTree (resourceModel, destDirPath, replaceImportDir) {
  let resultFiles = [];
  if (resourceModel) {
    const { type, props, children } = resourceModel;
    if (type === constants.GRAPH_MODEL_FILE_TYPE) {
      const schemaImportPath = props && props.indexImportPath
        ? `${props.indexImportPath.replace(replaceImportDir, '')}.js`
        : null;
      if (schemaImportPath && schemaImportPath.length > 0 && children && children.length > 0) {
        let filePath = repairPath(path().join(destDirPath, schemaImportPath));
        if (children && children.length > 0) {
          const { type: pageType, props: pageProps } = children[0];
          if (pageType === constants.GRAPH_MODEL_PAGE_TYPE && pageProps) {
            const { componentsTree } = pageProps;
            const fileData = createComponentsTree(componentsTree);
            resultFiles.push({
              filePath,
              fileBody: getArrayDefaultExportFileText({ fileData })
            });
          }
        }
      }
    } else if (children && children.length > 0) {
      children.forEach(child => {
        resultFiles = resultFiles.concat(makeFileListByResourcesTree(child, destDirPath, replaceImportDir));
      });
    }
  }
  return resultFiles;
}

export function makeRouterItemsData (resourceModel) {
  let resultItems = [];
  if (resourceModel) {
    const { type, props, children } = resourceModel;
    if (type === constants.GRAPH_MODEL_PAGE_TYPE) {
      let path = `${constants.FILE_SEPARATOR}${props.pagePath}/:parameter?`;
      const pageName =
        `${props.pagePath.replace(constants.FILE_SEPARATOR_REGEXP, constants.MODEL_KEY_SEPARATOR)}`;
      resultItems.push({
        path,
        pageName,
      });
    } else if (children && children.length > 0) {
      children.forEach(child => {
        resultItems = resultItems.concat(makeRouterItemsData(child));
      });
    }
  }
  return resultItems;
}

function writeFiles (fileList) {
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

const verifiedFilesPaths = new Map();

async function cleanDir(dirPath) {
  const fileList = await readDir(dirPath);
  let sequence = Promise.resolve();
  if (fileList && fileList.length > 0) {
    fileList.forEach(filePath => {
      if (!verifiedFilesPaths.get(repairPath(filePath))) {
        // candidate to be deleted
        sequence = sequence.then(() => {
          return removeFileAndEmptyDir(filePath, dirPath);
        });
      }
    });
  }
  return sequence;
}

export function generateFiles (resourcesTrees, destDirPath, replaceImportDir) {
  verifiedFilesPaths.clear();
  let fileList = makeFileListByResourcesTree(resourcesTrees, destDirPath, replaceImportDir);
  fileList = fileList.concat(
    makeIndexFileListByResourcesTree(resourcesTrees, destDirPath, replaceImportDir)
  );
  return writeFiles(fileList)
    .then(() => {
      return cleanDir(destDirPath);
    });
}

export function generateRoutesFile (resourcesTrees, destFilePath, replaceImportDir) {
  const routerItems = makeRouterItemsData(resourcesTrees);
  if (routerItems && routerItems.length > 0) {
    const foundIndexRoute = routerItems.find(i => i.pageName === 'main');
    const foundHomeRoute = routerItems.find(i => i.path === '/');
    if (!foundHomeRoute) {
      if (foundIndexRoute) {
        routerItems.unshift({
          path: '/',
          pageName: foundIndexRoute.pageName,
        });
      } else {
        routerItems.unshift({
          path: '/',
          pageName: routerItems[0].pageName,
        });
      }
    } else {
      if (foundIndexRoute) {
        foundHomeRoute.pageName = foundIndexRoute.pageName;
      } else {
        routerItems.unshift({
          path: '/',
          pageName: routerItems[0].pageName,
        });
      }
    }
  }
  const filePath = destFilePath;
  const fileBody = getArrayDefaultExportFileText({ fileData: routerItems });
  return writeFileWhenDifferent(filePath, fileBody)
    .catch(error => {
      console.error(`Can not create router file: "${filePath}" `, error);
    });
}

function getPagesInstances (resourceModel) {
  let resultItems = [];
  if (resourceModel) {
    const { type, props, children } = resourceModel;
    if (type === constants.GRAPH_MODEL_PAGE_TYPE && props) {
      const {componentsTree} = props;
      resultItems = new PageComposerManager(componentsTree).getInstancesListUniq();
    }
    if (children && children.length > 0) {
      children.forEach(child => {
        resultItems = resultItems.concat(getPagesInstances(child));
      });
    }
  }
  return resultItems;
}

export function generateInitialStateFile (resourcesTree, destFilePath) {
  const pagesInstances = getPagesInstances(resourcesTree);
  if (pagesInstances && pagesInstances.length > 0) {
    const initialStateData = {};
    pagesInstances.forEach(componentInstance => {
      if (componentInstance.initialState) {
        initialStateData[`${componentInstance.componentName}_${componentInstance.componentInstance}`] =
          componentInstance.initialState;
      }
    });
    const filePath = destFilePath;
    const fileBody = getArrayDefaultExportFileText({ fileData: initialStateData });
    return writeFileWhenDifferent(filePath, fileBody)
      .catch(error => {
        console.error(`Can not create initial state file: "${filePath}" `, error);
      });
  }
}