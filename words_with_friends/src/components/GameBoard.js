//How do i get access to a constant

import React from 'react';
import firebase from 'firebase/app';
import { Redirect } from 'react-router-dom';
import constants from './constants';
import letterTiles from '../tiles';
import BoardTile from "./BoardTile";
import Tile from "./Tile";

export default class InGameView extends React.Component {
    constructor(props) {
        super(props);
        let letterBoard = [];
        /** 
         * Initializes the game board to be completely empty. "-" means there
         * is no letter currently on that tile
         */
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
            xWord: '',
            yWord: '',
            currentUser: firebase.auth().currentUser,
            error: ''
        };
    }

    /** 
     * Signs user out
     */
    handleSignOut() {
        firebase.auth().signOut()
            .then(() => this.props.history.push(constants.routes.signin))
            .catch(err => this.setState({ error: err.message }));
    }

    /** 
     * When a user picks a tile that they want to put down from the user tiles,
     * updates the game state to reflect which tile they chose
     */
    selectUserTile = (selectedLetter) => {
        this.setState({ userTileSelected : true});
        this.setState({ userLetter: selectedLetter });
    }

    /** 
     * Updates the board when a user places a tile on the board and determines
     * whether the user has placed a valid word
     */
    updateBoard = (xCoord, yCoord) => {
        /** 
         * Updates the state of the board after user places a tile
         */
        this.setState({ userTileSelected : false});
        let newBoard = this.state.letterBoard;
        newBoard[xCoord][yCoord] = this.state.userLetter.letter; 
        this.setState({ letterBoard: newBoard });

        /** 
         * Used for building words based on where the user place their tile
         * Cycles back 1 index at a time until it finds the beginning of the word, then
         * cycles forward to build up the a word one letter at a time. Does this vertically
         * and horizontally to build up the horizontal possible word (xWord) and vertical
         * possible word (yWord)
         */
        let counter = xCoord;
        while(newBoard[counter][yCoord] !== "-" && counter >= 0) {
        counter--;
        }
        counter++;
        let xWord = "";
        while(newBoard[counter][yCoord] !== "-" && counter <= 11) {
        xWord += newBoard[counter][yCoord];
        counter++;
        }
        counter = yCoord;
        while(newBoard[xCoord][counter] !== "-" && counter >= 0) {
        counter--;
        }
        counter++;
        let yWord = "";
        while(newBoard[xCoord][counter] !== "-" && counter <= 11) {
        yWord += newBoard[xCoord][counter];
        counter++;
        }
        console.log(xWord);
        console.log(yWord);

        if (xWord.length >= 2) {
            this.setState({xWord: xWord.toLowerCase()});
        }
        if (yWord.length >= 2) {
            this.setState({yWord: yWord.toLowerCase()});
        }

        /** 
         * Creates the request used for the Oxford API call
         */
        var request = new Request("https://od-api.oxforddictionaries.com:443/api/v1/inflections/en/swimming", {
            headers: new Headers({
                "Accept": "application/json",
                "app_id": "b93dccf8",
                "app_key": "a21b1a8694543b981621557669e50641"
            })
        });

        /** 
         * Calls on Oxford dictionary API to determine whether the user
         * has placed a valid word
         */
        /* fetch(request)
            .then(this.handleResponse)
            .then(this.updateScore)
            .catch(this.handleError);
        */
    }

    /**
     * START OF WYNSTON'S TESTS: IN PROGRESS
     */
    checkWord() {
        console.log('word in state ' + this.state.xWord);
        console.log('word in state ' + this.state.yWord);
        this.fetchWord(this.state.xWord);
        this.fetchWord(this.state.yWord);
    }

    fetchWord(word) {
        const API_KEY = '?key=92de68e0-2615-460b-9152-16088d0944b7';
        const QUERY = 'https://www.dictionaryapi.com/api/v1/references/collegiate/xml/';
        fetch(QUERY + word + API_KEY)
            .then(response => response.text())
            .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
            .then(this.handleXML)
            .catch(this.handleError);
    }

    handleXML(data) {
        console.log(data);
        if (data
            && data.getElementsByTagName('ew')[0] !== undefined) {
            let word = data.getElementsByTagName('ew')[0].childNodes[0].nodeValue;
            console.log('word in dictionary ' + word);
            return true; //word exists in dictionary
        }
    }
    /**
     * END OF WYNSTON'S TESTS: IN PROGRESS
     */

    /** 
     * Used in AJAX call to handle error
     */
    handleError(err) {
        console.error(err);
        alert(err);
        //errorAlert.classList.remove("d-none");
    }

    /** 
     * Used in AJAX call to handle response
     */
    handleResponse(response) {
        if(response.ok) {
            return response.json();
        } else {
            return response.text().then(function(message) {
                throw new Error(message);
            });
        }
    }

    /** 
     * Used to update the user score after determining whether the user
     * placed a valid word
     */
    updateScore(data) {
        console.log(data);
    }

    /** 
     * Shuffles the given array, used when picking user tiles
     */
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
        /** 
         * Reditects the page if user is not signed in 
         */
        if (this.state.currentUser === null) {
            return <Redirect to={constants.routes.signin} />;
        }

        /** 
         * Sets up the tiles on the game board
         * Updates to a new board when user places a letter
         */
        let tiles = [];
        for (let i = 0; i < 144; i++) {
            let xCoord = i % 12;
            let yCoord = Math.floor(i / 12);
            tiles.push(
                <BoardTile key={i} callBack={this.updateBoard} xCoord={xCoord} yCoord={yCoord} userLetter={this.state.userLetter} userTileSelected={this.state.userTileSelected} />
            )
        }
        
        /**
         * Shuffles the array of tile objects and randomly selects 7
         * Pushes the 7 tiles to randomLetters array
         */
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

        /**
         * Gets the initials of the current user to be displayed in the scoreboard
         */
        let userInitial = this.state.currentUser.displayName.charAt(0);

        return (
            <div className='container'>
                <div className='row justify-content-between banner'>
                    <h1>Words With Friendz</h1>
                    <div className='d-flex'>
                        <div className='user'>{userInitial}</div>
                        <div>
                            <p>{this.state.currentUser.displayName}</p>
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
                    <button onClick={() => this.checkWord()} className='btn btn-success'>Play</button>
                </div>
            </div>
        );
    }
}