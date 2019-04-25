export default [
  {
    type: 'component',
    props: {
      componentName: 'usr.components.dialogs.SignInDialog.SignInDialog',
      componentInstance: 'signInDialog1',
    },
    events: [
      {
        name: 'onCreateNewAccount',
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
