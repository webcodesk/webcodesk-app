export default [
  {
    type: 'component',
    props: {
      componentName: 'usr.components.dialogs.SignInDialog.SignInDialog',
      componentInstance: 'signInDialog1',
    },
    events: [
      {
        name: 'onSubmit',
        targets: [
          {
            type: 'userFunction',
            props: {
              functionName: 'usr.api.signInOutMethods.signIn'
            },
            events: [
              {
                name: 'isLoading',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.dialogs.SignInDialog.SignInDialog',
                      componentInstance: 'signInDialog1',
                      propertyName: 'isLoading'
                    },
                  }
                ]
              },
              {
                name: 'isOpen',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.dialogs.SignInDialog.SignInDialog',
                      componentInstance: 'signInDialog1',
                      propertyName: 'isOpen'
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
                      componentName: 'usr.components.dialogs.SignInDialog.SignInDialog',
                      componentInstance: 'signInDialog1',
                      propertyName: 'error'
                    },
                  }
                ]
              },
            ]
          },
        ]
      },
    ]
  }
];
