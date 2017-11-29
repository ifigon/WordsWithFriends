import React from 'react';
import firebase from 'firebase/app';
import Input from './Input.js';
import constants from './constants';
import { Link, Redirect } from 'react-router-dom';

export default class SignUpView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentUser: undefined,
            email: '',
            password: '',
            confirm: '',
            displayname: '',
            error: '',
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

    handleSubmit(evt) {
        evt.preventDefault();
        this.setState({ error: '' });
        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.state.email))) {
            this.setState({ error: 'Please provide a valid email.' });
        }
        if (this.state.password !== this.state.confirm) {
            this.setState({ error: 'Password does not match. Please try again.' });
        }
        if (this.state.displayname === '') {
            this.setState({error: 'Please provide a valid displayname.'});
        }
        document.querySelector('#needs-validation').classList.add('was-validated');
        if (this.state.error === '') {
            this.handleSignUp();
        }
    }

    handleSignUp() {
        firebase.auth()
            .createUserWithEmailAndPassword(this.state.email, this.state.password)
            .then(user => {
                return user.updateProfile({
                    displayName: this.state.displayname
                });
            })
            .then(() => this.props.history.push(constants.routes.game))
            .catch(err => this.setState({ error: err.message }))
    }

    render() {
        if (this.state.currentUser === firebase.auth().currentUser
            && this.state.currentUser !== null) {
            return <Redirect to={constants.routes.game} />;
        }
        return (
            <div className='container'>
                <h1>Sign Up</h1>
                <div>
                    {this.state.error ? <div className='alert alert-danger'>{this.state.error}</div> : undefined}
                </div>

                <form onSubmit={evt => this.handleSubmit(evt)} id='needs-validation' noValidate>
                    <Input for='email'
                        title='Email'
                        id='email'
                        type='email'
                        placeholder='enter your email address'
                        value={this.state.email}
                        onInput={evt => this.setState({ email: evt.target.value })} />

                    <Input for='password'
                        title='Password'
                        id='password'
                        type='password'
                        placeholder='enter your password'
                        value={this.state.password}
                        onInput={evt => this.setState({ password: evt.target.value })} />

                    <Input for='confirm'
                        title='Confirm Password'
                        id='confirm'
                        type='password'
                        placeholder='re-enter your password'
                        value={this.state.confirm}
                        onInput={evt => this.setState({ confirm: evt.target.value })} />

                    <Input for='displayname'
                        title='Displayname'
                        id='displayname'
                        type='text'
                        placeholder='enter your displayname'
                        value={this.state.displayname}
                        onInput={evt => this.setState({ displayname: evt.target.value })} />

                    <button type='submit' className='btn btn-primary'>Sign Up</button>
                </form>

                <p>Already have an account? <Link to={constants.routes.signin}>Sign In Here</Link></p>
            </div>
        );
    }
}