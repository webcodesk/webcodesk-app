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
                        name: 'copyFlow',
                        targets: [
                          {
                            type: 'userFunction',
                            props: {
                              functionName: 'usr.api.resourcesTreeViewMethods.copyFlowStart',
                            },
                            events: [
                              {
                                name: 'isDialogOpen',
                                targets: [
                                  {
                                    type: 'component',
                                    props: {
                                      componentName: 'usr.components.dialogs.CopyFlowDialog.CopyFlowDialog',
                                      componentInstance: 'copyFlowDialog1',
                                      propertyName: 'isOpen'
                                    },
                                    events: [
                                      {
                                        name: 'onClose',
                                        targets: [
                                          {
                                            type: 'component',
                                            props: {
                                              componentName: 'usr.components.dialogs.CopyFlowDialog.CopyFlowDialog',
                                              componentInstance: 'copyFlowDialog1',
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
                                      componentName: 'usr.components.dialogs.CopyFlowDialog.CopyFlowDialog',
                                      componentInstance: 'copyFlowDialog1',
                                      propertyName: 'flowResource'
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
                                      componentName: 'usr.components.dialogs.CopyFlowDialog.CopyFlowDialog',
                                      componentInstance: 'copyFlowDialog1',
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