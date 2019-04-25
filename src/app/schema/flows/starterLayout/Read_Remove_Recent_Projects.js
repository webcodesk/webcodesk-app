export default [
  {
    type: 'component',
    props: {
      componentName: 'usr.components.layouts.StarterLayout.StarterLayout',
      componentInstance: 'starterLayout1',
    },
    events: [
      {
        name: 'onReadRecentProjects',
        targets: [
          {
            type: 'userFunction',
            props: {
              functionName: 'usr.api.appInitializationMethods.readRecentProjects'
            },
            events: [
              {
                name: 'recentProjects',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.layouts.StarterLayout.StarterLayout',
                      componentInstance: 'starterLayout1',
                      propertyName: 'recentProjects',
                    }
                  }
                ]
              }
            ]
          },
        ]
      },
      {
        name: 'onRemoveRecentItem',
        targets: [
          {
            type: 'userFunction',
            props: {
              functionName: 'usr.api.appInitializationMethods.removeRecentProject'
            },
            events: [
              {
                name: 'recentProjects',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.layouts.StarterLayout.StarterLayout',
                      componentInstance: 'starterLayout1',
                      propertyName: 'recentProjects',
                    }
                  }
                ]
              }
            ]
          },
        ]
      }
    ]
  }
];
