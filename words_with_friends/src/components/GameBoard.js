import React from 'react';
import firebase from 'firebase/app';
import { Redirect } from 'react-router-dom';
import constants from './constants';

export default class InGameView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentUser: firebase.auth().currentUser,
            error: ''
        };
    }

    handleSignOut() {
        firebase.auth().signOut()
        .then(() => this.props.history.push(constants.routes.signin))
        .catch(err => this.setState({ error: err.message }));
    }

    render() {
        if (this.state.currentUser === null) {
            return <Redirect to={constants.routes.signin} />;
        }
        return (
            <div className='container'>
                <h1>Words With Friends</h1>
                <button onClick={() => this.handleSignOut()} type='button' className='btn btn-dark'>Sign Out</button>
            </div>
        );
    }
}