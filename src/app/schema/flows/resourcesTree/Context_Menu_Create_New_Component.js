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
                        name: 'createNewComponent',
                        targets: [
                          {
                            type: 'userFunction',
                            props: {
                              functionName: 'usr.api.resourcesTreeViewMethods.createNewComponentStart',
                            },
                            events: [
                              {
                                name: 'isDialogOpen',
                                targets: [
                                  {
                                    type: 'component',
                                    props: {
                                      componentName: 'usr.components.dialogs.ComponentScaffoldDialog.ComponentScaffoldDialog',
                                      componentInstance: 'componentScaffoldDialog1',
                                      propertyName: 'isOpen'
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
                                      componentName: 'usr.components.dialogs.ComponentScaffoldDialog.ComponentScaffoldDialog',
                                      componentInstance: 'componentScaffoldDialog1',
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