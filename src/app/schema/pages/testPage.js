export default {
  type: '_div',
  props: {
    style: {
      position: 'absolute',
      top: 0,
      right: 0,
      left: 0,
      bottom: 0,
      padding: '2em'
      // display: 'flex',
      // alignItems: 'center',
      // justifyContent: 'center',
    }
  },
  children: [
    // {
    //   type: '_div',
    //   props: {
    //     style: {
    //       width: '100%',
    //       height: '100%'
    //     }
    //   },
    //   children: [
    //     {
    //       type: 'usr.components.test.DiagramTestFrame.DiagramTestFrame',
    //       instance: 'diagramTestFrame1',
    //       props: {
    //         isOpen: true,
    //       }
    //     }
    //   ]
    // }
    {
      type: 'usr.components.dialogs.InstallPackageDialog.InstallPackageDialog',
      instance: 'installPackageDialog1',
      props: {
        isOpen: true
      }
    }
  ]
};
