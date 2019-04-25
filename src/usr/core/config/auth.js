import { getT, setT } from './storage';
import * as restClient from "../utils/restClient";
import {sendAppWidowMessage} from '../utils/electronUtils';
import appWindowMessages from '../../commons/appWindowMessages';

let authToken = null;

export async function init() {
  authToken = await getT();
  await setToken(authToken);
}

export function getToken() {
  return authToken;
}

export async function setToken(token) {
  let userProfile = null;
  if (token) {
    try {
      const userData = await restClient.get('/user/profile', token);
      if (userData) {
        const {user} = userData;
        if (user) {
          const { firsName, lastName } = user;
          userProfile = {
            userName: `${firsName} ${lastName}`,
          }
        }
      } else {
        console.error('[Authentication]: User profile was not found');
        token = null;
      }
    } catch (error) {
      if (error) {
        const {response, message} = error;
        if (response) {
          const {status} = response;
          if (status === 403 || status === 401) {
            // not authenticated
            console.error('[Authentication]: Token is invalid or expired');
          } else if (status === 400) {
            // bad request in this case is the server response about wrong data in the request
            console.error('[Authentication]: Bad request');
          } else {
            console.error(message);
          }
        } else {
          // connection error
          console.error('[Authentication]: There is no connection to Webcodesk Service');
        }
      }
      token = null;
    }
  }
  await setT(token);
  authToken = token;
  if (userProfile) {
    sendAppWidowMessage(appWindowMessages.AUTHENTICATION_USER_SIGNED_IN, {userProfile});
  } else {
    sendAppWidowMessage(appWindowMessages.AUTHENTICATION_USER_SIGNED_OUT);
  }
}