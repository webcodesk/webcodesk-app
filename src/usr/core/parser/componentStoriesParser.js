import { getSourceAst } from '../utils/babelParser';
import { traverse } from '../utils/astUtils';

const getStoriesDeclarations = (ast) => {
  const storiesDeclarations = [];
  let checkDeclarationsCount = 0;
  traverse(ast, node => {
    if (node.type === 'ExportDefaultDeclaration') {
      const { declaration } = node;
      if (declaration) {
        const { type: declarationType, elements: declarationElements } = declaration;
        if (declarationType === 'ArrayExpression' && declarationElements && declarationElements.length > 0) {
          checkDeclarationsCount = declarationElements.length;
          // array of the stories declaration
          declarationElements.forEach(declarationElement => {
            const { type: declarationElementType, properties: declarationElementProperties } = declarationElement;
            if (declarationElementType === 'ObjectExpression'
              && declarationElementProperties
              && declarationElementProperties.length > 0) {
              let isStoryPropertySet = false;
              let isRenderStoryPropertySet = false;
              let storyName = null;
              declarationElementProperties.forEach(declarationElementProperty => {
                const { type: propertyType, key: propertyKey, value: propertyValue } = declarationElementProperty;
                if (propertyType === 'ObjectProperty' && propertyKey && propertyValue) {
                  if (propertyKey.type === 'Identifier') {
                    if (propertyValue.type === 'StringLiteral' && propertyKey.name === 'story') {
                      // here we have story attribute declared
                      storyName = propertyValue.value;
                      isStoryPropertySet = true;
                    } else if (propertyValue.type === 'ArrowFunctionExpression' && propertyKey.name === 'renderStory') {
                      isRenderStoryPropertySet = true;
                    }
                  }
                }
              });
              if (isStoryPropertySet && isRenderStoryPropertySet && storyName) {
                storiesDeclarations.push(storyName);
              }
            }
          });
        }
      }
    }
  });
  return checkDeclarationsCount === storiesDeclarations.length ? storiesDeclarations : [];
};

export const findComponentStoryDeclarations = (sourceCode) => {
  // const ast = getSourceAst(sourceCode);
  // console.info('AST: ', JSON.stringify(ast, null, 4));
  return getStoriesDeclarations(getSourceAst(sourceCode));
};