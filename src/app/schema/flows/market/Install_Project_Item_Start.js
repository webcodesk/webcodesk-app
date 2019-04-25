export default [
  {
    type: 'component',
    props: {
      componentName: 'usr.components.dialogs.MarketBoardDialog.MarketBoardDialog',
      componentInstance: 'marketBoardDialog1',
    },
    events: [
      {
        name: 'onInstall',
        targets: [
          {
            type: 'userFunction',
            props: {
              functionName: 'usr.api.marketMethods.startInstallPackage',
            },
            events: [
              {
                name: 'isOpen',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.dialogs.InstallPackageDialog.InstallPackageDialog',
                      componentInstance: 'installPackageDialog1',
                      propertyName: 'isOpen'
                    },
                    events: [
                      {
                        name: 'onClose',
                        targets: [
                          {
                            type: 'component',
                            props: {
                              componentName: 'usr.components.dialogs.InstallPackageDialog.InstallPackageDialog',
                              componentInstance: 'installPackageDialog1',
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
                name: 'selectedItemData',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.dialogs.InstallPackageDialog.InstallPackageDialog',
                      componentInstance: 'installPackageDialog1',
                      propertyName: 'selectedItemData'
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
                      componentName: 'usr.components.dialogs.InstallPackageDialog.InstallPackageDialog',
                      componentInstance: 'installPackageDialog1',
                      propertyName: 'error'
                    },
                  }
                ]
              },
            ]
          }
        ]
      },
    ]
  }
]