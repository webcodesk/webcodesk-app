import cloneDeep from 'lodash/cloneDeep';
import { path } from '../utils/electronUtils';
import constants from '../../commons/constants';
import { getIndexFileText, getArrayDefaultExportFileText } from './fileTemplates';
import { ensureFilePath, removeFileAndEmptyDir, repairPath, writeFile } from '../utils/fileUtils';
import { readDir } from '../utils/dirUtils';

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

function createFlow (model, level = 0) {
  const targetsPerEvents = [];
  if (model) {
    const localRoot = {};
    let { type, props: { outputs, inputs }, children } = model;
    if (type === constants.FLOW_APPLICATION_STARTER_TYPE) {
      localRoot.type = 'component';
      localRoot.props = {
        componentName: 'applicationStartWrapper',
        componentInstance: 'wrapperInstance',
      };
    } else if (type === constants.FLOW_COMPONENT_INSTANCE_TYPE) {
      localRoot.type = 'component';
      localRoot.props = {
        componentName: model.props.componentName,
        componentInstance: model.props.componentInstance,
      };
      if (model.props.populatePath) {
        // was set in the previous iteration when the page node was visited
        localRoot.props.populatePath = model.props.populatePath;
      }
    } else if (type === constants.FLOW_USER_FUNCTION_TYPE) {
      localRoot.type = 'userFunction';
      localRoot.props = {
        functionName: model.props.functionName,
      };
    } else if (type === constants.FLOW_PAGE_TYPE) {
      localRoot.type = 'component';
      localRoot.props = {
        forwardPath: model.props.pagePath
      };
      if (children && children.length > 0) {
        children.forEach(childOfPage => {
          if (childOfPage) {
            // have to implicit set populated props for it was found in the next iteration for each child
            childOfPage.props = childOfPage.props || {};
            childOfPage.props.populatePath = model.props.pagePath;
          }
        });
      }
    } else {
      localRoot.type = 'unknown';
    }

    let linkedOutputs = [];
    if (children && children.length > 0) {
      children.forEach(childModel => {
        linkedOutputs = linkedOutputs.concat(createFlow(childModel, level + 1));
      });
    }
    if (outputs && outputs.length > 0) {
      const events = [];
      let event;
      let foundTargets;
      outputs.forEach(output => {
        foundTargets = linkedOutputs.filter(i => i.eventName === output.name);
        if (foundTargets && foundTargets.length > 0) {
          event = {
            name: output.name,
            targets: foundTargets.map(i => i.target),
          };
          events.push(event);
        }
      });
      if (events.length > 0) {
        localRoot.events = events;
      }
    }
    if (level === 0) {
      targetsPerEvents.push({
        target: localRoot,
      });
    } else if (inputs && inputs.length > 0) {
      inputs.forEach(input => {
        if (input.connectedTo && input.connectedTo.length > 0) {
          if (type === constants.FLOW_COMPONENT_INSTANCE_TYPE) {
            localRoot.props.propertyName = input.name;
          }
          targetsPerEvents.push({
            eventName: input.connectedTo,
            target: localRoot,
          });
        }
      });
    }
  }
  return targetsPerEvents;
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
        const fileData = [];
        let flowTree;
        children.forEach(fileChild => {
          if (fileChild.type === constants.GRAPH_MODEL_FLOW_TYPE && fileChild.props) {
            flowTree = cloneDeep(fileChild.props.flowTree);
            const flow = createFlow(flowTree);
            if (flow && flow.length > 0) {
              flow.forEach(flowItem => {
                if (flowItem.target) {
                  if (fileChild.props.isDisabled) {
                    flowItem.target.props = flowItem.target.props || {};
                    flowItem.target.props.isDisabled = fileChild.props.isDisabled;
                  }
                  fileData.push(flowItem.target);
                }
              });
            }
          }
        });
        resultFiles.push({
          filePath,
          fileBody: getArrayDefaultExportFileText({ fileData })
        });
      }
    } else if (children && children.length > 0) {
      children.forEach(child => {
        resultFiles = resultFiles.concat(makeFileListByResourcesTree(child, destDirPath, replaceImportDir));
      });
    }
  }
  return resultFiles;
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
        return ensureFilePath(filePath)
          .then(() => {
            return writeFile(filePath, fileBody).catch(error => {
              console.error(`Can not write index file "${filePath}" `, error);
            });
          })
          .catch(error => {
            console.error(`Can not create file "${filePath}" `, error);
          });
      });
    });
  }
  return sequence;
}

const verifiedFilesPaths = new Map();

async function cleanDir (dirPath) {
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
