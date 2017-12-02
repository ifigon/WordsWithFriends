//How do i get access to a constant

import React from 'react';
import firebase from 'firebase/app';
import { Redirect } from 'react-router-dom';
import constants from './constants';
import letterTiles from '../tiles';

import BoardTile from "./BoardTile";

import Tile from "./tile";

const OXFORD_API_URL = "https://od-api.oxforddictionaries.com/api/v1"

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
            userTileSelected: false,
            letterBoard: letterBoard,
            userLetter: undefined,
            currentUser: firebase.auth().currentUser,
            error: ''
        };
    }

    handleSignOut() {
        firebase.auth().signOut()
            .then(() => this.props.history.push(constants.routes.signin))
            .catch(err => this.setState({ error: err.message }));
    }

    selectUserTile = (selectedLetter) => {
        console.log(selectedLetter);
        this.state.userTileSelected = true;
        this.setState({ userLetter: selectedLetter });
    }

    updateBoard = (xCoord, yCoord) => {
        this.state.userTileSelected = false;
        let newBoard = this.state.letterBoard;
        newBoard[xCoord][yCoord] = this.state.userLetter.letter;  // Just a testing letter, will add letter parameter to this method later
        console.log(newBoard[xCoord][yCoord]);
        this.setState({ letterBoard: newBoard });
        console.log(this.state.letterBoard);
    }

    shuffle(array) {
        var m = array.length,
            t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    }

    render() {
        // let letterStyle = {
        //     backgroundColor: "#F5F4F2"
        // }

        if (this.state.currentUser === null) {
            return <Redirect to={constants.routes.signin} />;
        }
        let tiles = [];
        for (let i = 0; i < 144; i++) {
            let xCoord = i % 12;
            let yCoord = Math.floor(i / 12);
            tiles.push(
                <BoardTile key={i} callBack={this.updateBoard} xCoord={xCoord} yCoord={yCoord} userLetter={this.state.userLetter} userTileSelected={this.state.userTileSelected} />
            )
        }
        
        let shuffledTiles = this.shuffle(letterTiles.tile);
        let randomLetters = [];
        for (let i = 0; i < 7; i++) {
            let randomSelect = Math.floor(Math.random() * shuffledTiles.length)
            let randomTile = shuffledTiles[randomSelect]
            // shuffledTiles = shuffledTiles.splice(randomSelect, 1);
            randomLetters.push(
                <Tile key={i} callBack={this.selectUserTile} randomTile={randomTile} userTileSelected={this.state.userTileSelected} />
            )
        }
        return (
            <div className='container'>
                <div className='row justify-content-between banner'>
                    <h1>Words With Friendz</h1>
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
                <div className='row justify-content-center letter-drawer'>
                    {randomLetters}
                </div>
                <div className='row justify-content-center banner'>
                    <button className='btn btn-success'>Play</button>
                </div>
            </div>
        );
    }
}