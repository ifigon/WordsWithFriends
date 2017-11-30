import React from 'react';
import firebase from 'firebase/app';
import Input from './Input.js';
import constants from './constants';
import { Link, Redirect } from 'react-router-dom';

export default class SignInView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentUser: undefined,
            email: '',
            password: ''
        };
    }

    componentDidMount() {
        this.authUnsub = firebase.auth().onAuthStateChanged(user => {
            this.setState({ currentUser: user });
        });
    }

    componentWillUnmount() {
        this.authUnsub();
    }

    handleSignIn(evt) {
        evt.preventDefault();
        firebase.auth()
            .signInWithEmailAndPassword(this.state.email, this.state.password)
            .then(() => this.props.history.push(constants.routes.game))
            .then(() => this.setState({ error: undefined }))
            .catch(err => this.setState({ error: err.message }))
    }

    render() {
        if (this.state.currentUser === firebase.auth().currentUser
            && this.state.currentUser !== null) {
            return <Redirect to={constants.routes.game} />;
        }
        return (
            <div className='container'>
                <h1>Sign In</h1>
                <div>
                    {this.state.error ? <div className='alert alert-danger'>{this.state.error}</div> : undefined}
                </div>

                <form onSubmit={evt => this.handleSignIn(evt)}>
                    <Input for='email'
                        title='Email'
                        id='email'
                        type='email'
                        value={this.state.email}
                        onInput={evt => this.setState({ email: evt.target.value })} />

                    <Input for='password'
                        title='Password'
                        id='password'
                        type='password'
                        value={this.state.password}
                        onInput={evt => this.setState({ password: evt.target.value })} />

                    <button type='submit' className='btn btn-primary'>Sign In</button>
                </form>

                <p>Don't yet have an account? <Link to={constants.routes.signup}>Sign Up!</Link></p>
            </div>
        );
    }
}