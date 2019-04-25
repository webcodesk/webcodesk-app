export default [
  {
    type: 'component',
    props: {
      componentName: 'usr.components.editor.ResourceEditor.ResourceEditor',
      componentInstance: 'resourceEditor1',
    },
    events: [
      {
        name: 'onExportApp',
        targets: [
          {
            type: 'userFunction',
            props: {
              functionName: 'usr.api.exportAppMethods.startExportApp',
            },
            events: [
              {
                name: 'exportAppHelpers',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.dialogs.ExportAppDialog.ExportAppDialog',
                      componentInstance: 'exportAppDialog1',
                      propertyName: 'helpers'
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
                      componentName: 'usr.components.dialogs.ExportAppDialog.ExportAppDialog',
                      componentInstance: 'exportAppDialog1',
                      propertyName: 'isOpen'
                    },
                    events: [
                      {
                        name: 'onClose',
                        targets: [
                          {
                            type: 'component',
                            props: {
                              componentName: 'usr.components.dialogs.ExportAppDialog.ExportAppDialog',
                              componentInstance: 'exportAppDialog1',
                              propertyName: 'isOpen'
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
