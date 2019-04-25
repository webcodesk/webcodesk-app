import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';
import * as config from 'usr/core/config/config';
import * as electronUtils from '../utils/electronUtils';
import * as dirUtils from '../utils/dirUtils';
import * as constants from 'usr/commons/constants';
import * as javaScriptParser from './javaScriptParser';
import {
  readFileSync,
  repairPath,
  copyFile,
  writeJson,
  packTarGz,
  removeFile,
  writeBinaryFile,
  readJson,
  readBlobAsArrayBuffer
} from '../utils/fileUtils';
import * as restClient from '../utils/restClient';

import { getImportModuleName, getModuleName, getModuleVersion } from './utils';

function checkFile (rootDirPath, filePath, dirFiles) {
  let result = [];
  const dirFile = dirFiles.find(i => i.filePath.indexOf(filePath) === 0);
  if (dirFile && !dirFile.isChecked) {
    // set flag this file is checked to avoid circular dependencies
    dirFile.isChecked = true;
    filePath = dirFile.filePath;
    // get file attributes: dir, base, name, ext
    const fileAttrs = electronUtils.path().parse(filePath);

    if (fileAttrs.ext === constants.JS_FILE_EXTENSION
      || fileAttrs.ext === constants.TS_FILE_EXTENSION
      || fileAttrs.ext === constants.TSX_FILE_EXTENSION) {

      result.push(
        {
          filePath,
          destPath: filePath.replace(rootDirPath, ''),
          isTypeScript: fileAttrs.ext === constants.TS_FILE_EXTENSION
            || fileAttrs.ext === constants.TSX_FILE_EXTENSION
        }
      );

      // get all possible imports and required paths
      const fileData = readFileSync(filePath);
      const imports = javaScriptParser.parse(fileData);

      if (imports && imports.length > 0) {
        imports.forEach(importItemPath => {
          if (importItemPath.indexOf('..') === 0) {
            throw new Error(`Imports outside the component's dir are not allowed: ${importItemPath}`);
          } else if (importItemPath.indexOf('.') === 0) {
            const realFilePath = repairPath(electronUtils.path().resolve(fileAttrs.dir, importItemPath));
            const realFileChecks = checkFile(rootDirPath, realFilePath, dirFiles);
            result = result.concat(realFileChecks);
          } else {
            const moduleName = getImportModuleName(importItemPath);
            let depVersion = getModuleVersion(config.projectDirPath, moduleName);
            if (depVersion) {
              result.push({
                dependency: {
                  name: moduleName,
                  version: depVersion
                }
              });
            } else {
              throw new Error(`Invalid import: ${importItemPath}`);
            }
          }
        });
      }
    } else if (fileAttrs.ext === '.css') {
      result.push(
        {
          filePath,
          destPath: filePath.replace(rootDirPath, '')
        }
      );
    } else {
      throw new Error(`Imports with ${fileAttrs.ext} extension are not allowed. Use only .js, .ts, .tsx, .css extensions`);
    }
  }
  return result;
}

export async function prepareComponentPackage (filePath, uploadDirPath, image) {

  let sequence = Promise.resolve();
  let error = null;
  const packageDirPath = repairPath(electronUtils.path().join(uploadDirPath, 'package'));

  filePath = repairPath(filePath);
  const fileAttrs = electronUtils.path().parse(filePath);
  const fileDirPath = repairPath(fileAttrs.dir);
  const files = await dirUtils.readDir(fileDirPath);
  let storyFilePath = null;
  let readmeFilePath = null;
  let typesFilePath = null;
  let isTypeScript = false;
  let copyFilePath;
  const checkStoryFileName = `${fileAttrs.name}.stories${fileAttrs.ext}`;
  const checkTypesFileName = `i${fileAttrs.name}.d.ts`;
  const checkReadmeFilePath = repairPath(electronUtils.path().join(fileAttrs.dir, constants.FILE_NAME_README));
  const dependenciesFilePath = repairPath(electronUtils.path().join(packageDirPath, `${fileAttrs.name}.deps.json`));
  const componentFiles = [];
  const componentDependencies = [];
  if (files && files.length > 0) {
    const validFiles = [];
    let validFilePath;
    let validFileName;
    files.forEach(fileItemPath => {
      validFilePath = repairPath(fileItemPath);
      validFiles.push({
        isChecked: false,
        filePath: validFilePath
      });
      validFileName = electronUtils.path().basename(validFilePath);
      if (validFileName === checkStoryFileName) {
        storyFilePath = validFilePath;
      } else if(validFileName === checkTypesFileName) {
        typesFilePath = validFilePath;
      } else if(validFilePath === checkReadmeFilePath) {
        readmeFilePath = validFilePath;
      }
    });
    let packageFiles = [];
    try {
      packageFiles = checkFile(fileDirPath, filePath, validFiles);
      if (storyFilePath) {
        packageFiles = packageFiles.concat(checkFile(fileDirPath, storyFilePath, validFiles))
      }
      if (typesFilePath) {
        packageFiles.push({
            filePath: typesFilePath,
            destPath: typesFilePath.replace(fileDirPath, '')
          }
        );
      }
      if (readmeFilePath) {
        packageFiles.push({
            filePath: readmeFilePath,
            destPath: readmeFilePath.replace(fileDirPath, '')
          }
        );
      }
    } catch (e) {
      error = e.message;
    }
    if (!error) {
      packageFiles = uniqWith(packageFiles, isEqual);
      if (packageFiles.length > 0) {
        packageFiles.forEach(packageFile => {
          if (packageFile.dependency) {
            componentDependencies.push(`${packageFile.dependency.name}@${packageFile.dependency.version}`);
          } else if (packageFile.filePath) {
            if (packageFile.isTypeScript) {
              isTypeScript = true;
            }
            sequence = sequence.then(() => {
              componentFiles.push(packageFile.destPath);
              copyFilePath = repairPath(electronUtils.path().join(packageDirPath, packageFile.destPath));
              return copyFile(packageFile.filePath, copyFilePath);
            });
          }
        });
        sequence = sequence.then(() => {
          return writeJson(dependenciesFilePath, componentDependencies);
        });
      }
    }
  }
  let imgFilePath;
  if (image) {
    imgFilePath = repairPath(electronUtils.path().join(uploadDirPath, `${fileAttrs.name}.tmb.png`));
  }
  const packageFilePath = repairPath(electronUtils.path().join(uploadDirPath, `${fileAttrs.name}.tar.gz`));
  const readmeCopyFilePath = repairPath(electronUtils.path().join(uploadDirPath, constants.FILE_NAME_README));
  let license = '';
  let repositoryUrl = '';
  return sequence
    .then(() => {
      if (error) {
        throw Error(error);
      }
      if (readmeFilePath) {
        return copyFile(readmeFilePath, readmeCopyFilePath);
      }
    })
    .then(() => {
      return readJson(config.projectPackageFile)
        .then(projectPackageConfig => {
          license = projectPackageConfig.license;
          const { repository: projectRepository } = projectPackageConfig;
          if (projectRepository) {
            repositoryUrl = projectRepository.url;
          }
        })
    })
    .then(() => {
      if (imgFilePath) {
        return writeBinaryFile(imgFilePath, image.toPNG());
      }
    })
    .then(() => {
      return {
        componentName: fileAttrs.name,
        componentFiles,
        componentDependencies,
        packageFilePath,
        readmeCopyFilePath,
        packageDirPath,
        readmeFilePath,
        dependenciesFilePath,
        imgFilePath,
        hasReadme: !!readmeFilePath,
        isTypeScript,
        license,
        repositoryUrl
      };
    });
}

export async function prepareFunctionsPackage (filePath, uploadDirPath) {
  let sequence = Promise.resolve();
  let error = null;
  const packageDirPath = repairPath(electronUtils.path().join(uploadDirPath, 'package'));
  filePath = repairPath(filePath);
  const fileAttrs = electronUtils.path().parse(filePath);
  const fileDirPath = repairPath(fileAttrs.dir);
  const files = await dirUtils.readDir(fileDirPath);
  let storyFilePath = null;
  let readmeFilePath = null;
  let typesFilePath = null;
  let isTypeScript = false;
  let copyFilePath;
  const checkTypesFileName = `i${fileAttrs.name}.d.ts`;
  const checkReadmeFilePath = repairPath(electronUtils.path().join(fileAttrs.dir, constants.FILE_NAME_README));
  const dependenciesFilePath = repairPath(electronUtils.path().join(packageDirPath, `${fileAttrs.name}.deps.json`));
  const functionsFiles = [];
  const functionsDependencies = [];
  if (files && files.length > 0) {
    const validFiles = [];
    let validFilePath;
    let validFileName;
    files.forEach(fileItemPath => {
      validFilePath = repairPath(fileItemPath);
      validFiles.push({
        isChecked: false,
        filePath: validFilePath
      });
      validFileName = electronUtils.path().basename(validFilePath);
      if(validFileName === checkTypesFileName) {
        typesFilePath = validFilePath;
      } else if(validFilePath === checkReadmeFilePath) {
        readmeFilePath = validFilePath;
      }
    });
    let packageFiles = [];
    try {
      packageFiles = checkFile(fileDirPath, filePath, validFiles);
      if (storyFilePath) {
        packageFiles = packageFiles.concat(checkFile(fileDirPath, storyFilePath, validFiles))
      }
      if (typesFilePath) {
        packageFiles.push({
            filePath: typesFilePath,
            destPath: typesFilePath.replace(fileDirPath, '')
          }
        );
      }
      if (readmeFilePath) {
        packageFiles.push({
            filePath: readmeFilePath,
            destPath: readmeFilePath.replace(fileDirPath, '')
          }
        );
      }
    } catch (e) {
      error = e.message;
    }
    if (!error) {
      packageFiles = uniqWith(packageFiles, isEqual);
      if (packageFiles.length > 0) {
        packageFiles.forEach(packageFile => {
          if (packageFile.dependency) {
            functionsDependencies.push(`${packageFile.dependency.name}@${packageFile.dependency.version}`);
          } else if (packageFile.filePath) {
            if (packageFile.isTypeScript) {
              isTypeScript = true;
            }
            sequence = sequence.then(() => {
              functionsFiles.push(packageFile.destPath);
              copyFilePath = repairPath(electronUtils.path().join(packageDirPath, packageFile.destPath));
              return copyFile(packageFile.filePath, copyFilePath);
            });
          }
        });
        sequence = sequence.then(() => {
          return writeJson(dependenciesFilePath, functionsDependencies);
        });
      }
    }
  }
  const packageFilePath = repairPath(electronUtils.path().join(uploadDirPath, `${fileAttrs.name}.tar.gz`));
  const readmeCopyFilePath = repairPath(electronUtils.path().join(uploadDirPath, constants.FILE_NAME_README));
  let license = '';
  let repositoryUrl = '';
  return sequence
    .then(() => {
      if (error) {
        throw Error(error);
      }
      if (readmeFilePath) {
        return copyFile(readmeFilePath, readmeCopyFilePath);
      }
    })
    .then(() => {
      return readJson(config.projectPackageFile)
        .then(projectPackageConfig => {
          license = projectPackageConfig.license;
          const { repository: projectRepository } = projectPackageConfig;
          if (projectRepository) {
            repositoryUrl = projectRepository.url;
          }
        })
    })
    .then(() => {
      return {
        functionsName: fileAttrs.name,
        functionsFiles,
        functionsDependencies,
        packageFilePath,
        readmeCopyFilePath,
        packageDirPath,
        readmeFilePath,
        dependenciesFilePath,
        hasReadme: !!readmeFilePath,
        isTypeScript,
        license,
        repositoryUrl
      };
    });
}

export async function makePackageFile(packageDirPath, packageFilePath) {
  packageDirPath = repairPath(packageDirPath);
  packageFilePath = repairPath(packageFilePath);
  return packTarGz(packageDirPath, packageFilePath);
}

export async function checkExtraDeps(dependenciesFilePath, extraDeps) {
  let sequence = Promise.resolve();
  const validDeps = [];
  if (extraDeps && extraDeps.length > 0) {
    extraDeps.forEach(dependency => {
      sequence = sequence.then(() => {
        const moduleName = getModuleName(dependency);
        let depVersion = getModuleVersion(config.projectDirPath, moduleName);
        if (!depVersion) {
          throw new Error(`Invalid extra dependency: ${dependency}`);
        } else {
          validDeps.push(
            `${moduleName}@${depVersion}`
          );
        }
      });
    });
  }
  return sequence
    .then(() => {
      return readJson(dependenciesFilePath);
    })
    .then(dependencies => {
      dependencies = dependencies || [];
      dependencies = dependencies.concat(validDeps);
      return writeJson(dependenciesFilePath, dependencies);
    });
}

export async function uploadPackage (files, options, token) {
  await restClient.upload(
    '/publish/component',
    token,
    files,
    options
  );
}

export async function removeUploadDir (uploadDirPath) {
  await removeFile(uploadDirPath);
}

export async function writeCroppedImageFile (imgFilePath, blob) {
  const arrayBuffer = await readBlobAsArrayBuffer(blob);
  await writeBinaryFile(imgFilePath, new Uint8Array(arrayBuffer));
}