import { getSourceAst } from '../utils/babelParser';
import { traverse } from '../utils/astUtils';

function getImportDeclarations(ast) {
  if (!ast) {
    return [];
  }
  let result = [];
  const { body: bodyContent } = ast;
  if (bodyContent && bodyContent.length > 0) {
    bodyContent.forEach(bodyItem => {
      const { type: bodyItemType, source: bodyItemSource } = bodyItem;
      if (bodyItemType === 'ImportDeclaration' && bodyItemSource && bodyItemSource.value) {
        result.push(bodyItemSource.value);
      }
    });
  }
  return result;
}

function getRequireDeclarations(ast) {
  if (!ast) {
    return [];
  }
  const result = [];
  traverse(ast, node => {
    if (node && node.type === 'CallExpression') {
      const {callee, arguments: callArgs} = node;
      if (callee
        && callee.type === 'Identifier'
        && callee.name === 'require'
        && callArgs
        && callArgs.length > 0) {
        result.push(callArgs[0].value);
      }
    }
  });
  return result;
}

export function parse(filePath) {
  const ast = getSourceAst(filePath);
  // console.info('AST: ', JSON.stringify(ast, null, 4));
  const importDeclarations = getImportDeclarations(ast);
  const requireDeclarations = getRequireDeclarations(ast);
  return [].concat(importDeclarations, requireDeclarations);
}