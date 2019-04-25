export default [
  {
    type: 'component',
    props: {
      componentName: 'usr.components.layouts.StarterLayout.StarterLayout',
      componentInstance: 'starterLayout1',
    },
    events: [
      {
        name: 'onCreateNewProject',
        targets: [
          {
            type: 'component',
            props: {
              forwardPath: 'new_project',
            },
            events: [
              {
                name: 'queryParams',
                targets: [
                  {
                    type: 'component',
                    props: {
                      populatePath: 'new_project',
                      componentName: 'usr.components.layouts.NewProjectWizard.NewProjectWizard',
                      componentInstance: 'newProjectWizard1',
                      propertyName: 'data',
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
];