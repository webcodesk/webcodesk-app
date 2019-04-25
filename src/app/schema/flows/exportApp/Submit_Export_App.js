export default [
  {
    type: 'component',
    props: {
      componentName: 'usr.components.dialogs.ExportAppDialog.ExportAppDialog',
      componentInstance: 'exportAppDialog1',
    },
    events: [
      {
        name: 'onSubmit',
        targets: [
          {
            type: 'userFunction',
            props: {
              functionName: 'usr.api.exportAppMethods.closeDialog',
            },
            events: [
              {
                name: 'isOpen',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.dialogs.ExportAppDialog.ExportAppDialog',
                      componentInstance: 'exportAppDialog1',
                      propertyName: 'isOpen'
                    },
                  }
                ]
              }
            ]
          },
          {
            type: 'userFunction',
            props: {
              functionName: 'usr.api.exportAppMethods.exportApp',
            },
            events: [
              {
                name: 'isOpen',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.dialogs.ExportAppStatusDialog.ExportAppStatusDialog',
                      componentInstance: 'exportAppStatusDialog1',
                      propertyName: 'isOpen'
                    },
                    events: [
                      {
                        name: 'onClose',
                        targets: [
                          {
                            type: 'component',
                            props: {
                              componentName: 'usr.components.dialogs.ExportAppStatusDialog.ExportAppStatusDialog',
                              componentInstance: 'exportAppStatusDialog1',
                              propertyName: 'isOpen'
                            },
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                name: 'exportStatus',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.dialogs.ExportAppStatusDialog.ExportAppStatusDialog',
                      componentInstance: 'exportAppStatusDialog1',
                      propertyName: 'status'
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
