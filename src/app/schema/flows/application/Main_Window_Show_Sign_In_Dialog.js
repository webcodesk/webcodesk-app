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
                        name: 'showSignIn',
                        targets: [
                          {
                            type: 'userFunction',
                            props: {
                              functionName: 'usr.api.signInOutMethods.startSignIn'
                            },
                            events: [
                              {
                                name: 'error',
                                targets: [
                                  {
                                    type: 'component',
                                    props: {
                                      componentName: 'usr.components.dialogs.SignInDialog.SignInDialog',
                                      componentInstance: 'signInDialog1',
                                      propertyName: 'error',
                                    }
                                  }
                                ]
                              },
                              {
                                name: 'isOpen',
                                targets: [
                                  {
                                    type: 'component',
                                    props: {
                                      componentName: 'usr.components.dialogs.SignInDialog.SignInDialog',
                                      componentInstance: 'signInDialog1',
                                      propertyName: 'isOpen',
                                    },
                                    events: [
                                      {
                                        name: 'onClose',
                                        targets: [
                                          {
                                            type: 'component',
                                            props: {
                                              componentName: 'usr.components.dialogs.SignInDialog.SignInDialog',
                                              componentInstance: 'signInDialog1',
                                              propertyName: 'isOpen',
                                            },
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
              }
            ]
          },
        ]
      }
    ]
  }
]