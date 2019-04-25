import * as constants from '../../commons/constants';
import { child_process, path, process as nodeProcess } from '../utils/electronUtils';
import { repairPath } from '../utils/fileUtils';

export async function createNewProject (options, feedback) {

  if (options && feedback) {
    const { destDirPath, projectName, projectType } = options;
    const validDestDirPath = repairPath(destDirPath);
    const newFolderPath = path().join(validDestDirPath, projectName);
    const args = [
      constants.CURRENT_CREATE_REACT_APP,
      projectName,
      '--scripts-version',
      constants.CURRENT_WEBCODESK_REACT_SCRIPTS
    ];
    if (projectType === constants.NEW_PROJECT_TYPE_SCRIPT_TYPE) {
      args.push('--typescript');
    }
    let command = 'npx.cmd';
    if (nodeProcess().platform !== 'win32') {
      command = 'npx';
    }
    try {
      const processChild = child_process().spawn(command,
        args,
        {
          env: {
            ...window.process.env,
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

        if (processChild.stdout) {
          processChild.stdout.on('data', function (data) {
            feedback({
              code: 'log',
              message: new TextDecoder('utf-8').decode(data)
            });
          });
        }

        if (processChild.stderr) {
          processChild.stderr.on('data', function (data) {
            feedback({
              code: 'log',
              message: new TextDecoder('utf-8').decode(data)
            });
          });
        }

        processChild.on('exit', function (code, signal) {
          feedback({
            code: '' + code,
            message: `child process exited with code ${code} and signal ${signal}`,
            newProjectDirPath: newFolderPath,
          });
        });
      }
    } catch(err) {
      feedback({
        code: '1',
        message: err.message,
      });
    }
  }

}

// export async function stopServer() {
//   const projectSettings = config.projectSettings;
//   const projectDirPath = config.projectDirPath;
//
//   console.info('Stopping server: ', projectDirPath, projectSettings);
//   console.info('Stopping server: ', processChild ? processChild.pid : 'No PID');
//   if (processChild && checkProcess(processChild.pid)) {
//     console.info('Killing server');
//     kill(processChild.pid, () => {
//       console.info('Server is stopped');
//     });
//     processChild = null;
//   }
//
// }
//
// export function getServerStatus() {
//   return {
//     isRunning: processChild && processChild.pid,
//   };
// }
//
// export function getServerLog() {
//   return {
//     logRecords: logRecords
//   };
// }
//
// function checkProcess(pid) {
//   console.info('Checking the process: ', pid);
//   if (!pid) {
//     return false;
//   }
//
//   try {
//     nodeProcess().kill(pid, 0);
//     return true;
//   }
//   catch (err) {
//     console.info('Error checking the process: ', err);
//     return false;
//   }
// }
//
// function kill(pid, callback) {
//   const signal = 'SIGKILL';
//   if (process.platform !== 'win32') {
//     psTree()(pid, function (err, children) {
//       console.info('Children process: ', children);
//       [pid].concat(
//         children.map(function (p) {
//           return p.PID;
//         })
//       ).forEach(function (tpid) {
//         console.info('Killing child PID: ', tpid);
//         try {
//           nodeProcess().kill(tpid, signal);
//         }
//         catch (ex) { }
//       });
//
//       callback();
//     });
//   }
//   else {
//     console.info('Just kill on Win32');
//     try {
//       nodeProcess().kill(pid, signal);
//     }
//     catch (ex) { }
//     callback();
//   }
// }
