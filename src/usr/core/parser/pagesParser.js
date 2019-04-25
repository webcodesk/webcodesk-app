import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';
import PageComposerManager from '../pageComposer/PageComposerManager';

// function getComponentInstances(componentsTree) {
//   let instances = [];
//   if (componentsTree) {
//     const { type, instance, children } = componentsTree;
//     if (instance && instance.length > 0) {
//       instances.push({
//         componentName: type,
//         componentInstance: instance,
//       });
//     }
//     if (children && children.length > 0) {
//       children.forEach(child => {
//         instances = instances.concat(getComponentInstances(child));
//       });
//     }
//   }
//   instances = uniqWith(instances, isEqual);
//   return instances;
// }

export function findPageDeclarations(sourceCode) {
  const declarations = [];
  try {
    const pageJSON = JSON.parse(sourceCode);
    const { pageName, pagePath, componentsTree, metaData } = pageJSON;
    const pageComposerManager = new PageComposerManager(componentsTree);
    const pageDeclaration = {
      pageName,
      pagePath,
      componentsTree,
      metaData,
      componentInstances:  uniqWith(pageComposerManager.getInstancesListUniq(), isEqual),
    };
    declarations.push(pageDeclaration);
  } catch(e) {
    console.error('Parsing the page source code: ', e);
    // do nothing...
  }
  return declarations;
}
