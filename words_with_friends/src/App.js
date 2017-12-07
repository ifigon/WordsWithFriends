/** 
 * Words with Friends!
 * Ian Figon, Charlye Castro, Wynston Hsu, Christian Hahn
 */

import React, { Component } from 'react';
import { HashRouter as Router, Switch, Redirect, Route } from 'react-router-dom';
import SignUpView from './components/SignUp';
import SignInView from './components/SignIn';
import InGameView from './components/GameBoard';
import constants from './components/constants';

class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path={constants.routes.signin} component={SignInView} />
          <Route path={constants.routes.signup} component={SignUpView} />
          <Route path={constants.routes.game} component={InGameView} />
          <Redirect to={constants.routes.signin} />
        </Switch>
      </Router>
    );
  }
}

export default App;
