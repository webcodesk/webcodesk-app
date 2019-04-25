export default [
  {
    type: 'component',
    props: {
      componentName: 'usr.components.layouts.NewProjectWizard.NewProjectWizard',
      componentInstance: 'newProjectWizard1',
    },
    events: [
      {
        name: 'onBrowseDirectory',
        targets: [
          {
            type: 'userFunction',
            props: {
              functionName: 'usr.api.newProjectWizardMethods.browseDirectory',
            },
            events: [
              {
                name: 'directoryData',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.layouts.NewProjectWizard.NewProjectWizard',
                      componentInstance: 'newProjectWizard1',
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
];