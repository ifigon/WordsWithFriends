import React from 'react';
import firebase from 'firebase/app';
import { Redirect } from 'react-router-dom';
import constants from './constants';
import letterTiles from '../tiles';
import tileValues from '../tilevalues';

import BoardTile from "./BoardTile";
import Tile from "./tile";
import Countdown from 'react-countdown-now';

const OXFORD_API_URL = "https://od-api.oxforddictionaries.com/api/v1"

export default class InGameView extends React.Component {
    constructor(props) {
        super(props);

        /** 
         * Initializes the game board to be completely empty. "-" means there
         * is no letter currently on that tile
         */
        let letterBoard = [];        
        for (let i = 0; i < 12; i++) {
            let row = [];
            for (let j = 0; j < 12; j++) {
                row.push("-");
            }
            letterBoard.push(row);
        }

        this.state = {
            placeTileMode: true,
            userTileSelected: false,
            userLetter: undefined,
            startGame: false,
            letterBoard: letterBoard,
            usedWords: [],
            user1Tiles: [],
            tilesPlacedThisTurn: [],
            tilesLeft: letterTiles.tile.length, //Need to update tiles left
            score1 : 0,
            score2: 0,
            currentUser: firebase.auth().currentUser,
        };
    }

    componentDidMount() {
        this.renderShuffled(true);
    }

    renderShuffled = validTurn => {
        if(validTurn) {
            let shuffledTiles = this.shuffle(letterTiles.tile);
            let randomLetters = [];
            for (let i = this.state.user1Tiles.length; i < 7; i++) {
                let randomSelect = Math.floor(Math.random() * shuffledTiles.length)
                let randomTile = shuffledTiles[randomSelect]
                // shuffledTiles = shuffledTiles.splice(randomSelect, 1);
                randomLetters.push(
                    <Tile key={Math.random() * i} callBack={this.selectUserTile} randomTile={randomTile} userTileSelected={this.state.userTileSelected} />
                )
            }
            let currentTiles = this.state.user1Tiles;
            currentTiles = currentTiles.concat(randomLetters);
            this.setState({ user1Tiles: currentTiles }); 
            this.setState({ tilesPlacedThisTurn : [] });            
        } else {
            alert("No valid words found");
        }
    }

    /** 
     * Signs user out
     */
    handleSignOut() {
        firebase.auth().signOut()
            .then(() => this.props.history.push(constants.routes.signin))
            .catch(err => this.setState({ error: err.message }));
    }

//    handleStartGame() {
//        this.setState({startGame: true});
//    }

    /** 
     * When a user picks a tile that they want to put down from the user tiles,
     * updates the game state to reflect which tile they chose
     */
    selectUserTile = (selectedLetter) => {
        this.setState({ 
            userTileSelected : true,
            userLetter: selectedLetter,
        });
    }

    /** 
     * Updates the board when a user places a tile on the board and determines
     * whether the user has placed a valid word
     */
    updateBoard = (xCoord, yCoord, letterTile) => {
        /** 
         * Updates the state of the board after user places a tile
         */
        this.state.placeTileMode ? this.setState({ userTileSelected : false}) : undefined;
        let newBoard = this.state.letterBoard;
        if(this.state.placeTileMode) {
            /** 
             * If the user is in place tile mode, it places a tile and updates the user1Tiles as 
             * well as the tilesPlacedThisTurn so that the user can't remove tiles that weren't placed
             * this turn
             */            
            for(let i = 0; i < this.state.user1Tiles.length; i++) {
                let tileFound = false;
                if(this.state.user1Tiles[i].props.randomTile.key === this.state.userLetter.key && !tileFound) {
                    let newTilesPlaced = this.state.tilesPlacedThisTurn.slice(0);
                    newTilesPlaced.push(this.state.user1Tiles[i]);
                    this.setState({ tilesPlacedThisTurn : newTilesPlaced });
                    let newUserTiles = this.state.user1Tiles.slice(0);
                    newUserTiles.splice(i, 1);
                    this.setState({ user1Tiles : newUserTiles });
                    tileFound = true;
                }
            }
            newBoard[xCoord][yCoord] = this.state.userLetter.letter; 
        } else {
            /** 
             * If the user is in remove tile mode, it places the tile that was removed
             * back into the inventory
             */   
            for(let i = 0; i < this.state.tilesPlacedThisTurn.length; i++) {
                let tileFound = false;
                if(this.state.tilesPlacedThisTurn[i].props.randomTile.key === letterTile && !tileFound) {
                    let newUserTiles = this.state.user1Tiles.slice(0);
                    newUserTiles.push(this.state.tilesPlacedThisTurn[i]);
                    this.setState({ user1Tiles : newUserTiles });
                    tileFound = true;
                    let newTilesPlaced = this.state.tilesPlacedThisTurn.slice(0);
                    newTilesPlaced.splice(i, 1);
                    this.setState({ tilesPlacedThisTurn : newTilesPlaced });
                    newBoard[xCoord][yCoord] = "-"; 
                }
            }
        }
        this.setState({ letterBoard: newBoard });
    }

    /** 
     * Called when the user submits a word, checks every single tile looking for new words.
     * If it finds a new word, checks if that word is in the dictionary, and if it is it 
     * updates the score accordingly
     */
    checkWord() {
        /** 
         * Goes left to right through each coordinate one by one, for example starts at 0,0
         * then 1,0 then 2,0 etc. As soon as it hits a character on the board that's not a dash
         * it begins to build up a new word letter by letter. Once it hits another dash or the end
         * of the board, it checks if the word it has built up is greater than length 1 and that
         * it hasn't been placed down for points already. If both of these conditions are true,
         * checks if it's a valid word using the Dictionary API.
         */
        for(let yCoord = 0; yCoord < 12; yCoord++) {
            let possibleWord = "";
            for(let xCoord = 0; xCoord < 12; xCoord++) {
                let letter = this.state.letterBoard[xCoord][yCoord];
                if(letter !== "-") {
                    possibleWord += letter;
                } 
                if(letter === "-" || xCoord === 11) {
                    if(possibleWord.length > 1 && !this.state.usedWords.includes(possibleWord)) {
                        this.state.usedWords.push(possibleWord);
                        this.fetchWord(possibleWord);
                    }
                    possibleWord = "";
                }
            }
        }

        /** 
         * Same algorithm as above only this time it looks for vertical words not horizontal words. So
         * it starts at coordinate 0,0 then 0,1 then 0,2 etc.
         */
        for(let xCoord = 0; xCoord < 12; xCoord++) {
            let possibleWord = "";
            for(let yCoord = 0; yCoord < 12; yCoord++) {
                let letter = this.state.letterBoard[xCoord][yCoord];
                if(letter !== "-") {
                    possibleWord += letter;
                } 
                if(letter === "-" || yCoord === 11) {
                    if(possibleWord.length > 1 && !this.state.usedWords.includes(possibleWord)) {
                        this.state.usedWords.push(possibleWord);
                        this.fetchWord(possibleWord);
                    }
                    possibleWord = "";
                }
            }
        }
//        let myHeaders = new Headers();
//        myHeaders.append({"Accept": "application/json",
//                "app_id": "b5e5a7fc",
//                "app_key": "678924caca3d72ba440b841c7ddf0890"});
//        let init = {headers: myHeaders};
//        const request = new Request("https://od-api.oxforddictionaries.com:443/api/v1/inflections/en/" + xWord, init);
//
//        /** 
//         * Calls on Oxford dictionary API to determine whether the user
//         * has placed a valid word
//         */
//        fetch(request)
//            .then(this.handleResponse)
//            .then(this.updateScore)
//            .catch(this.handleError);
        
    }

    /** 
     * Uses the dictionary api to check if the passed in word is valid
     */
    fetchWord(word) {
        const API_KEY = '?key=92de68e0-2615-460b-9152-16088d0944b7';
        const QUERY = 'https://www.dictionaryapi.com/api/v1/references/collegiate/xml/';
        fetch(QUERY + word + API_KEY)
            .then(response => response.text())
            .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
            .then(this.handleXML)
            .then(this.updateScore)
            .then(this.renderShuffled)
            .catch(this.handleError);
    }

    /** 
     * Uses the dictionary api to check if the passed in word is valid
     */
    handleXML(data) {
        console.log(data);
        if (data && data.getElementsByTagName('ew')[0] !== undefined) {
            let word = data.getElementsByTagName('ew')[0].childNodes[0].nodeValue;
            console.log('word in dictionary ' + word);
            return word;
        } else {
            return "";
        }
    }

    /** 
     * When the user submits a valid word checked by the dictionary api, it adds
     * up the word score and updates the user score accordingly
     */
    updateScore = (word) => {
        console.log(word);
        if(this.isAlphabetic(word)) {
            word = word.toLowerCase();
            let oldScore = this.state.score1;
            let wordScore = 0;
            for(let i = 0; i < word.length; i++) {
                let character = word.charAt(i);
                let characterValue = tileValues.tileValues[character];
                wordScore += characterValue;
            }
            let newScore = this.state.score1 + wordScore;
            this.setState({ score1 : newScore});
            return !(oldScore === newScore);
        } else {
            return false;
        }
    }

    isAlphabetic(word) {
        for(let i = 0; i < word.length; i++) {
            let character = word.charAt(i);
            if(!character.match(/[a-z]/i)) {
                return false;
            }
        }
        return true;
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
                <BoardTile key={i} callBack={this.updateBoard} xCoord={xCoord} yCoord={yCoord} userLetter={this.state.userLetter} userTileSelected={this.state.userTileSelected} placeTileMode={this.state.placeTileMode} tilesPlacedThisTurn={this.state.tilesPlacedThisTurn} />
            )
        }
        
//        renderTimer() {
//            return (
//                <Countdown date={Date.now() + 60000}>
//                    <span>Game over! </span>
//                </Countdown>    
//            );
//        }
        
//        <div>
//            <button onClick={() => this.handleStartGame()}type='button' className='btn btn-success'>Start Game {this.state.startGame ?  <div><Countdown date={Date.now() + 60000}><span>Game over! </span></Countdown></div> : null}</button>
//        </div>

        /**
         * Gets the initials of the current user to be displayed in the scoreboard
         */
        /*need to fix timer so that it does not reset everytime user invokes change in state*/
        let userInitial = this.state.currentUser.displayName.charAt(0);

        return (
            <div className='container'>
                <div className='row justify-content-between banner'>
                    <h1>Words With Friendz</h1>
                    <div className='d-flex'>
                        <div className='user'>{userInitial}</div>
                        <div id='1' className='yellow-text'>
                            <p>{this.state.currentUser.displayName}</p>
                            <h5 id="score1">{this.state.score1}</h5>
                        </div>
                    </div>
                    <div className='d-flex'>
                        <div className='user'>C</div>
                        <div id='2'>
                            <p>CPU</p>
                            <h5 id="score2">{this.state.score2}</h5>
                        </div>
                    </div>
                    <div><button onClick={() => this.handleSignOut()} type='button' className='btn btn-dark'>Sign Out</button></div>
                </div>
                <div className="container d-flex flex-wrap">
                    {tiles}
                </div>
                <div className='row justify-content-center letter-drawer'>
                    {this.state.user1Tiles} 
                </div>
                <div className='row justify-content-center banner'>
                    <div className="mr-5">
                        <button onClick={() => this.checkWord()} className='btn btn-success'>Play Word</button>
                    </div>
                    <div className="ml-5 d-flex">
                        <div className="mr-2">
                            <button onClick={() => this.setState({ placeTileMode : true, userTileSelected: false })} disabled={this.state.placeTileMode} className='btn btn-primary'>Place Tile Mode</button>
                        </div>
                        <div className="ml-2">
                            <button onClick={() => this.setState({ placeTileMode: false, userTileSelected : true, userLetter : undefined})} disabled={!this.state.placeTileMode} className='btn btn-danger'>Remove Tile Mode</button>
                        </div>
                        <p> {this.state.tilesLeft} Tiles left </p>
                        {/* {shuffledTiles.length} This has to go inside <P>*/}
                    </div>
                </div>
            </div>
        );
    }
}