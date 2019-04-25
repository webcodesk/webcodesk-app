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
                        name: 'showSyslog',
                        targets: [
                          {
                            type: 'userFunction',
                            props: {
                              functionName: 'usr.api.mainWindowMessageMethods.getSyslog',
                            },
                            events: [
                              {
                                name: 'isOpen',
                                targets: [
                                  {
                                    type: 'component',
                                    props: {
                                      componentName: 'usr.components.dialogs.SyslogDialog.SyslogDialog',
                                      componentInstance: 'syslogDialog1',
                                      propertyName: 'isOpen',
                                    },
                                    events: [
                                      {
                                        name: 'onClose',
                                        targets: [
                                          {
                                            type: 'component',
                                            props: {
                                              componentName: 'usr.components.dialogs.SyslogDialog.SyslogDialog',
                                              componentInstance: 'syslogDialog1',
                                              propertyName: 'isOpen',
                                            },
                                          }
                                        ]
                                      }
                                    ]
                                  }
                                ]
                              },
                              {
                                name: 'sysLog',
                                targets: [
                                  {
                                    type: 'component',
                                    props: {
                                      componentName: 'usr.components.dialogs.SyslogDialog.SyslogDialog',
                                      componentInstance: 'syslogDialog1',
                                      propertyName: 'sysLog',
                                    },
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