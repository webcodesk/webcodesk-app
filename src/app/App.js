import React from 'react';
import Application from '@webcodesk/react-app-framework';
import schema from './schema';
import userComponents from './indices/userComponents';
import userFunctions from './indices/userFunctions';

const App = () => (
  <Application
    schema={schema}
    userComponents={userComponents}
    userFunctions={userFunctions}
  />
);
export default App;
