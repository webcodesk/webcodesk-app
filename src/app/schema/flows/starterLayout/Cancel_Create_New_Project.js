export default [
  {
    type: 'component',
    props: {
      componentName: 'usr.components.layouts.NewProjectWizard.NewProjectWizard',
      componentInstance: 'newProjectWizard1',
    },
    events: [
      {
        name: 'onClose',
        targets: [
          {
            type: 'component',
            props: {
              forwardPath: 'home',
            },
          }
        ]
      }
    ]
  }
];