import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';
import FlowComposerManager from '../flowComposer/FlowComposerManager';

export function findFlowDeclarations(sourceCode) {
  const declarations = [];
  try {
    const pageJSON = JSON.parse(sourceCode);
    const { flowName, model, isDisabled } = pageJSON;
    const flowComposerManager = new FlowComposerManager(model);
    const flowDeclaration = {
      flowName,
      isDisabled,
      model,
      flowParticles: uniqWith(flowComposerManager.getFlowParticles(), isEqual),
    };
    declarations.push(flowDeclaration);
  } catch(e) {
    console.error('Parsing the flow source code: ', e);
    // do nothing...
  }
  return declarations;
}
