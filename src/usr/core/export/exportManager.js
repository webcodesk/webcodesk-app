import {
  ensureFilePath,
  repairPath,
  isExisting,
  writeFile
} from '../utils/fileUtils';
import * as resourceLinker from './resourcesLinker';
import * as exportFileManagerCRA from './cra/exportFileManager';
import * as storeGeneratorCRA from './cra/storeGenerator';
import * as appIndexGeneratorCRA from './cra/appIndexGenerator';
import * as pageGeneratorCRA from './cra/pageGenerator';
import * as startWrapperGeneratorCRA from './cra/startWrapperGenerator';
import * as containerGeneratorCRA from './cra/containerGenerator';
import * as functionGeneratorCRA from './cra/functionGenerator';

export async function checkRootDirectory(destDirPath) {
  try {
    await isExisting(repairPath(destDirPath));
    return true;
  } catch(e) {
    return false;
  }
}

export async function checkFilesAndDirs(destDirPath) {
  return await exportFileManagerCRA.checkFilesAndDirs(destDirPath);
}

export async function rewriteFilesAndDirs(destDirPath, helpers, existing) {
  return await exportFileManagerCRA.rewriteFilesAndDirs(destDirPath, helpers, existing);
}

export async function generateApp(destDirPath, helpers) {
  let fileList = [];
  const { pagesTree, actionSequences, targetProperties, publicUrl } = helpers;

  let resources =
    resourceLinker.getResources(pagesTree, actionSequences, targetProperties);

  resources = {...resources, ...{ publicUrl } };

  fileList = fileList.concat(
    storeGeneratorCRA.generate(destDirPath, resources)
  );
  fileList = fileList.concat(
    appIndexGeneratorCRA.generate(destDirPath, resources)
  );
  fileList = fileList.concat(
    startWrapperGeneratorCRA.generate(destDirPath, resources)
  );
  fileList = fileList.concat(
    containerGeneratorCRA.generate(destDirPath, resources)
  );
  fileList = fileList.concat(
    pageGeneratorCRA.generate(destDirPath, resources)
  );
  fileList = fileList.concat(
    functionGeneratorCRA.generate(destDirPath, resources)
  );

  // fileList.forEach(fileObject => {
  //   console.info('File path: ', fileObject.filePath);
  //   console.info('File data: ', fileObject.fileData);
  // });
  //
  // for (let i = 0; i < 3; i++) {
  //   console.info('-----');
  // }

  let sequence = Promise.resolve();
  if (fileList.length > 0) {
    fileList.forEach(fileObject => {
      if (fileObject.filePath && fileObject.fileData) {
        sequence = sequence.then(() => {
          return ensureFilePath(fileObject.filePath)
            .then(() => {
              return writeFile(fileObject.filePath, fileObject.fileData);
            })
            .catch(err => {
              console.error(`Can not write file ${fileObject.filePath}. ${err.message}`);
            });
        });
      }
    });
  }
  return sequence;

}