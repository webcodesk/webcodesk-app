import React from 'react';
import Application from '@webcodesk/react-app-framework';
import schema from './schema';
import userComponents from './indices/userComponents';
import userComponentStories from './indices/userComponentStories';
import userFunctions from './indices/userFunctions';

const AppDev = () =>
  (<Application
    schema={schema}
    userComponents={userComponents}
    userFunctions={userFunctions}
    userComponentStories={userComponentStories}
  />);

export default AppDev;
