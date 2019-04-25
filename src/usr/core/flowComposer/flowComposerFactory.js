import constants from '../../commons/constants';
import {
  createDefaultFlowModel,
  createFlowModelForComponent,
  createFlowModelForFunction,
  createFlowModelForPage
} from './flowModelCreators';

const DEFAULT_MODEL = 'DEFAULT_MODEL';
const COMPONENT_MODEL = 'COMPONENT_MODEL';
const USER_FUNCTION_MODEL = 'USER_FUNCTION_MODEL';
const PAGE_MODEL = 'PAGE_MODEL';

const creators = {
  [DEFAULT_MODEL]: createDefaultFlowModel,
  [COMPONENT_MODEL]: createFlowModelForComponent,
  [USER_FUNCTION_MODEL]: createFlowModelForFunction,
  [PAGE_MODEL]: createFlowModelForPage,
};

export function createDefaultModel() {

  return creators[DEFAULT_MODEL]();
}

export function createFlowModel(resourceModel, inBasket) {
  const { type, props } = resourceModel;
  if (type === constants.GRAPH_MODEL_COMPONENT_INSTANCE_TYPE ||
    type === constants.GRAPH_MODEL_FLOW_COMPONENT_INSTANCE_TYPE) {
    const { componentName, componentInstance } = props;
    if (!componentName || !componentInstance) {
      throw Error('FlowComposerFactory.createFlowModel: the dropped component misses component name, or component instance name');
    }
    return creators[COMPONENT_MODEL](resourceModel, inBasket);
  } else if (type === constants.GRAPH_MODEL_USER_FUNCTION_TYPE ||
    type === constants.GRAPH_MODEL_FLOW_USER_FUNCTION_TYPE) {
    const { functionName } = props;
    if (!functionName) {
      throw Error('FlowComposerFactory.createFlowModel: the dropped user function misses name');
    }
    return creators[USER_FUNCTION_MODEL](resourceModel, inBasket);
  } else if (type === constants.GRAPH_MODEL_PAGE_TYPE ||
    type === constants.GRAPH_MODEL_FLOW_PAGE_TYPE) {
    return creators[PAGE_MODEL](resourceModel, inBasket);
  }
  return null;
}