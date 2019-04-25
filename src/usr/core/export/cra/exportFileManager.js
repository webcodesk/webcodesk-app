import {
  copyFile,
  ensureDirPath,
  isExisting, readDirFilesFlat,
  readJson,
  removeFile,
  repairPath,
  writeFile
} from '../../utils/fileUtils';
import { path } from '../../utils/electronUtils';
import * as constants from '../../../commons/constants';
import * as config from '../../config/config';

export async function checkFilesAndDirs(destDirPath) {
  const existing = [];
  try {
    const destPackageFilePath =
      repairPath(
        path().join(destDirPath, constants.FILE_NAME_PACKAGE)
      );
    await isExisting(destPackageFilePath);
    existing.push(destPackageFilePath);
  } catch(e) { /* do nothing */ }
  try {
    const destPublicDirPath = repairPath(path().join(destDirPath, constants.DIR_NAME_PUBLIC));
    await isExisting(destPublicDirPath);
    existing.push(destPublicDirPath);
  } catch(e) { /* do nothing */ }
  try {
    const destSrcDirPath = repairPath(path().join(destDirPath, constants.DIR_NAME_SRC));
    await isExisting(destSrcDirPath);
    existing.push(destSrcDirPath);
  } catch(e) { /* do nothing */ }
  return existing;
}

export async function  rewriteFilesAndDirs(destDirPath, helpers, existing) {
  const { publicUrl } = helpers;
  const destDirPathValid = repairPath(destDirPath);
  const destPackageFilePath = repairPath(path().join(destDirPath, constants.FILE_NAME_PACKAGE));
  const destSrcDirPath = repairPath(path().join(destDirPath, constants.DIR_NAME_SRC));
  const destPublicDirPath = repairPath(path().join(destDirPath, constants.DIR_NAME_PUBLIC));
  // ensure in dest dir path
  try {
    await ensureDirPath(destDirPathValid)
  } catch (e) {
    console.error(`Can not create a root project directory. ${e.message}`);
  }
  // check if there are files and erase them
  try {
    if (existing.indexOf(destSrcDirPath) >= 0) {
      await removeFile(destSrcDirPath);
    }
    if (existing.indexOf(destPublicDirPath) >= 0) {
      await removeFile(destPublicDirPath);
    }
  } catch (e) {
    console.error(`Can not delete directory. ${e.message}`);
  }
  // read/write package file
  try {
    const packageFileData = config.packageConfig;
    if (packageFileData) {
      packageFileData.dependencies = packageFileData.dependencies || {};
      delete packageFileData.dependencies[constants.REACT_SCRIPTS_NAME];
      packageFileData.dependencies['react-scripts'] = constants.CURRENT_REACT_SCRIPTS_VERSION;
      packageFileData.dependencies['cross-env'] = constants.CURRENT_CROSS_ENV_VERSION;

      const frameworkPackageFileData =
        await readJson(repairPath(path().join(
          config.projectDirPath,
          constants.NODE_MODULES_DIR_NAME,
          constants.REACT_APP_FRAMEWORK,
          constants.FILE_NAME_PACKAGE
        )));

      if (frameworkPackageFileData && frameworkPackageFileData.dependencies) {
        packageFileData.dependencies = {
          ...packageFileData.dependencies,
          ...frameworkPackageFileData.dependencies
        };
      }

      if (publicUrl && publicUrl.length > 0) {
        packageFileData.homepage = '' + publicUrl;
      }

      await writeFile(destPackageFilePath, JSON.stringify(packageFileData, null, 2));
    }
  } catch (e) {
    console.error(`Can not read/write package file: ${e.message}`);
  }
  // copy tsconfig.json file if it exists
  try {
    if (config.projectTSConfigFile) {
      await copyFile(
        config.projectTSConfigFile,
        config.projectTSConfigFile.replace(config.projectDirPath, destDirPathValid)
      );
    }
  } catch (e) {
    console.error(`Can not copy tsconfig.json file: ${e.message}`);
  }
  // copy files in src dir
  try {
    const srcFiles = await readDirFilesFlat(config.projectRootSourceDir);
    if (srcFiles && srcFiles.length > 0) {
      for(let i = 0; i < srcFiles.length; i++) {
        await copyFile(srcFiles[i], srcFiles[i].replace(config.projectDirPath, destDirPathValid));
      }
    }
  } catch (e) {
    console.error(`Can not copy files from src directory: ${e.message}`);
  }
  // copy public dir
  try {
    await copyFile(config.projectPublicDir, destPublicDirPath);
  } catch (e) {
    console.error(`Can not copy files from public directory: ${e.message}`);
  }
  // copy usr dir
  try {
    await copyFile(config.usrSourceDir, config.usrSourceDir.replace(config.projectDirPath, destDirPathValid));
  } catch (e) {
    console.error(`Can not copy files from src/usr directory: ${e.message}`);
  }
}
