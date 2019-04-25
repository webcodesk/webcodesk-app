import template from 'lodash/template';
import { repairPath } from '../../utils/fileUtils';
import { path } from '../../utils/electronUtils';
import * as constants from '../../../commons/constants';
import { format } from '../utils';

let appDirPath;

const appIndexFileContent = `
import React, { Suspense, lazy } from 'react';
import { Provider } from 'react-redux';
<% if(pages.noMatchPage) { %>
import { Router, Switch, Route } from 'react-router-dom';
<% } else { %>
import { Redirect, Router, Switch, Route } from 'react-router-dom';
<% } %>
import createBrowserHistory from 'history/createBrowserHistory';
import { configureStore } from '<%= storeImportPath %>';
import initialState from '<%= initialStateImportPath %>';
import StartWrapper from '<%= startWrapperImportPath %>';
<% pages.pageList.forEach(function(pageItem) { %>
const <%= pageItem.importName %> = lazy(() => import(/* webpackChunkName: "<%= pageItem.chunkName %>" */ '<%= pageItem.importPath %>'));
<% }) %>

let store;
let history;

export function initApp() {
  history = createBrowserHistory();
  store = configureStore(initialState, { history });
}

export const App = () => {
  return (
    <Provider store={store}>
      <StartWrapper>
        <Router history={history}>
          <Suspense fallback={<div>Loading...</div>}>
            <Switch>
              <% if(pages.mainPage) { %>
                <Route exact path="<%= publicUrl %>/" component={<%= pages.mainPage.importName %>} />  
              <% } %>
              <% pages.pageList.forEach(function(pageItem) { %>
                <% if (!pageItem.isNoMatch) { %>
                  <Route exact path="<%= publicUrl %><%= pageItem.pagePath %>" component={<%= pageItem.importName %>} />  
                <% } %>
              <% }) %>
              <% if(pages.noMatchPage) { %>
                <Route component={<%= pages.noMatchPage.importName %>} />  
              <% } else { %>
                <Redirect to="<%= publicUrl %>/" />
              <% } %>
            </Switch>
          </Suspense>
        </Router>
      </StartWrapper>
    </Provider>
  );
};
`;

function generateAppIndex (pages, publicUrl) {
  const fileObject = {};
  try {
    const indexFilePath = repairPath(path().join(appDirPath, 'index.js'));
    const storeImportPath =
      `.${constants.FILE_SEPARATOR}${constants.EXPORT_DIR_NAME_STORE}${constants.FILE_SEPARATOR}store`;
    const initialStateImportPath =
      `.${constants.FILE_SEPARATOR}${constants.EXPORT_DIR_NAME_STORE}${constants.FILE_SEPARATOR}initialState`;
    const startWrapperImportPath =
      `.${constants.FILE_SEPARATOR}${constants.EXPORT_DIR_NAME_START_WRAPPER}${constants.FILE_SEPARATOR}StartWrapper`;
    const text = template(appIndexFileContent)({
      pages,
      storeImportPath,
      initialStateImportPath,
      startWrapperImportPath,
      publicUrl
    });
    const fileData = format(text);
    fileObject.filePath = indexFilePath;
    fileObject.fileData = fileData;
  } catch (e) {
    console.error(`Can not create app/index.js file: ${e.message}`);
  }
  return fileObject;
}

export function generate (destDirPath, resources) {
  const fileList = [];
  const { pages, publicUrl } = resources;
  appDirPath = repairPath(path().join(
    destDirPath,
    constants.DIR_NAME_SRC,
    constants.DIR_NAME_APP
  ));
  // create pages list with components
  fileList.push(generateAppIndex(pages, publicUrl));
  return fileList;
}
