import forOwn from 'lodash/forOwn';
import {fs, request, path} from '../utils/electronUtils';
import axios from 'axios';
import * as constants from '../../commons/constants';
import {repairPath} from "./fileUtils";

let axiosInstance;

function getInstance() {
  if (!axiosInstance) {
    axiosInstance = axios.create({
      baseURL: constants.URL_WEBCODESK_SERVICE,
    });
  }
  return axiosInstance;
}

export function get(url, token) {
  return getInstance()
    .get(url, {headers: {'X-Auth-Token': token ? token : ''}})
    .then(response => response.data);
}

export function post(url, token, body) {
  return getInstance()
    .post(url, body, {headers: {'X-Auth-Token': token ? token : ''}})
    .then(response => response.data);
}

export function download(url, token, destDirPath) {
  return getInstance()
    .get(url, {
      headers: {
        'X-Auth-Token': token ? token : '',
      },
      responseType: 'stream'
    })
    .then(response => {
      if (response && response.data) {
        const headerLine = response.headers['content-disposition'];
        const startFileNameIndex = headerLine.indexOf('"') + 1;
        const endFileNameIndex = headerLine.lastIndexOf('"');
        const filename = headerLine.substring(startFileNameIndex, endFileNameIndex);

        const writer = fs().createWriteStream(path().join(destDirPath, filename));
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        })
      }
    });

}

export function download2(url, token, destDirPath) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      url: `${constants.URL_WEBCODESK_SERVICE}${url}`,
      method: 'GET',
      headers: {
        'X-Auth-Token': token ? token : ''
      },
      encoding: null
    };
    try {
      request()(requestOptions)
        .on('error', (error) => {
          reject(error || 'Error downloading file');
        })
        .on('response', (response) => {
          if (response) {
            if (response.statusCode === 200) {
              const contentDisposition = response.headers['content-disposition'];
              const matches = /filename="(.*)"/g.exec(contentDisposition);
              if (matches && matches.length > 1) {
                // create file write stream
                const destinationFile = repairPath(path().join(destDirPath, matches[1]));
                fs().ensureFileSync(destinationFile);
                const writer = fs().createWriteStream(destinationFile);
                writer.on('finish', () => {
                  resolve();
                });
                writer.on('error', (error) => {
                  reject(error || 'Error downloading file');
                });
                response.pipe(writer);
              } else {
                reject('Can not find file name in the response.');
              }
            } else {
              reject('Error downloading file: ' + response.statusCode);
            }
          } else {
            reject('Error downloading file');
          }
        })
    } catch (e) {
      console.error(e);
      reject('Error connection with server');
    }
  });
}

// export function upload1(url, token, filePath) {
//   const formData = new FormData();
//   formData.append('file', fs().createReadStream(filePath));
//   return getInstance()
//     .post(url, formData, {
//       headers: {
//         'X-Auth-Token': token ? token : '',
//         ...formData.getHeaders()
//       }
//     })
//     .then(response => response.data);
// }

export function upload(url, token, files, options) {
  const formData = {};
  return new Promise((resolve, reject) => {
    if (files) {
      forOwn(files, (filePath, fileItem) => {
        formData[fileItem] = fs().createReadStream(filePath);
      });
    }
    const requestOptions = {
      url: `${constants.URL_WEBCODESK_SERVICE}${url}`,
      method: "POST",
      formData: {
        ...formData,
        ...options
      },
      headers: {
        'X-Auth-Token': token ? token : ''
      }
    };
    try {
      request()(requestOptions, (error, response, body) => {
        if (response) {
          if (response.statusCode === 200) {
            forOwn(formData, value => {
              if (value) {
                value.destroy();
              }
            });
            resolve();
          } else {
            reject(error || body || 'Error uploading file');
          }
        } else {
          reject(error || body || 'Error uploading file');
        }
      });
    } catch (e) {
      console.error(e);
      reject('Error connection with server');
    }
  })
    .catch(e => {
      forOwn(formData, value => {
        if (value) {
          value.destroy();
        }
      });
      throw Error(e);
    });
}
