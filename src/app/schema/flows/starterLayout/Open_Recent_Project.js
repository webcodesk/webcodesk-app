export default [
  {
    type: 'component',
    props: {
      componentName: 'usr.components.layouts.StarterLayout.StarterLayout',
      componentInstance: 'starterLayout1',
    },
    events: [
      {
        name: 'onOpenRecentProject',
        targets: [
          {
            type: 'component',
            props: {
              forwardPath: 'project',
            },
            events: [
              {
                name: 'queryParams',
                targets: [
                  {
                    type: 'component',
                    props: {
                      populatePath: 'project',
                      componentName: 'usr.components.layouts.ProjectLayout.ProjectLayout',
                      componentInstance: 'projectLayout1',
                      propertyName: 'selectedDirData'
                    },
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
