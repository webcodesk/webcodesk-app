import { getSourceAst } from '../utils/babelParser';
import { traverse } from '../utils/astUtils';
import constants from '../../commons/constants';

// const getCommentBlocks = (ast) => {
//   if (!ast) {
//     return [];
//   }
//   const result = [];
//   traverse(ast, node => {
//     if (node.type === 'CommentBlock' && node.value) {
//       const { loc: {start: {line: startLine}, end: {line: endLine}} } = node;
//       result.push({
//         value: node.value,
//         startLine,
//         endLine
//       })
//     }
//   });
//   return result;
// };

const getPropTypesListByObjectProperties = (propTypesProperties) => {
  const result = [];
  if (propTypesProperties && propTypesProperties.length > 0) {
    let propTypesDeclaration;
    propTypesProperties.forEach(propTypesProperty => {
      // parse each property in the propTypes declaration
      const {type: propertyType, key: propertyKey, value: propertyValue, leadingComments} = propTypesProperty;
      if (propertyType === 'ObjectProperty' && propertyKey && propertyKey.type === 'Identifier') {
        propTypesDeclaration = {
          name: propertyKey.name,
        };
        // get comments
        if (leadingComments && leadingComments.length > 0) {
          propTypesDeclaration.comments = leadingComments.map(comment => comment.value);
        }
        if (propertyValue) {
          // property should have the PropTypes value
          const {
            type: propertyValueType,
            object: propertyValueObject,
            property: propertyValueProperty
          } = propertyValue;
          if (propertyValueType === 'MemberExpression') {
            if (propertyValueObject
              && propertyValueObject.type === 'Identifier'
              && propertyValueObject.name === 'PropTypes'
              && propertyValueProperty
              && propertyValueProperty.type === 'Identifier') {
              // not required property
              if (propertyValueProperty.name === 'func') {
                propTypesDeclaration.type = constants.GRAPH_MODEL_COMPONENT_PROPERTY_FUNCTION_TYPE;
              } else if (propertyValueProperty.name === 'element') {
                propTypesDeclaration.type = constants.GRAPH_MODEL_COMPONENT_PROPERTY_ELEMENT_TYPE;
              } else {
                propTypesDeclaration.type = constants.GRAPH_MODEL_COMPONENT_PROPERTY_OBJECT_TYPE;
              }
            } else if (propertyValueObject
              && propertyValueObject.type === 'MemberExpression') {
              const {
                object: propertyValueMemberExpressionObject,
                property: propertyValueMemberExpressionProperty
              } = propertyValueObject;
              if (propertyValueMemberExpressionObject
                && propertyValueMemberExpressionObject.type === 'Identifier'
                && propertyValueMemberExpressionObject.name === 'PropTypes') {
                if (propertyValueMemberExpressionProperty
                  && propertyValueMemberExpressionProperty.type === 'Identifier') {
                  // is required property
                  if (propertyValueProperty.name === 'func') {
                    propTypesDeclaration.type = constants.GRAPH_MODEL_COMPONENT_PROPERTY_FUNCTION_TYPE;
                  } else if (propertyValueProperty.name === 'element') {
                    propTypesDeclaration.type = constants.GRAPH_MODEL_COMPONENT_PROPERTY_ELEMENT_TYPE;
                  } else {
                    propTypesDeclaration.type = constants.GRAPH_MODEL_COMPONENT_PROPERTY_OBJECT_TYPE;
                  }
                }
              }
            }
          } else if (propertyValueType === 'CallExpression') {
            // probably we have a shape or arrayOf type of the property
            // do not dive into such compositions, just take it as an object property
            propTypesDeclaration.type = constants.GRAPH_MODEL_COMPONENT_PROPERTY_OBJECT_TYPE;
          }
        }
      }
      result.push(propTypesDeclaration);
    });
  }
  return result;
};

const getPropTypesOutOfBody = (ast, classDeclarationName) => {
  if (!ast) {
    return [];
  }
  let result = [];
  traverse(ast, node => {
    if (node.type === 'ExpressionStatement' && node.expression && node.expression.type === 'AssignmentExpression') {
      const { expression: {left, right} } = node;
      if (left) {
        const { type: leftType, object: leftObject, property: leftProperty } = left;
        if (leftType === 'MemberExpression'
          && leftObject
          && leftObject.type === 'Identifier'
          && leftObject.name === classDeclarationName) {
          // here we have class member assignment, now check if it is propTypes member
          if (leftProperty
            && leftProperty.type === 'Identifier'
            && leftProperty.name === 'propTypes') {
            // this is definitely a propTypes assignment, now read the right object definition
            if (right) {
              const { type: rightType, properties: rightProperties } = right;
              if (rightType === 'ObjectExpression') {
                result = getPropTypesListByObjectProperties(rightProperties);
              }
            }
          }
        }
      }
    }
  });
  return result;
};

const getPropTypesInBody = (astNode) => {
  if (!astNode) {
    return [];
  }
  let result = [];
  const { body: classBodyContent } = astNode;
  if (classBodyContent && classBodyContent.length > 0) {
    classBodyContent.forEach(bodyItem => {
      const { type: bodyItemType, key: bodyItemKey, value: bodyItemValue } = bodyItem;
      if (bodyItemType === 'ClassProperty') {
        if (bodyItemKey && bodyItemKey.type === 'Identifier' && bodyItemKey.name === 'propTypes') {
          // here propTypes declaration should be
          if (bodyItemValue && bodyItemValue.type === 'ObjectExpression') {
            const { properties: propTypesProperties } = bodyItemValue;
            result = getPropTypesListByObjectProperties(propTypesProperties)
          }
        }
      }
    });
  }
  return result;
};

const isSuperClassReactComponent = (astNode) => {
  if (!astNode) {
    return false;
  }
  const { type: superClassType, object: superClassObject, property: superClassProperty } = astNode;
  if (superClassType === 'MemberExpression') {
    // here we may have "React.Component" class inheritance
    if (superClassObject
      && superClassObject.name === 'React'
      && superClassProperty
      && superClassProperty.name === 'Component') {
      return true;
    }
  }
};

const getClassDeclaration = (ast, componentName) => {
  const classDeclarations = {};
  let foundClassDeclaration = null;
  if (ast && ast.body && ast.body.length > 0) {
    ast.body.forEach(node => {
      // search for the class declarations
      if (node.type === 'ClassDeclaration') {
        const {
          id: classDeclarationId,
          superClass: classDeclarationSuperClass,
          body: classDeclarationBody,
          leadingComments: classDeclarationComments
        } = node;
        if (isSuperClassReactComponent(classDeclarationSuperClass)) {
          // this class is inherited from React Component
          const classDeclaration = {
            componentName: classDeclarationId.name,
            properties: getPropTypesInBody(classDeclarationBody),
          };
          // get comments
          if (classDeclarationComments && classDeclarationComments.length > 0) {
            classDeclaration.comments = classDeclarationComments.map(comment => comment.value);
          }
          // set found class declaration
          classDeclarations[classDeclaration.componentName] = classDeclaration;
        }
      }
      // search for the default export name
      if (node.type === 'ExportDefaultDeclaration') {
        // todo: should we find somehow what exactly the class name is exported as default?
        // const { declaration: defaultExportDeclaration } = node;
        // defaultExports[defaultExportDeclaration.name] = true;
        // now just set the last we found in the body
        // and with the equal name to the file name
        if (classDeclarations[componentName]) {
          foundClassDeclaration = classDeclarations[componentName];
        }
      }
    });
  }
  return foundClassDeclaration;
};

const findConstFunctionDeclaration = (ast, componentName) => {
  const functionsDeclarations = {};
  let foundDeclaration = null;

  if (ast && ast.body && ast.body.length > 0) {
    ast.body.forEach(node => {
      const { type, declarations: bodyDeclarations, leadingComments } = node;
      if (type === 'VariableDeclaration' && bodyDeclarations && bodyDeclarations.length > 0) {
        const { type: declaratorType, init: declaratorInit, id: declaratorId } = bodyDeclarations[0];
        if (declaratorType === 'VariableDeclarator' &&
          declaratorInit &&
          declaratorInit.type === 'ArrowFunctionExpression') {
          // have arrow function declaration...
          if (declaratorId && declaratorId.name === componentName) {
            // arrow function has name equal to the file name
            functionsDeclarations[declaratorId.name] = {
              componentName: declaratorId.name,
              properties: [], // arrow function can not have props
            };
            // get comments
            if (leadingComments && leadingComments.length > 0) {
              functionsDeclarations[declaratorId.name].comments = leadingComments.map(comment => comment.value);
            }
          }
        }
      } else if (type === 'ExportDefaultDeclaration') {
        if (functionsDeclarations[componentName]) {
          foundDeclaration = functionsDeclarations[componentName];
        }
      }
    });
  }
  return foundDeclaration;
};

const findAllPossibleComponentDeclarations = (ast, componentName) => {
  const result = [];
  const foundClassDeclaration = getClassDeclaration(ast, componentName);
  if (foundClassDeclaration) {
    if (foundClassDeclaration.properties.length === 0) {
      // probably the propTypes are declared outside the class declaration block
      foundClassDeclaration.properties = getPropTypesOutOfBody(ast, componentName);
    }
    result.push(foundClassDeclaration);
  } else {
    const foundFunctionDeclaration = findConstFunctionDeclaration(ast, componentName);
    if (foundFunctionDeclaration) {
      // the propTypes should be declared outside the function declaration block
      foundFunctionDeclaration.properties = getPropTypesOutOfBody(ast, componentName);
      result.push(foundFunctionDeclaration);
    }
  }
  return result;
};

export const findComponentDeclarations = (sourceCode, fileName) => {
  // console.info('AST: ', JSON.stringify(getSourceAst(sourceCode), null, 4));
  return findAllPossibleComponentDeclarations(getSourceAst(sourceCode), fileName);
};
