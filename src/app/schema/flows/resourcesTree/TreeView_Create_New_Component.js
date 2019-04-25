export default [
  {
    type: 'component',
    props: {
      componentName: 'usr.components.panels.ResourcesTreeView.ResourcesTreeView',
      componentInstance: 'resourcesTreeView1',
    },
    events: [
      {
        name: 'onCreateComponent',
        targets: [
          {
            type: 'userFunction',
            props: {
              functionName: 'usr.api.resourcesTreeViewMethods.createNewComponentStart',
            },
            events: [
              {
                name: 'isDialogOpen',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.dialogs.ComponentScaffoldDialog.ComponentScaffoldDialog',
                      componentInstance: 'componentScaffoldDialog1',
                      propertyName: 'isOpen'
                    },
                    events: [
                      {
                        name: 'onClose',
                        targets: [
                          {
                            type: 'component',
                            props: {
                              componentName: 'usr.components.dialogs.ComponentScaffoldDialog.ComponentScaffoldDialog',
                              componentInstance: 'componentScaffoldDialog1',
                              propertyName: 'isOpen'
                            }
                          },
                        ]
                      },
                      {
                        name: 'onOpenMarket',
                        targets: [
                          {
                            type: 'userFunction',
                            props: {
                              functionName: 'usr.api.resourcesTreeViewMethods.openMarket',
                            },
                            events: [
                              {
                                name: 'isOpen',
                                targets: [
                                  {
                                    type: 'component',
                                    props: {
                                      componentName: 'usr.components.dialogs.MarketBoardDialog.MarketBoardDialog',
                                      componentInstance: 'marketBoardDialog1',
                                      propertyName: 'isOpen'
                                    },
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
                name: 'dirPath',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.dialogs.ComponentScaffoldDialog.ComponentScaffoldDialog',
                      componentInstance: 'componentScaffoldDialog1',
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