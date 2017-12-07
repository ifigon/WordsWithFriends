/** 
 * Words with Friends!
 * Ian Figon, Charlye Castro, Wynston Hsu, Christian Hahn
 */

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

var config = {
    apiKey: "AIzaSyCGkXNkh5Q26uLxsQ8x8xyHXiiXaZXxvSA",
    authDomain: "words-with-friends-47d32.firebaseapp.com",
    databaseURL: "https://words-with-friends-47d32.firebaseio.com",
    projectId: "words-with-friends-47d32",
    storageBucket: "words-with-friends-47d32.appspot.com",
    messagingSenderId: "39899836973"
  };
  firebase.initializeApp(config);

ReactDOM.render(<App />, document.getElementById('root'));
