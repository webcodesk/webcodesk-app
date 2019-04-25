export default [
  {
    type: 'component',
    props: {
      componentName: 'usr.components.layouts.StarterLayout.StarterLayout',
      componentInstance: 'starterLayout1',
    },
    events: [
      {
        name: 'onMounted',
        targets: [
          {
            type: 'userFunction',
            props: {
              functionName: 'usr.api.starterLayoutMethods.getInfo'
            },
            events: [
              {
                name: 'info',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.layouts.StarterLayout.StarterLayout',
                      componentInstance: 'starterLayout1',
                      propertyName: 'info',
                    }
                  }
                ]
              },
              {
                name: 'applicationInfo',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.layouts.StarterLayout.StarterLayout',
                      componentInstance: 'starterLayout1',
                      propertyName: 'applicationInfo',
                    }
                  }
                ]
              },
              {
                name: 'showWelcomeDialog',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.dialogs.WelcomeDialog.WelcomeDialog',
                      componentInstance: 'welcomeDialog1',
                      propertyName: 'isOpen',
                    }
                  }
                ]
              }
            ]
          },
        ]
      },
      {
        name: 'onOpenSite',
        targets: [
          {
            type: 'userFunction',
            props: {
              functionName: 'usr.api.resourceEditorMethods.openUrlInExternalBrowser',
            },
          }
        ]
      },
    ]
  }
];
