export default [
  {
    type: 'component',
    props: {
      componentName: 'usr.components.dialogs.MarketBoardDialog.MarketBoardDialog',
      componentInstance: 'marketBoardDialog1',
    },
    events: [
      {
        name: 'onSearch',
        targets: [
          {
            type: 'userFunction',
            props: {
              functionName: 'usr.api.marketMethods.findComponents',
            },
            events: [
              {
                name: 'isLoading',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.dialogs.MarketBoardDialog.MarketBoardDialog',
                      componentInstance: 'marketBoardDialog1',
                      propertyName: 'isLoading'
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
                      componentName: 'usr.components.dialogs.MarketBoardDialog.MarketBoardDialog',
                      componentInstance: 'marketBoardDialog1',
                      propertyName: 'error'
                    },
                  }
                ]
              },
              {
                name: 'selectedProject',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.dialogs.MarketBoardDialog.MarketBoardDialog',
                      componentInstance: 'marketBoardDialog1',
                      propertyName: 'selectedProject'
                    },
                  }
                ]
              },
              {
                name: 'searchTagsList',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.dialogs.MarketBoardDialog.MarketBoardDialog',
                      componentInstance: 'marketBoardDialog1',
                      propertyName: 'searchTagsList'
                    },
                  }
                ]
              },
              {
                name: 'componentsList',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.dialogs.MarketBoardDialog.MarketBoardDialog',
                      componentInstance: 'marketBoardDialog1',
                      propertyName: 'componentsList'
                    },
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        name: 'onBackToSearch',
        targets: [
          {
            type: 'userFunction',
            props: {
              functionName: 'usr.api.marketMethods.openMarketBoard',
            },
            events: [
              {
                name: 'selectedProject',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.dialogs.MarketBoardDialog.MarketBoardDialog',
                      componentInstance: 'marketBoardDialog1',
                      propertyName: 'selectedProject'
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