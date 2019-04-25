export default [
  {
    type: 'component',
    props: {
      componentName: 'applicationStartWrapper',
      componentInstance: 'wrapperInstance',
    },
    events: [
      {
        name: 'onApplicationStart',
        targets: [
          {
            type: 'userFunction',
            props: {
              functionName: 'usr.api.appInitializationMethods.initApplication'
            },
            events: [
              {
                name: 'mainWindowMessage',
                targets: [
                  {
                    type: 'userFunction',
                    props: {
                      functionName: 'usr.api.mainWindowMessageMethods.processMainWindowMessage',
                    },
                    events: [
                      {
                        name: 'copyPage',
                        targets: [
                          {
                            type: 'userFunction',
                            props: {
                              functionName: 'usr.api.resourcesTreeViewMethods.copyPageStart',
                            },
                            events: [
                              {
                                name: 'isDialogOpen',
                                targets: [
                                  {
                                    type: 'component',
                                    props: {
                                      componentName: 'usr.components.dialogs.CopyPageDialog.CopyPageDialog',
                                      componentInstance: 'copyPageDialog1',
                                      propertyName: 'isOpen'
                                    },
                                    events: [
                                      {
                                        name: 'onClose',
                                        targets: [
                                          {
                                            type: 'component',
                                            props: {
                                              componentName: 'usr.components.dialogs.CopyPageDialog.CopyPageDialog',
                                              componentInstance: 'copyPageDialog1',
                                              propertyName: 'isOpen'
                                            }
                                          },
                                        ]
                                      },
                                    ]
                                  }
                                ]
                              },
                              {
                                name: 'resource',
                                targets: [
                                  {
                                    type: 'component',
                                    props: {
                                      componentName: 'usr.components.dialogs.CopyPageDialog.CopyPageDialog',
                                      componentInstance: 'copyPageDialog1',
                                      propertyName: 'pageResource'
                                    },
                                  }
                                ]
                              },
                              {
                                name: 'dirPath',
                                targets: [
                                  {
                                    type: 'component',
                                    props: {
                                      componentName: 'usr.components.dialogs.CopyPageDialog.CopyPageDialog',
                                      componentInstance: 'copyPageDialog1',
                                      propertyName: 'dirPath'
                                    },
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
        ]
      }
    ]
  }
]