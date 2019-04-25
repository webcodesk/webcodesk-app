let electron;
let fsExtra;
let nodePath;
let nodeChildProcess;
let nodePsTree;
let nodeProcess;
let nodeTar;
let nodeZlib;
let nodeRequest;
if (window.require) {
  electron = window.require('electron');
  fsExtra = window.require('fs-extra');
  nodePath = window.require('path');
  nodeChildProcess = window.require('child_process');
  nodePsTree = window.require('ps-tree');
  nodeProcess = window.require('process');
  nodeTar = window.require('tar-fs');
  nodeZlib = window.require('zlib');
  nodeRequest = window.require('request');
} else {
  try {
    fsExtra = require('fs-extra');
    nodePath = require('path');
    nodeChildProcess = require('child_process');
    nodePsTree = require('ps-tree');
    nodeProcess = require('process');
    nodeTar = require('tar-fs');
    nodeZlib = require('zlib');
    nodeRequest = require('request');
  } catch (e) {
    // do nothing
  }
}

export const fs = () => {
  if (fsExtra) {
    return fsExtra;
  }
  throw Error('Works only in electron environment');
};

export const path = () => {
  if (nodePath) {
    return nodePath;
  }
  throw Error('Works only in electron environment');
};

export const child_process = () => {
  if (nodeChildProcess) {
    return nodeChildProcess;
  }
  throw Error('Works only in electron environment');
};

export const psTree = () => {
  if (nodePsTree) {
    return nodePsTree;
  }
  throw Error('Works only in electron environment');
};

export const process = () => {
  if (nodeProcess) {
    return nodeProcess;
  }
  throw Error('Works only in electron environment');
};

export const tar = () => {
  if (nodeTar) {
    return nodeTar;
  }
  throw Error('Works only in electron environment');
};

export const zlib = () => {
  if (nodeZlib) {
    return nodeZlib;
  }
  throw Error('Works only in electron environment');
};

export const request = () => {
  if (nodeRequest) {
    return nodeRequest;
  }
  throw Error('Works only in electron environment');
};

export const electronRemote = () => {
  if (electron && electron.remote) {
    return electron.remote;
  }
  throw Error('Works only in electron environment');
};

export const selectDirectoryDialog = (callback) => {
  const dialog = electronRemote().dialog;
  dialog.showOpenDialog({ properties: ['openDirectory'] }, callback);
};

export const sendAppWidowMessage = (type, payload) => {
  if (electron) {
    electron.ipcRenderer.send('appWindowMessage', { type, payload });
  } else {
    throw Error('Works only in the electron environment.');
  }
};

export const showConfirmationDialog = (message, callback) => {
  if (electron && electron.remote) {
    const dialog = electronRemote().dialog;
    dialog.showMessageBox({type: 'question', buttons: ["OK", "Cancel"], defaultId: 0, message}, (response) => {
      if (callback) {
        callback(response === 0);
      }
    });
  } else {
    const response = window.confirm(message);
    if (callback) {
      callback(response);
    }
  }
};

export const infok = 'usr.components.dialogs.ProjectServerDialog.ProjectServerDialog.';
