export default [
  {
    type: 'component',
    props: {
      componentName: 'usr.components.layouts.StarterLayout.StarterLayout',
      componentInstance: 'starterLayout1',
    },
    events: [
      {
        name: 'onOpenExistingProject',
        targets: [
          {
            type: 'userFunction',
            props: {
              functionName: 'usr.api.starterLayoutMethods.selectDirPathInDialog',
            },
            events: [
              {
                name: 'selectedDirData',
                targets: [
                  {
                    type: 'component',
                    props: {
                      forwardPath: 'project',
                    },
                    events: [
                      {
                        name: 'queryParams',
                        targets: [
                          {
                            type: 'component',
                            props: {
                              populatePath: 'project',
                              componentName: 'usr.components.layouts.ProjectLayout.ProjectLayout',
                              componentInstance: 'projectLayout1',
                              propertyName: 'selectedDirData'
                            },
                          }
                        ]
                      }
                    ]
                  },
                ]
              },
              {
                name: 'error',
                targets: [
                  {
                    type: 'userFunction',
                    props: {
                      functionName: 'usr.api.appInitializationMethods.showErrorNotification'
                    },
                    events: [
                      {
                        name: 'notification',
                        targets: [
                          {
                            type: 'component',
                            props: {
                              componentName: 'usr.components.layouts.StarterLayout.StarterLayout',
                              componentInstance: 'starterLayout1',
                              propertyName: 'notification'
                            }
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
  }
];