export default {
  type: '_div',
  props: {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }
  },
  children: [
    {
      type: 'usr.components.layouts.StarterLayout.StarterLayout',
      instance: 'starterLayout1',
    },
    {
      type: 'usr.components.dialogs.SyslogDialog.SyslogDialog',
      instance: 'syslogDialog1'
    },
    {
      type: 'usr.components.dialogs.WelcomeDialog.WelcomeDialog',
      instance: 'welcomeDialog1'
    },
    {
      type: 'usr.components.dialogs.SignInDialog.SignInDialog',
      instance: 'signInDialog1'
    },
  ]
};
