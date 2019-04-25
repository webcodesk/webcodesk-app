export default {
  type: 'usr.components.layouts.ProjectLayout.ProjectLayout',
  instance: 'projectLayout1',
  props: {
    leftPanel: {
      type: 'usr.components.panels.LeftContainer.LeftContainer',
      instance: 'leftContainer1',
      props: {
        topPanel: {
          type: 'usr.components.panels.LeftTopPanel.LeftTopPanel',
          instance: 'leftTopPanel1'
        },
        searchPanel: {
          type: 'usr.components.panels.SearchPanel.SearchPanel',
          instance: 'searchPanel1'
        },
        treeView: {
          type: 'usr.components.panels.ResourcesTreeView.ResourcesTreeView',
          instance: 'resourcesTreeView1'
        },
      }
    },
    centralPanel: {
      type: 'usr.components.editor.ResourceEditor.ResourceEditor',
      instance: 'resourceEditor1'
    }
  },
  children: [
    {
      type: 'usr.components.dialogs.NewFlowDialog.NewFlowDialog',
      instance: 'newFlowDialog1'
    },
    {
      type: 'usr.components.dialogs.CopyFlowDialog.CopyFlowDialog',
      instance: 'copyFlowDialog1'
    },
    {
      type: 'usr.components.dialogs.NewPageDialog.NewPageDialog',
      instance: 'newPageDialog1'
    },
    {
      type: 'usr.components.dialogs.CopyPageDialog.CopyPageDialog',
      instance: 'copyPageDialog1'
    },
    {
      type: 'usr.components.dialogs.DeletePageDialog.DeletePageDialog',
      instance: 'deletePageDialog1'
    },
    {
      type: 'usr.components.dialogs.DeleteFlowDialog.DeleteFlowDialog',
      instance: 'deleteFlowDialog1'
    },
    {
      type: 'usr.components.dialogs.ExportAppDialog.ExportAppDialog',
      instance: 'exportAppDialog1'
    },
    {
      type: 'usr.components.dialogs.ExportAppStatusDialog.ExportAppStatusDialog',
      instance: 'exportAppStatusDialog1'
    },
    {
      type: 'usr.components.dialogs.ProjectServerDialog.ProjectServerDialog',
      instance: 'projectServerDialog1'
    },
    {
      type: 'usr.components.dialogs.SyslogDialog.SyslogDialog',
      instance: 'syslogDialog1'
    },
    {
      type: 'usr.components.dialogs.ComponentScaffoldDialog.ComponentScaffoldDialog',
      instance: 'componentScaffoldDialog1'
    },
    {
      type: 'usr.components.dialogs.FunctionsScaffoldDialog.FunctionsScaffoldDialog',
      instance: 'functionsScaffoldDialog1'
    },
    {
      type: 'usr.components.dialogs.SignInDialog.SignInDialog',
      instance: 'signInDialog1'
    },
    {
      type: 'usr.components.dialogs.SignInDialog.SignInDialog',
      instance: 'signInDialog2'
    },
    {
      type: 'usr.components.dialogs.PublishComponentDialog.PublishComponentDialog',
      instance: 'publishComponentDialog1'
    },
    {
      type: 'usr.components.dialogs.PublishFunctionsDialog.PublishFunctionsDialog',
      instance: 'publishFunctionsDialog1'
    },
    {
      type: 'usr.components.dialogs.MarketBoardDialog.MarketBoardDialog',
      instance: 'marketBoardDialog1'
    },
    {
      type: 'usr.components.dialogs.InstallPackageDialog.InstallPackageDialog',
      instance: 'installPackageDialog1'
    }
  ]
};
