import * as fileUtils from '../utils/fileUtils';
import * as parserManager from '../parser/parserManager';
import * as config from '../config/config';
import * as projectResourcesManager from './projectResourcesManager';
import { sendAppWidowMessage } from '../utils/electronUtils';
import * as indicesGeneratorManager from '../generator/indicesGeneratorManager';
import * as schemaIndexGeneratorManager from '../generator/schemaIndexGeneratorManager';
import * as pagesGeneratorManager from '../generator/pagesGeneratorManager';
import * as flowsGeneratorManager from '../generator/flowsGeneratorManager';
import appWindowMessages from '../../commons/appWindowMessages';
import constants from '../../commons/constants';
import { getConsoleErrors } from '../../core/config/storage';
import { repairPath } from '../utils/fileUtils';
import * as publishManager from '../market/publishManager';
import * as installManager from '../market/installManager';

async function generateSchema () {
  // generate schema index just for the sake it is missing
  await schemaIndexGeneratorManager.generateSchemaIndex(config.appSchemaSourceDir);

  // omit root keys
  const pagesStarterKey =
    config.etcPagesSourceDir.replace(`${config.projectRootSourceDir}${constants.FILE_SEPARATOR}`, '');
  const pages = projectResourcesManager.getPagesTree(pagesStarterKey);
  // if we want to write pages files we have to write them into schema dir
  // but before we need to get rid of the etc dir in the import paths of the page resources
  const replacePagesDirName =
    `${constants.DIR_NAME_ETC}${constants.FILE_SEPARATOR}${constants.DIR_NAME_PAGES}`;
  // write pages files
  await pagesGeneratorManager.generateFiles(pages, config.appSchemaPagesSourceDir, replacePagesDirName);
  // write routes file
  await pagesGeneratorManager.generateRoutesFile(pages, config.appSchemaRouterFile, replacePagesDirName);
  // write initial state file
  await pagesGeneratorManager.generateInitialStateFile(pages, config.appSchemaInitialStateFile);

  // omit root keys
  const flowsStarterKey =
    config.etcFlowsSourceDir.replace(`${config.projectRootSourceDir}${constants.FILE_SEPARATOR}`, '');
  const flows = projectResourcesManager.getFlowsTree(flowsStarterKey);
  // if we want to write flows files we have to write them into schema dir
  // but before we need to get rid of the etc dir in the import paths of the flow resources
  const replaceFlowsDirName =
    `${constants.DIR_NAME_ETC}${constants.FILE_SEPARATOR}${constants.DIR_NAME_FLOWS}`;
  // write flows files
  await flowsGeneratorManager.generateFiles(flows, config.appSchemaFlowsSourceDir, replaceFlowsDirName);

}

export async function generateIndices () {
  // Obtain model trees from the graphs
  const userFunctions = projectResourcesManager.getUserFunctionsTree();
  const userComponents = projectResourcesManager.getUserComponentsTree();
  const userComponentStories = projectResourcesManager.getUserComponentStoriesTree();
  // Regenerate index files by the trees
  const resourceTrees = [
    {
      tree: userFunctions,
      indexDirName: constants.INDEX_USER_FUNCTIONS_ROOT_DIR_NAME,
    },
    {
      tree: userComponents,
      indexDirName: constants.INDEX_COMPONENTS_ROOT_DIR_NAME,
    },
    {
      tree: userComponentStories,
      indexDirName: constants.INDEX_COMPONENT_STORIES_ROOT_DIR_NAME,
    },
  ];
  await indicesGeneratorManager.generateFiles(resourceTrees, config.appIndicesSourceDir);
}

async function generateFiles () {
  await generateIndices();
  await generateSchema();
}

export async function testProjectConfiguration (dirPath) {
  await config.checkProjectPaths(dirPath);
}

export async function initProjectConfiguration (dirPath) {
  await config.initProjectPaths(dirPath);
}

export function getProjectSettings () {
  return config.projectSettings;
}

export async function mergeProjectSettings (newSettings) {
  await config.mergeProjectSettings(newSettings);
  return config.projectSettings;
}

export function startProjectServer () {
  sendAppWidowMessage(appWindowMessages.PROJECT_SERVER_START, {
    projectDirPath: config.projectDirPath,
    startScriptPath: config.reactScriptsStartPath,
    port: config.projectSettings.port
  });
}

export function stopProjectServer () {
  sendAppWidowMessage(appWindowMessages.PROJECT_SERVER_STOP);
}

export function getProjectServerStatus () {
  sendAppWidowMessage(appWindowMessages.PROJECT_SERVER_STATUS_REQUEST);
}

export function getProjectServerLog () {
  sendAppWidowMessage(appWindowMessages.PROJECT_SERVER_LOG_REQUEST);
}

export function openUrlInExternalBrowser (url) {
  sendAppWidowMessage(appWindowMessages.OPEN_URL_IN_EXTERNAL_BROWSER, { url });
}

export async function getSyslog () {
  return getConsoleErrors();
}

export async function watchUsrSourceDir () {
  // Make resources trees by declarations in files
  // Init new resources graphs
  projectResourcesManager.initNewResourcesTrees();
  // read the entire usr directory after a while
  await readResource(config.usrSourceDir);
  // read the entire etc directory after a while
  await readResource(config.etcPagesSourceDir);
  await readResource(config.etcFlowsSourceDir);
  // Start watching resources
  sendAppWidowMessage(appWindowMessages.WATCHER_START_WATCHING_FILES, {
    paths: [
      config.usrSourceDir,
    ],
    projectDirPath: config.projectDirPath,
  });
}

export function stopWatchUsrSourceDir () {
  // clear all global store items
  projectResourcesManager.resetResourcesTrees();
  sendAppWidowMessage(appWindowMessages.WATCHER_STOP_WATCHING_FILES);
}

export async function readResource (resourcePath) {
  const validResourcePath = repairPath(resourcePath);
  const declarationsInFiles = await parserManager.parseResource(validResourcePath);
  if (declarationsInFiles && declarationsInFiles.length > 0) {
    // Update resources in the graphs for updated files
    const { updatedResources, deletedResources, doUpdateAll } =
      projectResourcesManager.updateResources(declarationsInFiles);
    // try to generate all needed files
    await generateFiles();
    // tell there are updated resources
    return { updatedResources, deletedResources, doUpdateAll };
  }
  // tell there are no updated resources
  return {};
}

export async function removeResource (resourcePath) {
  const validResourcePath = repairPath(resourcePath);
  // to remove all resources just create empty declarations and pass them to update the resource trees
  const emptyDeclarationsInFiles = parserManager.createEmptyResource(validResourcePath);
  // Update resource in the graphs
  const { updatedResources, deletedResources, doUpdateAll } =
    projectResourcesManager.updateResources(emptyDeclarationsInFiles, () => {
      return false;
    });
  // try to generate all needed files
  await generateFiles();
  return { updatedResources, deletedResources, doUpdateAll };

}

export async function updateResource (resourcePath, resourceFileData) {
  // optimistic update of the declarations in files
  const validResourcePath = repairPath(resourcePath);
  const declarationsInFiles = await parserManager.parseResource(validResourcePath, resourceFileData);
  if (declarationsInFiles && declarationsInFiles.length > 0) {
    // Update resource in the graphs
    const { updatedResources, deletedResources, doUpdateAll } =
      projectResourcesManager.updateResources(declarationsInFiles);
    // try to generate all needed files
    await generateFiles();
    return { updatedResources, deletedResources, doUpdateAll };
  }
  return {};
}

export async function checkResourceExists (resourcePath) {
  const validResourcePath = repairPath(resourcePath);
  try {
    await fileUtils.isExisting(validResourcePath);
    return true;
  } catch (e) {
    return false;
  }
}

export async function writeEtcFile (filePath, fileData) {
  const validResourcePath = repairPath(filePath);
  if (validResourcePath.indexOf(config.etcPagesSourceDir) === 0
    || validResourcePath.indexOf(config.etcFlowsSourceDir) === 0) {
    await fileUtils.ensureFilePath(validResourcePath);
    await fileUtils.writeFile(validResourcePath, fileData);
  } else {
    throw Error(`It is not allowed to write files out of ${config.etcSourceDir} directory.`);
  }
}

export async function deleteEtcFile (filePath) {
  const validResourcePath = repairPath(filePath);
  if (validResourcePath.indexOf(config.etcPagesSourceDir) === 0) {
    await fileUtils.removeFileAndEmptyDir(validResourcePath, config.etcPagesSourceDir);
  } else if (validResourcePath.indexOf(config.etcFlowsSourceDir) === 0
    || validResourcePath.indexOf(config.etcFlowsSourceDir) === 0) {
    await fileUtils.removeFileAndEmptyDir(validResourcePath, config.etcFlowsSourceDir);
  } else {
    throw Error(`It is not allowed to delete files out of ${config.etcSourceDir} directory.`);
  }
}

export async function writeSourceFile(filePath, fileData) {
  const validResourcePath = repairPath(filePath);
  if (validResourcePath.indexOf(config.usrSourceDir) === 0) {
    await fileUtils.ensureFilePath(validResourcePath);
    await fileUtils.writeFile(validResourcePath, fileData);
  } else {
    throw Error(`It is not allowed to write files out of ${config.usrSourceDir} directory.`);
  }
}

export async function prepareComponentPackage (componentFilePath, groupName, image) {
  const result =
    await publishManager.prepareComponentPackage(componentFilePath, config.packageUploadDirPath, image);
  if (result) {
    return {
      projectName: config.projectName,
      groupName: groupName !== constants.DIR_NAME_USR ? groupName : '',
      componentName: result.componentName,
      packageFiles: result.componentFiles,
      dependencies: result.componentDependencies,
      hasReadme: result.hasReadme,
      isTypeScript: result.isTypeScript,
      readmeFilePath: result.readmeCopyFilePath,
      imgFilePath: result.imgFilePath,
      packageDirPath: result.packageDirPath,
      packageFilePath: result.packageFilePath,
      dependenciesFilePath: result.dependenciesFilePath,
      license: result.license,
      repositoryUrl: result.repositoryUrl,
      packageType: constants.MARKET_PUBLISH_COMPONENT_PACKAGE_TYPE
    };
  }
  return null;
}

async function makeComponentPackageFile (packageMetaData) {
  const {
    imgFilePath, croppedImageBlob, extraDeps, dependenciesFilePath, packageDirPath, packageFilePath
  } = packageMetaData;
  if (croppedImageBlob) {
    await publishManager.writeCroppedImageFile(imgFilePath, croppedImageBlob);
  }
  const extraDepsArray = extraDeps ? extraDeps.split(' ') : [];
  await publishManager.checkExtraDeps(dependenciesFilePath, extraDepsArray);
  await publishManager.makePackageFile(packageDirPath, packageFilePath);
}

async function uploadComponentPackage (packageMetaData, token) {
  const options = {
    projectName: packageMetaData.projectName,
    groupName: packageMetaData.groupName,
    componentName: packageMetaData.componentName,
    repoUrl: packageMetaData.repositoryUrl,
    demoUrl: packageMetaData.demoUrl,
    description: packageMetaData.description,
    tags: packageMetaData.searchTags,
    lang: packageMetaData.isTypeScript ? 'typescript' : 'javascript',
    type: 'component',
    license: packageMetaData.license.substring(0, 250),
  };
  const files = {
    file: packageMetaData.packageFilePath,
    readme: packageMetaData.readmeFilePath,
    picture: packageMetaData.imgFilePath
  };
  await publishManager.uploadPackage(files, options, token);
}

export async function prepareFunctionsPackage (componentFilePath, groupName) {
  const result =
    await publishManager.prepareFunctionsPackage(componentFilePath, config.packageUploadDirPath);
  if (result) {
    return {
      projectName: config.projectName,
      groupName: groupName !== constants.DIR_NAME_USR ? groupName : '',
      functionsName: result.functionsName,
      packageFiles: result.functionsFiles,
      dependencies: result.functionsDependencies,
      hasReadme: result.hasReadme,
      isTypeScript: result.isTypeScript,
      readmeFilePath: result.readmeCopyFilePath,
      packageDirPath: result.packageDirPath,
      packageFilePath: result.packageFilePath,
      dependenciesFilePath: result.dependenciesFilePath,
      license: result.license,
      repositoryUrl: result.repositoryUrl,
      packageType: constants.MARKET_PUBLISH_FUNCTIONS_PACKAGE_TYPE
    };
  }
  return null;
}

async function makeFunctionsPackageFile (packageMetaData) {
  const {
    extraDeps, dependenciesFilePath, packageDirPath, packageFilePath
  } = packageMetaData;
  const extraDepsArray = extraDeps ? extraDeps.split(' ') : [];
  await publishManager.checkExtraDeps(dependenciesFilePath, extraDepsArray);
  await publishManager.makePackageFile(packageDirPath, packageFilePath);
}

async function uploadFunctionsPackage (packageMetaData, token) {
  const options = {
    projectName: packageMetaData.projectName,
    groupName: packageMetaData.groupName,
    componentName: packageMetaData.functionsName,
    repoUrl: packageMetaData.repositoryUrl,
    demoUrl: packageMetaData.demoUrl,
    description: packageMetaData.description,
    tags: packageMetaData.searchTags,
    lang: packageMetaData.isTypeScript ? 'typescript' : 'javascript',
    type: 'functions',
    license: packageMetaData.license.substring(0, 250)
  };
  const files = {
    file: packageMetaData.packageFilePath,
    readme: packageMetaData.readmeFilePath,
  };
  await publishManager.uploadPackage(files, options, token);
}

export async function makePackageFile(packageMetaData) {
  const {packageType} = packageMetaData;
  if (packageType === constants.MARKET_PUBLISH_COMPONENT_PACKAGE_TYPE) {
    await makeComponentPackageFile(packageMetaData);
  } else if (packageType === constants.MARKET_PUBLISH_FUNCTIONS_PACKAGE_TYPE) {
    await makeFunctionsPackageFile(packageMetaData);
  }
}

export async function uploadPackage(packageMetaData, token) {
  const {packageType} = packageMetaData;
  if (packageType === constants.MARKET_PUBLISH_COMPONENT_PACKAGE_TYPE) {
    await uploadComponentPackage(packageMetaData, token);
  } else if (packageType === constants.MARKET_PUBLISH_FUNCTIONS_PACKAGE_TYPE) {
    await uploadFunctionsPackage(packageMetaData, token);
  }
}

export async function removeUploadDir () {
  await publishManager.removeUploadDir(config.packageUploadDirPath);
}

export async function installSelected (selectedItemData, dirName) {
  await installManager.installPackage(selectedItemData, dirName);
}

export async function removeDownloadDir() {
  await installManager.removeDownloadDir();
}