import { TSX_FILE_EXTENSION, TS_FILE_EXTENSION, JS_FILE_EXTENSION } from '../../commons/constants';
import * as config from '../config/config';
import components from './components';
import functions from './functions';
import { ensureFilePath, writeFile } from '../utils/fileUtils';

const componentGeneratorsMap = {
  'empty': {
    [TSX_FILE_EXTENSION]: components.emptyComponentTS,
    [JS_FILE_EXTENSION]: components.emptyComponentJS,
  },
  'form': {
    [TSX_FILE_EXTENSION]: components.formComponentTS,
    [JS_FILE_EXTENSION]: components.formComponentJS,
  },
  'input': {
    [TSX_FILE_EXTENSION]: components.inputComponentTS,
    [JS_FILE_EXTENSION]: components.inputComponentJS,
  },
  'view': {
    [TSX_FILE_EXTENSION]: components.viewComponentTS,
    [JS_FILE_EXTENSION]: components.viewComponentJS,
  },
  'centered': {
    [TSX_FILE_EXTENSION]: components.centeredCellLayoutTS,
    [JS_FILE_EXTENSION]: components.centeredCellLayoutJS,
  },
  '3_in_column': {
    [TSX_FILE_EXTENSION]: components.vertical1Column3RowsLayoutTS,
    [JS_FILE_EXTENSION]: components.vertical1Column3RowsLayoutJS,
  },
  '3_in_row': {
    [TSX_FILE_EXTENSION]: components.horizontal3Columns1RowLayoutTS,
    [JS_FILE_EXTENSION]: components.horizontal3Columns1RowLayoutJS,
  },
  '2_cells_left': {
    [TSX_FILE_EXTENSION]: components.horizontal2Columns1RowLeftLayoutTS,
    [JS_FILE_EXTENSION]: components.horizontal2Columns1RowLeftLayoutJS,
  },
  '2_cells_right': {
    [TSX_FILE_EXTENSION]: components.horizontal2Columns1RowRightLayoutTS,
    [JS_FILE_EXTENSION]: components.horizontal2Columns1RowRightLayoutJS,
  },
  'holy_grail': {
    [TSX_FILE_EXTENSION]: components.holyGrailLayoutTS,
    [JS_FILE_EXTENSION]: components.holyGrailLayoutJS,
  },
};

const functionsGeneratorsMap = {
  [TS_FILE_EXTENSION]: functions.functionsTS,
  [JS_FILE_EXTENSION]: functions.functionsJS,
};

export async function generateComponentScaffold(name, directoryName, fileExtension, componentScaffold) {
  directoryName = directoryName || '';
  const generator = componentGeneratorsMap[componentScaffold][fileExtension];
  let sequence = Promise.resolve();
  if (generator) {
    const fileList = await generator.createFiles(name, directoryName, config.usrSourceDir, fileExtension);
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
  }
  return sequence;
}

export async function generateFunctionsScaffold(
  name, directoryName, fileExtension, functionsVariants, valueType
) {
  directoryName = directoryName || '';
  const generator = functionsGeneratorsMap[fileExtension];
  let sequence = Promise.resolve();
  if (generator) {
    const fileList = await generator.createFiles(
      functionsVariants, valueType, name, directoryName, config.usrSourceDir, fileExtension
    );
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
  }
  return sequence;
}
