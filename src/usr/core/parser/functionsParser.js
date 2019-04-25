import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';
import { getSourceAst } from '../utils/babelParser';
import { traverse } from '../utils/astUtils';

const getFunctionBodyDispatches = (functionBodyAst => {
  let result = [];
  traverse(functionBodyAst, node => {
    if (node.type === 'ExpressionStatement') {
      const { expression } = node;
      if (expression && expression.type === 'CallExpression') {
        const { callee, arguments: expressionArguments } = expression;
        // see if the call is to dispatch
        if (callee && callee.type === 'Identifier' && callee.name === 'dispatch') {
          // there 2 arguments have to be
          if (expressionArguments && expressionArguments.length > 0) {
            const firstArgument = expressionArguments[0];
            // todo: if we want to find out what the type of the second argument
            // const secondArgument = expressionArguments[1];
            // the first argument must be the string name
            if (firstArgument && firstArgument.type === 'StringLiteral') {
              const functionDispatchDeclaration = {};
              // set dispatch declaration name
              functionDispatchDeclaration.name = firstArgument.value;
              // todo: test the second argument type here too...
              // todo: it is worth to get the type of the second argument here
              result.push(functionDispatchDeclaration);
            }
          }
        }
      }
    }
  });
  result = uniqWith(result, isEqual);
  return result;
});

export const getFunctionDeclarations = (ast) => {
  const result = [];
  if (ast && ast.body && ast.body.length > 0) {
    ast.body.forEach(node => {
      if (node.type === 'ExportNamedDeclaration') {
        const {declaration, leadingComments} = node;
        // console.info('ExportNamedDeclaration passed');
        if (declaration && declaration.type === 'VariableDeclaration') {
          // console.info('VariableDeclaration passed');
          const {declarations} = declaration;
          if (declarations && declarations.length > 0) {
            const {type: varDeclarationType, id: varId, init: varInit,} = declarations[0];
            if (varDeclarationType === 'VariableDeclarator') {
              // console.info('VariableDeclarator passed');
              if (varId && varInit) {
                const {type: varIdType, name: varIdName} = varId;
                const {type: varInitType, params: varInitParams, body: varInitBody} = varInit;
                if (varIdType === 'Identifier' && varInitType === 'ArrowFunctionExpression') {
                  // console.info('Identifier & ArrowFunctionExpression passed');
                  const functionDeclaration = {};
                  // set user function name
                  functionDeclaration.functionName = varIdName;
                  // get parameters of the user function (arrow function)
                  if (varInitParams && varInitParams.length > 0) {
                    functionDeclaration.parameters = [];
                    varInitParams.forEach(varInitParam => {
                      functionDeclaration.parameters.push({
                        name: varInitParam.name,
                        // todo: the type of the function parameter here should be added
                      });
                    });
                  }
                  // add comments if there are some
                  if (leadingComments && leadingComments.length > 0) {
                    functionDeclaration.comments = leadingComments.map(comment => comment.value);
                  }
                  // check user function body, it has to be the arrow function with dispatch parameter
                  if (varInitBody) {
                    const {
                      type: varInitBodyType,
                      generator: varInitBodyGenerator,
                      //async: varInitBodyAsync, // todo: should we pass/test async declaration here?
                      params: varInitBodyParams,
                      body: varInitBodyBody,
                    } = varInitBody;
                    if (!varInitBodyGenerator && varInitBodyType === 'ArrowFunctionExpression') {
                      // console.info('varInitBodyGenerator & ArrowFunctionExpression passed');
                      if (varInitBodyParams && varInitBodyParams.length > 0) {
                        // see if the parameter of the nested function has dispatch name only
                        if (varInitBodyParams[0].type === 'Identifier' && varInitBodyParams[0].name === 'dispatch') {
                          // get dispatches inside the function body
                          functionDeclaration.dispatches = getFunctionBodyDispatches(varInitBodyBody);
                          // that's valid function declaration - we add it the list of user functions
                          result.push(functionDeclaration);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  return result;
};

export const findFunctionDeclarations = (sourceCode) => {
  return getFunctionDeclarations(getSourceAst(sourceCode));
};
