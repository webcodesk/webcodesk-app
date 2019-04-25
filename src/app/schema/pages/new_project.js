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
      type: 'usr.components.layouts.NewProjectWizard.NewProjectWizard',
      instance: 'newProjectWizard1',
    },
    {
      type: 'usr.components.dialogs.SyslogDialog.SyslogDialog',
      instance: 'syslogDialog1'
    }
  ]
};
