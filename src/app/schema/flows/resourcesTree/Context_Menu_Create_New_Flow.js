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
                        name: 'createNewFlow',
                        targets: [
                          {
                            type: 'userFunction',
                            props: {
                              functionName: 'usr.api.resourcesTreeViewMethods.createNewFlowStart',
                            },
                            events: [
                              {
                                name: 'isDialogOpen',
                                targets: [
                                  {
                                    type: 'component',
                                    props: {
                                      componentName: 'usr.components.dialogs.NewFlowDialog.NewFlowDialog',
                                      componentInstance: 'newFlowDialog1',
                                      propertyName: 'isOpen'
                                    },
                                    events: [
                                      {
                                        name: 'onClose',
                                        targets: [
                                          {
                                            type: 'component',
                                            props: {
                                              componentName: 'usr.components.dialogs.NewFlowDialog.NewFlowDialog',
                                              componentInstance: 'newFlowDialog1',
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
                                name: 'dirPath',
                                targets: [
                                  {
                                    type: 'component',
                                    props: {
                                      componentName: 'usr.components.dialogs.NewFlowDialog.NewFlowDialog',
                                      componentInstance: 'newFlowDialog1',
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