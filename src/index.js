import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Amplify, Auth } from "aws-amplify";
import awsconfig from "./aws-exports";
import {createStore, applyMiddleware} from 'redux'
import {Provider} from 'react-redux'
import {combineReducers} from 'redux'

Amplify.configure(awsconfig);


const subscriberCount = (state = 0, action) => {
  if (action.type === 'ADD_SUBSCRIBER') {
    return state + 1
  }
  if (action.type === 'REMOVE_SUBSCRIBER') {
    return state - 1
  }
  return state
}

const storeInstance = createStore (
  combineReducers({
    subscriberCount
  })
)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={storeInstance}>
  <React.StrictMode>
    <App />
  </React.StrictMode>
  </Provider>
);

export default storeInstance;

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
