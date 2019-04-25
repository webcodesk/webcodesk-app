import isEqual from 'lodash/isEqual';
import uniqWith from "lodash/uniqWith";
import {child_process, path, process as nodeProcess} from '../utils/electronUtils';
import { repairPath, copyFile, removeFile, readJson, unpackTarGz } from '../utils/fileUtils';
import * as config from 'usr/core/config/config';
import * as dirUtils from '../utils/dirUtils';
import * as restClient from '../utils/restClient';
import {getModuleName, getModuleVersion} from "./utils";

export function installPackage(packageOptions, destDirName) {
  const destDirPath = repairPath(path().join(config.usrSourceDir, destDirName));
  return downloadPackages(packageOptions, config.packageDownloadDirPath)
    .then(() => {
      return unpackPackages(config.packageDownloadDirPath);
    })
    .then(({packageFileList, packageDependencies}) => {
      const validDeps = checkDependencies(config.projectDirPath, packageDependencies);
      if (validDeps && validDeps.length > 0) {
        return install(config.projectDirPath, validDeps)
          .then(() => {
            return packageFileList;
          });
      }
      return packageFileList;
    })
    .then(packageFileList => {
      let sequence = Promise.resolve();
      if (packageFileList && packageFileList.length > 0) {
        packageFileList.forEach(fileItemPath => {
          sequence = sequence.then(() => {
            const destFilePath = fileItemPath.replace(config.packageDownloadDirPath, destDirPath);
            return copyFile(fileItemPath, destFilePath);
          });
        });
      }
      return sequence;
    });
}

export function removeDownloadDir() {
  return removeFile(config.packageDownloadDirPath);
}

function downloadPackages(packageOptions, destDirPath) {
  const { userId, projectName, groupName, componentId, componentName, components } = packageOptions;
  let prefixUrl = `/public/component/package?userId=${userId}&projectName=${projectName}`;
  let sequence = Promise.resolve();
  if (components && components.length > 0) {
    components.forEach(componentItem => {
      sequence = sequence.then(() => {
        let validDestDirPath;
        if (componentId) {
          // download only component package into download dir
          validDestDirPath = repairPath(destDirPath);
        } else {
          // download into group subdir
          validDestDirPath = repairPath(path().join(destDirPath, componentItem.group));
        }
        return restClient.download2(
          `${prefixUrl}&groupName=${componentItem.group}&componentName=${componentItem.name}&componentId=${componentItem.id}`,
          null,
          validDestDirPath
        );
      });
    });
  } else if (groupName && componentId && componentName) {
    sequence = sequence.then(() => {
      const validDestDirPath = repairPath(destDirPath);
      return restClient.download2(
        `${prefixUrl}&groupName=${groupName}&componentName=${componentName}&componentId=${componentId}`,
        null,
        validDestDirPath
      );
    });
  }
  return sequence;
}

function unpackPackages(dirPath) {
  let packageFileList = [];
  let packageDependencies = [];
  return dirUtils.readDir(dirPath)
    .then(files => {
      let sequence = Promise.resolve();
      if (files && files.length > 0) {
        files.forEach(fileItemPath => {
          sequence = sequence
            .then(() => {
              const destDirPath = path().dirname(fileItemPath);
              return unpackTarGz(fileItemPath, destDirPath);
            })
            .then(() => {
              return removeFile(fileItemPath);
            })
        });
      }
      return sequence;
    })
    .then(() => {
      return dirUtils.readDir(dirPath);
    })
    .then(files => {
      let sequence = Promise.resolve();
      if (files && files.length > 0) {
        let baseName;
        files.forEach(fileItemPath => {
          baseName = path().basename(fileItemPath);
          if (baseName && baseName.indexOf('.deps.json') > 0) {
            sequence = sequence.then(() => {
              return readJson(repairPath(fileItemPath)).then(depsList => {
                if (depsList && depsList.length > 0) {
                  packageDependencies = packageDependencies.concat(depsList);
                }
              });
            });
          } else {
            packageFileList.push(repairPath(fileItemPath));
          }
        });
      }
      return sequence;
    })
    .then(() => {
      packageDependencies = uniqWith(packageDependencies, isEqual);
      return {
        packageFileList,
        packageDependencies
      }
    });
}

function install(destDirPath, dependencies) {
  return new Promise((resolve, reject) => {
    installModules({destDirPath, dependencies}, ({code, message}) => {
      if (code !== '0') {
        reject(message);
      } else {
        resolve();
      }
    });
  });
}

function checkDependencies(projectDirPath, depsList) {
  const validDepsList = [];
  if (depsList && depsList.length > 0) {
    depsList.forEach(depItem => {
      const moduleName = getModuleName(depItem);
      const depVersion = getModuleVersion(projectDirPath, moduleName);
      if (!depVersion) {
        validDepsList.push(depItem);
      }
    });
  }
  return validDepsList;
}

function installModules (options, feedback) {
  if (options && feedback) {
    const { destDirPath, dependencies } = options;
    const validDestDirPath = repairPath(destDirPath);
    const useYarn = !!config.projectYarnLockFile;
    const args = useYarn
      ? [
        'add',
        '--exact',
        ...dependencies
      ]
      : [
        'install',
        '--save',
        ...dependencies
      ];
    let command;
    if (nodeProcess().platform !== 'win32') {
      command = useYarn ? 'yarnpkg' : 'npm';
    } else {
      command = useYarn ? 'yarnpkg.cmd' : 'npm.cmd';
    }
    try {
      const processChild = child_process().spawn(command,
        args,
        {
          env: {
            ...window.process.env,
            // ...process.env,
          },
          cwd: validDestDirPath
        },
      );

      if (processChild) {
        processChild.on('error', function (err) {
          console.error('Error: ', err);
          feedback({
            code: '1',
            message: err,
          });
        });

        // if (processChild.stdout) {
        //   processChild.stdout.on('data', function (data) {
        //     console.error('Installation package deps: ', new TextDecoder('utf-8').decode(data));
        //   });
        // }
        //
        // if (processChild.stderr) {
        //   processChild.stderr.on('data', function (data) {
        //     console.error('Error in installation package deps: ', new TextDecoder('utf-8').decode(data));
        //   });
        // }

        processChild.on('exit', function (code, signal) {
          feedback({
            code: '' + code,
            message: `child process exited with code ${code} and signal ${signal}`,
          });
        });
      }
    } catch(err) {
      console.error('Error: ', err);
      feedback({
        code: '1',
        message: err.message,
      });
    }
  }

}
