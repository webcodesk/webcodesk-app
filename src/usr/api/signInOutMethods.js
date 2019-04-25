import * as auth from "../core/config/auth";
import * as restClient from "../core/utils/restClient";
import {showConfirmationDialog} from "../core/utils/electronUtils";

export const startSignIn = () => (dispatch) => {
  dispatch('error', null);
  dispatch('isOpen', true);
};

export const signIn = (options) => async (dispatch) => {
  const {email, password} = options;
  try {
    dispatch('isLoading', true);
    const tokenWrapper = await restClient.post('/auth', null, {username: email, password});
    if (tokenWrapper) {
      const {token} = tokenWrapper;
      await auth.setToken(token);
      dispatch('success');
      dispatch('isOpen', false);
    } else {
      dispatch('error', {message: 'Authentication error'});
    }
  } catch (error) {
    if (error) {
      const {response, message} = error;
      if (response) {
        const {status, data} = response;
        if (status === 403 || status === 401) {
          // not authenticated
          dispatch('error', {message: 'Wrong email or password'});
        } else if (status === 400) {
          // bad request in this case is the server response about wrong data in the request
          dispatch('error', {message: data});
        } else {
          console.error(message);
          dispatch('error', {message: 'Service system error'});
        }
      } else {
        // connection error
        dispatch('error', {message: 'There is no connection to Webcodesk Service'});
      }
    }
  }
  dispatch('isLoading', false);
};

export const signOut = () => async (dispatch) => {
  showConfirmationDialog('Are you sure you\'d like to sign out?', async (confirmation) => {
    if (confirmation) {
      await auth.setToken(null);
    }
  });
};
