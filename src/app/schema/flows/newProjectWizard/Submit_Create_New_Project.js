export default [
  {
    type: 'component',
    props: {
      componentName: 'usr.components.layouts.NewProjectWizard.NewProjectWizard',
      componentInstance: 'newProjectWizard1',
    },
    events: [
      {
        name: 'onSubmit',
        targets: [
          {
            type: 'userFunction',
            props: {
              functionName: 'usr.api.newProjectWizardMethods.createNewProjectSubmit',
            },
            events: [
              {
                name: 'installerFeedback',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.layouts.NewProjectWizard.NewProjectWizard',
                      componentInstance: 'newProjectWizard1',
                      propertyName: 'installerFeedback'
                    },
                  }
                ]
              },
              {
                name: 'creatingError',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.layouts.NewProjectWizard.NewProjectWizard',
                      componentInstance: 'newProjectWizard1',
                      propertyName: 'creatingError'
                    },
                  }
                ]
              },
              {
                name: 'newProjectDirData',
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
                              componentName: 'usr.components.layouts.ProjectLayout.ProjectLayout',
                              componentInstance: 'projectLayout1',
                              propertyName: 'selectedDirData',
                              populatePath: "project",
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
      }
    ]
  }
];