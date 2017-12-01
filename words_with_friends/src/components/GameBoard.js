import React from 'react';
import firebase from 'firebase/app';
import { Redirect } from 'react-router-dom';
import constants from './constants';

import BoardTile from "./BoardTile"

export default class InGameView extends React.Component {
    constructor(props) {
        super(props);
        let letterBoard = [];
        for (let i = 0; i < 12; i++) {
            let row = [];
            for (let j = 0; j < 12; j++) {
                row.push("-");
            }
            letterBoard.push(row);
        }
        this.state = {
            letterBoard: letterBoard,
            currentUser: firebase.auth().currentUser,
            error: ''
        };
    }

    handleSignOut() {
        firebase.auth().signOut()
            .then(() => this.props.history.push(constants.routes.signin))
            .catch(err => this.setState({ error: err.message }));
    }

    updateBoard = (xCoord, yCoord) => {
        let newBoard = this.state.letterBoard;
        newBoard[xCoord][yCoord] = "T";  // Just a testing letter, will add letter parameter to this method later 
        this.setState({ letterBoard: newBoard });
        console.log(this.state.letterBoard);
    }

    render() {
        if (this.state.currentUser === null) {
            return <Redirect to={constants.routes.signin} />;
        }
        let tiles = [];
        for (let i = 0; i < 144; i++) {
            let xCoord = i % 12;
            let yCoord = Math.floor(i / 12);
            tiles.push(
                <BoardTile key={i} callBack={this.updateBoard} xCoord={xCoord} yCoord={yCoord} />
            )
        }
        return (
            <div className='container'>
                <div className='row justify-content-between banner'>
                    <div><h1>Words With Friends</h1></div>
                    {/* placeholder usernames*/}
                    <div className='d-flex'>
                        <div className='user'>W</div>
                        <div>
                            <p>wynhsu</p>
                            <h5>343</h5>
                        </div>
                    </div>
                    <div className='d-flex'>
                        <div className='user'>L</div>
                        <div>
                            <p>CPU</p>
                            <h5>0</h5>
                        </div>
                    </div>
                    <div><button onClick={() => this.handleSignOut()} type='button' className='btn btn-dark'>Sign Out</button></div>
                </div>
                <div className="container d-flex flex-wrap">
                    {tiles}
                </div>
                <div className='row justify-content-between letter-drawer'>
                    <button className='glass'>T</button>
                </div>
                <div className='row justify-content-center banner'>
                    <button className='btn btn-success'>Play</button>
                </div>
            </div>
        );
    }
}