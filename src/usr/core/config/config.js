import { path } from '../utils/electronUtils';
import { isExisting, readJson, repairPath } from '../utils/fileUtils';
import constants from '../../commons/constants';
import { getProjectSettings, saveProjectSettings } from './storage';

export let projectDirPath;
/**
 * Project src directory
 */
export let packageConfig;

export let projectName;
export let projectRootSourceDir;
export let projectPackageFile;
export let projectTSConfigFile;
export let projectYarnLockFile;
export let projectPublicDir;
export let usrSourceDir;
export let appSourceDir;
export let appIndicesSourceDir;
export let etcSourceDir;
export let etcPagesSourceDir;
export let etcFlowsSourceDir;

export let appSchemaSourceDir;
export let appSchemaPagesSourceDir;
export let appSchemaFlowsSourceDir;
export let appSchemaRouterFile;
export let appSchemaInitialStateFile;

export let reactScriptsStartPath;

export let packageUploadDirPath;
export let packageDownloadDirPath;

export let projectSettings;

export const checkProjectPaths = async (dirPath) => {

  // load package file

  // check if all essential project parts are existing
  // check root source code dir
  const testProjectDirPath = repairPath(dirPath);
  const testProjectPackageFile =
    repairPath(path().join(testProjectDirPath, constants.FILE_NAME_PACKAGE));
  try {
    await isExisting(testProjectPackageFile);
  } catch (e) {
    throw Error(`Project package file is missing. Please check "package.json" file exists in ${testProjectDirPath}.`);
  }
  let testProjectTSConfigFile =
    repairPath(path().join(testProjectDirPath, constants.FILE_NAME_TS_CONFIG));
  try {
    await isExisting(testProjectTSConfigFile);
    projectTSConfigFile = testProjectTSConfigFile;
  } catch (e) {
    // it is optional for project to have tsconfig.json
    projectTSConfigFile = null;
  }
  const testProjectRootSourceDir =
    repairPath(path().join(testProjectDirPath, constants.DIR_NAME_SRC));
  try {
    await isExisting(testProjectRootSourceDir);
  } catch (e) {
    throw Error(`Project source code dir is missing. Please check "src" directory exists in ${testProjectDirPath}.`);
  }
  const testProjectPublicDir =
    repairPath(path().join(testProjectDirPath, constants.DIR_NAME_PUBLIC));
  try {
    await isExisting(testProjectPublicDir);
  } catch (e) {
    throw Error(`Project public dir is missing. Please check "public" directory exists in ${testProjectDirPath}.`);
  }
  // check usr dir path in the project
  const testUsrSourceDir =
    repairPath(path().join(testProjectRootSourceDir, constants.DIR_NAME_USR));
  try {
    await isExisting(testUsrSourceDir);
  } catch (e) {
    throw Error(`User source code dir is missing. Please check "src/usr" directory exists in ${testProjectDirPath}.`);
  }
  // check app dir path in the project
  const testAppSourceDir =
    repairPath(path().join(testProjectRootSourceDir, constants.DIR_NAME_APP));
  try {
    await isExisting(testAppSourceDir);
  } catch (e) {
    throw Error(`App source code dir is missing. Please check "src/app" directory exists in ${testProjectDirPath}.`);
  }
  // check app indices dir path in the project
  const testAppIndicesSourceDir =
    repairPath(path().join(testProjectRootSourceDir, constants.DIR_NAME_APP, constants.DIR_NAME_INDICES));
  // try {
  //   await isExisting(testAppIndicesSourceDir);
  // } catch (e) {
  //   throw Error(`App indices source code dir is missing. Please check "src/app/indices" directory exists in ${testProjectDirPath}.`);
  // }
  // check pages config dir path in the project
  const testEtcPagesSourceDir =
    repairPath(path().join(testProjectRootSourceDir, constants.DIR_NAME_ETC, constants.DIR_NAME_PAGES));
  try {
    await isExisting(testEtcPagesSourceDir);
  } catch (e) {
    throw Error(`Pages configurations dir is missing. Please check "src/etc/pages" directory exists in ${testProjectDirPath}.`);
  }
  // check pages config dir path in the project
  const testEtcFlowsSourceDir =
    repairPath(path().join(testProjectRootSourceDir, constants.DIR_NAME_ETC, constants.DIR_NAME_FLOWS));
  try {
    await isExisting(testEtcFlowsSourceDir);
  } catch (e) {
    throw Error(`Data flows configurations dir is missing. Please check "src/etc/flows" directory exists in ${testProjectDirPath}.`);
  }
  // check yarn lock file existing
  const testProjectYarnLockFile =
    repairPath(path().join(testProjectDirPath, constants.FILE_NAME_YARN_LOCK));
  try {
    await isExisting(testProjectYarnLockFile);
    projectYarnLockFile = testProjectYarnLockFile;
  } catch (e) {
    projectYarnLockFile = null;
  }

  const startScriptPath = repairPath(path().join(
    testProjectDirPath,
    constants.NODE_MODULES_DIR_NAME,
    constants.REACT_SCRIPTS_NAME,
    'scripts',
    `start.js`,
  ));

  try {
    await isExisting(startScriptPath);
  } catch (e) {
    throw Error(`Start script is missing in ${testProjectDirPath}.`);
  }

  return {
    testProjectDirPath,
    testProjectPackageFile,
    testProjectPublicDir,
    testProjectRootSourceDir,
    testUsrSourceDir,
    testAppSourceDir,
    testAppIndicesSourceDir,
    testEtcPagesSourceDir,
    testEtcFlowsSourceDir,
    startScriptPath,
  }
};

export const initProjectPaths = async (dirPath) => {

  const validPaths = await checkProjectPaths(dirPath);

  projectDirPath = validPaths.testProjectDirPath;
  projectPackageFile = validPaths.testProjectPackageFile;
  projectPublicDir = validPaths.testProjectPublicDir;
  projectRootSourceDir = validPaths.testProjectRootSourceDir;
  usrSourceDir = validPaths.testUsrSourceDir;
  appSourceDir = validPaths.testAppSourceDir;
  appIndicesSourceDir = validPaths.testAppIndicesSourceDir;
  etcPagesSourceDir = validPaths.testEtcPagesSourceDir;
  etcFlowsSourceDir = validPaths.testEtcFlowsSourceDir;

  etcSourceDir = repairPath(path().join(projectRootSourceDir, constants.DIR_NAME_ETC));

  appSchemaSourceDir = repairPath(path().join(validPaths.testAppSourceDir, constants.DIR_NAME_SCHEMA));
  appSchemaFlowsSourceDir = repairPath(path().join(appSchemaSourceDir, constants.DIR_NAME_FLOWS));
  appSchemaPagesSourceDir = repairPath(path().join(appSchemaSourceDir, constants.DIR_NAME_PAGES));
  appSchemaRouterFile = repairPath(path().join(appSchemaSourceDir, `${constants.FILE_NAME_ROUTER}.js`));
  appSchemaInitialStateFile = repairPath(path().join(appSchemaSourceDir, `${constants.FILE_NAME_INITIAL_STATE}.js`));

  packageUploadDirPath = repairPath(path().join(projectDirPath, constants.DIR_NAME_UPLOAD));
  packageDownloadDirPath = repairPath(path().join(projectDirPath, constants.DIR_NAME_DOWNLOAD));

  reactScriptsStartPath = validPaths.startScriptPath;

  projectSettings = await getProjectSettings(projectDirPath);
  if (!projectSettings) {
    projectSettings = constants.PROJECT_SETTINGS_DEFAULTS;
    await saveProjectSettings(projectDirPath, projectSettings);
  }

  packageConfig = await readJson(projectPackageFile);

  projectName = path().basename(dirPath);

};

export const mergeProjectSettings = async (newSettings) => {
  const newProjectSettings = {...projectSettings, ...newSettings};
  await saveProjectSettings(projectDirPath, newProjectSettings);
  projectSettings = newProjectSettings;
};
