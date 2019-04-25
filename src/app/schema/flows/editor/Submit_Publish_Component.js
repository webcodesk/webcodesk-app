export default [
  {
    type: 'component',
    props: {
      componentName: 'usr.components.dialogs.PublishComponentDialog.PublishComponentDialog',
      componentInstance: 'publishComponentDialog1',
    },
    events: [
      {
        name: 'onClose',
        targets: [
          {
            type: 'userFunction',
            props: {
              functionName: 'usr.api.resourceEditorMethods.cancelPublish',
            },
            events: [
              {
                name: 'isOpen',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.dialogs.PublishComponentDialog.PublishComponentDialog',
                      componentInstance: 'publishComponentDialog1',
                      propertyName: 'isOpen'
                    }
                  }
                ]
              },
            ]
          },
        ]
      },
      {
        name: 'onSubmit',
        targets: [
          {
            type: 'userFunction',
            props: {
              functionName: 'usr.api.resourceEditorMethods.submitPublish',
            },
            events: [
              {
                name: 'isOpen',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.dialogs.PublishComponentDialog.PublishComponentDialog',
                      componentInstance: 'publishComponentDialog1',
                      propertyName: 'isOpen'
                    }
                  }
                ]
              },
              {
                name: 'isLoading',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.dialogs.PublishComponentDialog.PublishComponentDialog',
                      componentInstance: 'publishComponentDialog1',
                      propertyName: 'isLoading'
                    }
                  }
                ]
              },
              {
                name: 'success',
                targets: [
                  {
                    type: 'userFunction',
                    props: {
                      functionName: 'usr.api.appInitializationMethods.showSuccessNotification'
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
              },
              {
                name: 'error',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.dialogs.PublishComponentDialog.PublishComponentDialog',
                      componentInstance: 'publishComponentDialog1',
                      propertyName: 'error'
                    }
                  }
                ]
              },
            ]
          }
        ]
      }
    ]
  }
];
