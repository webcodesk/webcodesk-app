export default [
  {
    type: 'component',
    props: {
      componentName: 'usr.components.dialogs.ExportAppDialog.ExportAppDialog',
      componentInstance: 'exportAppDialog1',
    },
    events: [
      {
        name: 'onBrowseDirectory',
        targets: [
          {
            type: 'userFunction',
            props: {
              functionName: 'usr.api.exportAppMethods.browseDirectory',
            },
            events: [
              {
                name: 'directoryData',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.dialogs.ExportAppDialog.ExportAppDialog',
                      componentInstance: 'exportAppDialog1',
                      propertyName: 'directoryData'
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
