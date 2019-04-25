const electron = require('electron');
const constants = require('./commons/constants');
const appWindowMessages = require('./commons/appWindowMessages');

const shell = electron.shell;
const Menu = electron.Menu;

// function setProject(isOpen) {
//   const appMenu = Menu.getApplicationMenu();
//   if (appMenu) {
//     const projectSettingsItem = appMenu.getMenuItemById('file.project.close');
//     if (projectSettingsItem) {
//       projectSettingsItem.enabled = isOpen;
//     }
//   }
// }

function createMainMenu(app, mainWindow, sendMainWindowMessage, options) {
  // Custom menu template for all platforms
  const mainMenuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          id: 'file.signInOut',
          label: 'Sign In',
          click: () => {
            sendMainWindowMessage(appWindowMessages.SHOW_SIGN_IN_DIALOG);
          },
        },
        {type: 'separator'},
        {
          id: 'file.project.close',
          label: 'Close Project',
          enabled: false,
          click: () => {
            sendMainWindowMessage(appWindowMessages.ROUTER_GO_TO_HOME);
          },
        },
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          role: 'copy'
        },
        {
          role: 'paste'
        },
        {
          role: 'cut'
        },
      ]
    },
    {
      role: 'window',
      submenu: [
        {role: 'minimize'},
        {role: 'close'}
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          id: 'help.syslog',
          label: 'System Log',
          click: () => {
            sendMainWindowMessage(appWindowMessages.SHOW_SYSLOG_DIALOG);
          },
        },
        {type: 'separator'},
        {
          label: 'Issue Tracker',
          click() {
            shell.openExternal(constants.URL_WEBCODESK_ISSUE_TRACKER);
          }
        },
        {
          label: 'User Guide',
          click() {
            shell.openExternal(constants.URL_WEBCODESK_USER_GUIDE);
          }
        }
      ]
    }
  ];

  if (options) {
    const {userProfile, isProjectOpen} = options;
    if (userProfile) {
      mainMenuTemplate[0].submenu[0].label = `Sign Out ${userProfile.userName}`;
      mainMenuTemplate[0].submenu[0].click = () => {
        sendMainWindowMessage(appWindowMessages.SHOW_SIGN_OUT_DIALOG);
      };
    } else {
      mainMenuTemplate[0].submenu[0].label = `Sign In`;
      mainMenuTemplate[0].submenu[0].click = () => {
        sendMainWindowMessage(appWindowMessages.SHOW_SIGN_IN_DIALOG);
      };
    }
    mainMenuTemplate[0].submenu[2].enabled = !!isProjectOpen;
  }

  // Mac OS specifics for the first menu item:
  // it is always will be the application name and should have standard item roles
  if (process.platform === 'darwin') {
    mainMenuTemplate.unshift({
      label: app.getName(),
      submenu: [
        {role: 'quit'}
      ]
    });
  } else {
    // File menu
    mainMenuTemplate[0].submenu.push({type: 'separator'});
    mainMenuTemplate[0].submenu.push({role: 'quit'},);
  }

  return Menu.buildFromTemplate(mainMenuTemplate);

}

function createPopupMenu(menuType, options, sendMainWindowMessage) {
  const resourcePopupMenuTemplate = [];
  if (menuType === constants.CONTEXT_MENU_FOR_RESOURCE_OBJECT) {
    if (options) {
      const {resourceModel, virtualPath} = options;
      if (resourceModel) {
        const {type, props: {resourceType, isDisabled}} = resourceModel;
        if (resourceType === constants.RESOURCE_IN_PAGES_TYPE) {
          if (type === constants.GRAPH_MODEL_DIR_TYPE
            || type === constants.GRAPH_MODEL_FILE_TYPE
            || type === constants.GRAPH_MODEL_PAGES_ROOT_TYPE
            || type === constants.GRAPH_MODEL_PAGE_TYPE) {
            resourcePopupMenuTemplate.push({
              label: 'New page',
              click: () => {
                sendMainWindowMessage(appWindowMessages.CONTEXT_MENU_CREATE_NEW_PAGE, {
                  resourceModel,
                  virtualPath,
                });
              },
            });
          }
          if (type === constants.GRAPH_MODEL_FILE_TYPE
            || type === constants.GRAPH_MODEL_PAGE_TYPE) {
            resourcePopupMenuTemplate.push({
              label: 'Copy page',
              click: () => {
                sendMainWindowMessage(appWindowMessages.CONTEXT_MENU_COPY_PAGE, {
                  resourceModel,
                  virtualPath,
                });
              },
            });
            // resourcePopupMenuTemplate.push({
            //   label: 'Edit page',
            //   click: () => {
            //     sendMainWindowMessage(appWindowMessages.CONTEXT_MENU_EDIT_PAGE, {
            //       resourceModel,
            //     });
            //   },
            // });
            resourcePopupMenuTemplate.push({type: 'separator'});
            resourcePopupMenuTemplate.push({
              label: 'Delete page',
              click: () => {
                sendMainWindowMessage(appWindowMessages.CONTEXT_MENU_REMOVE_PAGE, {
                  resourceModel,
                  virtualPath,
                });
              },
            });
          }
        } else if (resourceType === constants.RESOURCE_IN_FLOWS_TYPE) {
          if (type === constants.GRAPH_MODEL_FLOWS_ROOT_TYPE
            || type === constants.GRAPH_MODEL_DIR_TYPE
            || type === constants.GRAPH_MODEL_FILE_TYPE
            || type === constants.GRAPH_MODEL_FLOW_TYPE) {
            resourcePopupMenuTemplate.push({
              label: 'New flow',
              click: () => {
                sendMainWindowMessage(appWindowMessages.CONTEXT_MENU_CREATE_NEW_FLOW, {
                  resourceModel,
                  virtualPath,
                });
              },
            });
          }
          if (type === constants.GRAPH_MODEL_FILE_TYPE
            || type === constants.GRAPH_MODEL_FLOW_TYPE) {
            resourcePopupMenuTemplate.push({
              label: 'Copy flow',
              click: () => {
                sendMainWindowMessage(appWindowMessages.CONTEXT_MENU_COPY_FLOW, {
                  resourceModel,
                  virtualPath,
                });
              },
            });
            resourcePopupMenuTemplate.push({type: 'separator'});
            if (isDisabled) {
              resourcePopupMenuTemplate.push({
                label: 'Enable flow',
                click: () => {
                  sendMainWindowMessage(appWindowMessages.CONTEXT_MENU_ENABLE_FLOW, {
                    resourceModel,
                    virtualPath,
                  });
                },
              });
            } else {
              resourcePopupMenuTemplate.push({
                label: 'Disable flow',
                click: () => {
                  sendMainWindowMessage(appWindowMessages.CONTEXT_MENU_DISABLE_FLOW, {
                    resourceModel,
                    virtualPath,
                  });
                },
              });
            }
            // resourcePopupMenuTemplate.push({
            //   label: 'Edit flow',
            //   click: () => {
            //     sendMainWindowMessage(appWindowMessages.CONTEXT_MENU_EDIT_FLOW, {
            //       resourceModel,
            //     });
            //   },
            // });
            resourcePopupMenuTemplate.push({type: 'separator'});
            resourcePopupMenuTemplate.push({
              label: 'Delete flow',
              click: () => {
                sendMainWindowMessage(appWindowMessages.CONTEXT_MENU_REMOVE_FLOW, {
                  resourceModel,
                  virtualPath,
                });
              },
            });
          }
        } else if (resourceType === constants.RESOURCE_IN_USER_FUNCTIONS_TYPE) {
          if (type === constants.GRAPH_MODEL_USER_FUNCTIONS_ROOT_TYPE
            || type === constants.GRAPH_MODEL_DIR_TYPE
            || type === constants.GRAPH_MODEL_FILE_TYPE
            || type === constants.GRAPH_MODEL_USER_FUNCTION_TYPE) {
            resourcePopupMenuTemplate.push({
              label: 'Scaffold new functions',
              click: () => {
                sendMainWindowMessage(appWindowMessages.CONTEXT_MENU_CREATE_NEW_USER_FUNCTION, {
                  resourceModel,
                  virtualPath,
                });
              },
            });
          }
        } else if (resourceType === constants.RESOURCE_IN_COMPONENTS_TYPE) {
          if (type === constants.GRAPH_MODEL_COMPONENTS_ROOT_TYPE
            || type === constants.GRAPH_MODEL_DIR_TYPE
            || type === constants.GRAPH_MODEL_FILE_TYPE
            || type === constants.GRAPH_MODEL_COMPONENT_TYPE) {
            resourcePopupMenuTemplate.push({
              label: 'Scaffold new component',
              click: () => {
                sendMainWindowMessage(appWindowMessages.CONTEXT_MENU_CREATE_NEW_COMPONENT, {
                  resourceModel,
                  virtualPath,
                });
              },
            });
          }
        }
      }
    }
  }
  return Menu.buildFromTemplate(resourcePopupMenuTemplate);
}

module.exports = {
  createMainMenu,
  createPopupMenu,
};
