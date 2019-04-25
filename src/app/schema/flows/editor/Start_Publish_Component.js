export default [
  {
    type: 'component',
    props: {
      componentName: 'usr.components.editor.ResourceEditor.ResourceEditor',
      componentInstance: 'resourceEditor1',
    },
    events: [
      {
        name: 'onPublish',
        targets: [
          {
            type: 'userFunction',
            props: {
              functionName: 'usr.api.resourceEditorMethods.checkAuthForPublish',
            },
            events: [
              {
                name: 'isOpen',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.dialogs.SignInDialog.SignInDialog',
                      componentInstance: 'signInDialog2',
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
                              componentInstance: 'signInDialog2',
                              propertyName: 'isOpen',
                            },
                          }
                        ]
                      },
                      {
                        name: 'onCreateNewAccount',
                        targets: [
                          {
                            type: 'userFunction',
                            props: {
                              functionName: 'usr.api.resourceEditorMethods.openUrlInExternalBrowser',
                            },
                          }
                        ]
                      },
                      {
                        name: 'onSubmit',
                        targets: [
                          {
                            type: 'userFunction',
                            props: {
                              functionName: 'usr.api.signInOutMethods.signIn'
                            },
                            events: [
                              {
                                name: 'isLoading',
                                targets: [
                                  {
                                    type: 'component',
                                    props: {
                                      componentName: 'usr.components.dialogs.SignInDialog.SignInDialog',
                                      componentInstance: 'signInDialog2',
                                      propertyName: 'isLoading'
                                    },
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
                                      componentInstance: 'signInDialog2',
                                      propertyName: 'isOpen'
                                    },
                                  }
                                ]
                              },
                              {
                                name: 'error',
                                targets: [
                                  {
                                    type: 'component',
                                    props: {
                                      componentName: 'usr.components.dialogs.SignInDialog.SignInDialog',
                                      componentInstance: 'signInDialog2',
                                      propertyName: 'error'
                                    },
                                  }
                                ]
                              },
                              {
                                name: 'success',
                                targets: [
                                  {
                                    type: 'userFunction',
                                    props: {
                                      functionName: 'usr.api.resourceEditorMethods.checkAuthForPublish',
                                    },
                                    events: [
                                      {
                                        name: 'success',
                                        targets: [
                                          {
                                            type: 'userFunction',
                                            props: {
                                              functionName: 'usr.api.resourceEditorMethods.startPublish',
                                            },
                                            events: [
                                              {
                                                name: 'isOpenComponentDialog',
                                                targets: [
                                                  {
                                                    type: 'component',
                                                    props: {
                                                      componentName: 'usr.components.dialogs.PublishComponentDialog.PublishComponentDialog',
                                                      componentInstance: 'publishComponentDialog1',
                                                      propertyName: 'isOpen'
                                                    },
                                                  }
                                                ]
                                              },
                                              {
                                                name: 'dataComponentDialog',
                                                targets: [
                                                  {
                                                    type: 'component',
                                                    props: {
                                                      componentName: 'usr.components.dialogs.PublishComponentDialog.PublishComponentDialog',
                                                      componentInstance: 'publishComponentDialog1',
                                                      propertyName: 'data'
                                                    },
                                                  }
                                                ]
                                              },
                                              {
                                                name: 'isOpenFunctionsDialog',
                                                targets: [
                                                  {
                                                    type: 'component',
                                                    props: {
                                                      componentName: 'usr.components.dialogs.PublishFunctionsDialog.PublishFunctionsDialog',
                                                      componentInstance: 'publishFunctionsDialog1',
                                                      propertyName: 'isOpen'
                                                    },
                                                  }
                                                ]
                                              },
                                              {
                                                name: 'dataFunctionsDialog',
                                                targets: [
                                                  {
                                                    type: 'component',
                                                    props: {
                                                      componentName: 'usr.components.dialogs.PublishFunctionsDialog.PublishFunctionsDialog',
                                                      componentInstance: 'publishFunctionsDialog1',
                                                      propertyName: 'data'
                                                    },
                                                  }
                                                ]
                                              },
                                              {
                                                name: 'caughtException',
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
                                                              componentName: 'usr.components.layouts.ProjectLayout.ProjectLayout',
                                                              componentInstance: 'projectLayout1',
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
                                ]
                              }
                            ]
                          },
                        ]
                      },
                    ]
                  }
                ]
              },
              {
                name: 'success',
                targets: [
                  {
                    type: 'userFunction',
                    props: {
                      functionName: 'usr.api.resourceEditorMethods.startPublish',
                    },
                    events: [
                      {
                        name: 'isOpenComponentDialog',
                        targets: [
                          {
                            type: 'component',
                            props: {
                              componentName: 'usr.components.dialogs.PublishComponentDialog.PublishComponentDialog',
                              componentInstance: 'publishComponentDialog1',
                              propertyName: 'isOpen'
                            },
                          }
                        ]
                      },
                      {
                        name: 'dataComponentDialog',
                        targets: [
                          {
                            type: 'component',
                            props: {
                              componentName: 'usr.components.dialogs.PublishComponentDialog.PublishComponentDialog',
                              componentInstance: 'publishComponentDialog1',
                              propertyName: 'data'
                            },
                          }
                        ]
                      },
                      {
                        name: 'isOpenFunctionsDialog',
                        targets: [
                          {
                            type: 'component',
                            props: {
                              componentName: 'usr.components.dialogs.PublishFunctionsDialog.PublishFunctionsDialog',
                              componentInstance: 'publishFunctionsDialog1',
                              propertyName: 'isOpen'
                            },
                          }
                        ]
                      },
                      {
                        name: 'dataFunctionsDialog',
                        targets: [
                          {
                            type: 'component',
                            props: {
                              componentName: 'usr.components.dialogs.PublishFunctionsDialog.PublishFunctionsDialog',
                              componentInstance: 'publishFunctionsDialog1',
                              propertyName: 'data'
                            },
                          }
                        ]
                      },
                      {
                        name: 'caughtException',
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
                                      componentName: 'usr.components.layouts.ProjectLayout.ProjectLayout',
                                      componentInstance: 'projectLayout1',
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
        ]
      }
    ]
  }
];