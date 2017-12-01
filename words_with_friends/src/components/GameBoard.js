//How do i get access to a constant

import React from 'react';
import firebase from 'firebase/app';
import { Redirect } from 'react-router-dom';
import constants from './constants';
import letterTiles from '../tiles';

import BoardTile from "./BoardTile";

import Tile from "./tile";

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
        let letterStyle= {
            backgroundColor:"#F5F4F2"
        }

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

        
        let shuffledTiles = this.shuffle(letterTiles.tile);
        let randomLetters = [];       
        for (let i = 0; i < 7; i++) {
            let randomSelect = Math.floor(Math.random() * shuffledTiles.length)
            let randomTile = shuffledTiles[randomSelect]
           // shuffledTiles = shuffledTiles.splice(randomSelect, 1);
            randomLetters.push(
                <Tile key={i} randomTile={randomTile} />
            )
        }
        return (
            <div className='container'>
                <h1>Words With Friends</h1>
                <div className="container d-flex flex-wrap">
                    {tiles}
                </div>

                <div className = "container d-flex flex-wrap justify-content-center" style = {letterStyle}>
                    {randomLetters}
                </div> 

                <button onClick={() => this.handleSignOut()} type='button' className='btn btn-dark'>Sign Out</button>
            </div>
        );
    }
}