/** 
 * Words with Friends!
 * Ian Figon, Charlye Castro, Wynston Hsu, Christian Hahn
 */

import React from 'react';
import firebase from 'firebase/app';
import { Redirect } from 'react-router-dom';
import constants from './constants';
import letterTiles from '../tiles';
import tileValues from '../tilevalues';

import BoardTile from "./BoardTile";
import Tile from "./tile";
import Alert from './Alert';

const API_KEY = '?key=92de68e0-2615-460b-9152-16088d0944b7';
const QUERY = 'https://www.dictionaryapi.com/api/v1/references/collegiate/xml/';

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
            letterBoard: letterBoard,
            usedWords: [],
            wordLastPlayed: '',
            lastScore: 0,
            user1Tiles: [],
            user2Tiles: [],
            tilesPlacedThisTurn: [],
            remainingTurns: 15,
            score1: 0,
            score2: 0,
            player1Active: false,
            turnNumber: 0,
            shuffledLastTurn: false,
            currentUser: firebase.auth().currentUser,
            error: '',
        };
    }

    /** 
     * Initializes user inventories and begins the game
     */
    componentDidMount() {
        this.renderShuffled(true, false);
        let randomLetters = this.buildUpTiles(0);
        this.setState({ user1Tiles: randomLetters });    
    }

    /** 
     * Called at the end of each turn. Adds new tiles to the users inventory, and swaps
     * the turn from the current active player to the other
     */
    renderShuffled = (validTurn, resetTiles) => {
        /** 
         * If a word is found, then it is a valid turn and the code to prepare for the next
         * turn is executed. If no words are found then the turn isn't changed and it 
         * gives an alert that the user must try again
         */
        if (validTurn) {
            let newTurnNumber = this.state.turnNumber + 1;
            let tileNumber = 0;
            /** 
             * Refills the users inventory with however many tiles they need to maintain 7
             * tiles at the beginning of each turn
             */
            if(!resetTiles) {
                this.state.player1Active ? tileNumber = this.state.user1Tiles.length : tileNumber = this.state.user2Tiles.length;
            }
            let randomLetters = this.buildUpTiles(tileNumber);
            let currentTiles = undefined;
            this.state.player1Active ? currentTiles = this.state.user1Tiles : currentTiles = this.state.user2Tiles;
            if(!resetTiles) {
                currentTiles = currentTiles.concat(randomLetters);
                this.setState({ shuffledLastTurn : false});
            } else {
                currentTiles = randomLetters;
                this.setState({ shuffledLastTurn : true });
            }
            if (this.state.player1Active) {
                this.setState({ user1Tiles: currentTiles });
            } else {
                this.setState({ user2Tiles: currentTiles });
            }
            this.setState({ tilesPlacedThisTurn: [] });
            /** 
             * Swaps the yellow text over from whoevers turn it is now to the next turn
             */
            if (newTurnNumber > 1) {
                if (this.state.player1Active) {
                    document.querySelector("#user1").classList.remove("yellow-text");
                    document.querySelector("#user2").classList.add("yellow-text");
                } else {
                    document.querySelector("#user2").classList.remove("yellow-text");
                    document.querySelector("#user1").classList.add("yellow-text");
                    this.setState({remainingTurns: this.state.remainingTurns - 1});
                }
            }
            /** 
             * Resets the state of a bunch of different things to prepare for the next turn
             */
            let newTurn = !this.state.player1Active;
            this.setState({
                userTileSelected: false,
                userLetter: undefined,
                placeTileMode: true,
                error: undefined,
                player1Active: newTurn,
                turnNumber: this.state.turnNumber + 1
            });
            // this.setState({ userTileSelected : false });
            // this.setState({ userLetter : undefined});
            // this.setState({ placeTileMode : true});
            // this.setState({ error : undefined });
            // this.setState({ player1Active: newTurn });
            // this.setState({ turnNumber: this.state.turnNumber + 1 });
            this.checkIfGameOver();
        } else {
            this.setState({ error: 'No valid words found' });
        }
    }

    /** 
     * Adds new random tiles to the users inventory if they need them
     */
    buildUpTiles(init) {
        let randomLetters = [];
        let shuffledTiles = this.shuffle(letterTiles.tile);
        for (let i = init; i < 7; i++) {
            let randomSelect = Math.floor(Math.random() * shuffledTiles.length)
            let randomTile = shuffledTiles[randomSelect]
            randomLetters.push(
                <Tile key={Math.random() * (i + 1)} callBack={this.selectUserTile} randomTile={randomTile} userTileSelected={this.state.userTileSelected} />
            )
        }
        return randomLetters;
    }

    /** 
     * Checks if the game is over, if it is then it displays who won and 
     * prompts the user to start a new game
     */
    checkIfGameOver() {
        if (this.state.turnNumber === 30) {
            if(this.state.score1 > this.state.score2) {
                alert("Game over! " + this.state.currentUser.displayName + " won the game! Want to play another game?");                
            } else if(this.state.score1 < this.state.score2) {
                alert("Game over! Guest won the game! Want to play another game?");                
            } else {
                alert("Game over! The game was a tie, better luck next time! Want to play another game?");                                
            }
            document.addEventListener("keydown", window.location.reload());
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

    /** 
     * When a user picks a tile that they want to put down from the user tiles,
     * updates the game state to reflect which tile they chose
     */
    selectUserTile = (selectedLetter) => {
        this.setState({
            userTileSelected: true,
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
        if(this.state.placeTileMode) {
            this.setState({ userTileSelected: false });
        }
        let newBoard = this.state.letterBoard;
        if (this.state.placeTileMode) {
            /** 
             * If the user is in place tile mode, it places a tile and updates the user tiles as 
             * well as the tilesPlacedThisTurn so that the user can't remove tiles that weren't placed
             * this turn
             */
            if (this.state.player1Active) {
                this.updateInventory(this.state.user1Tiles);
            } else {
                this.updateInventory(this.state.user2Tiles);
            }
            newBoard[xCoord][yCoord] = this.state.userLetter.letter;
        } else {
            /** 
             * If the user is in remove tile mode, it places the tile that was removed
             * back into the inventory
             */
            for (let i = 0; i < this.state.tilesPlacedThisTurn.length; i++) {
                let tileFound = false;
                if (this.state.tilesPlacedThisTurn[i].props.randomTile.key === letterTile && !tileFound) {
                    let newUserTiles = [];
                    this.state.player1Active ? newUserTiles = this.state.user1Tiles.slice(0) : newUserTiles = this.state.user2Tiles.slice(0);
                    newUserTiles.push(this.state.tilesPlacedThisTurn[i]);
                    this.state.player1Active ? this.setState({ user1Tiles: newUserTiles }) : this.setState({ user2Tiles: newUserTiles });
                    tileFound = true;
                    let newTilesPlaced = this.state.tilesPlacedThisTurn.slice(0);
                    newTilesPlaced.splice(i, 1);
                    this.setState({ tilesPlacedThisTurn: newTilesPlaced });
                    newBoard[xCoord][yCoord] = "-";
                }
            }
        }
        this.setState({ letterBoard: newBoard });
    }

    /** 
     * Updates the user inventory when a tile is placed by removing it from their inventory
     * and storing it to ensure that users can only remove tiles and place them back into their
     * inventory if they were put down this turn
     */
    updateInventory(userTiles) {
        for (let i = 0; i < userTiles.length; i++) {
            let tileFound = false;
            if (userTiles[i].props.randomTile.key === this.state.userLetter.key && !tileFound) {
                let newTilesPlaced = this.state.tilesPlacedThisTurn.slice(0);
                newTilesPlaced.push(userTiles[i]);
                this.setState({ tilesPlacedThisTurn: newTilesPlaced });
                let newUserTiles = userTiles.slice(0);
                newUserTiles.splice(i, 1);
                if (this.state.player1Active) {
                    this.setState({ user1Tiles: newUserTiles });
                } else {
                    this.setState({ user2Tiles: newUserTiles });
                }
                tileFound = true;
            }
        }
    }

    /** 
     * Called when the user submits a word, checks every single tile looking for new words.
     * If it finds a new word, checks if that word is in the dictionary, and if it is it 
     * updates the score accordingly
     */
    checkWord() {
        this.setState({ error: '', wordLastPlayed: '' });
        let wordFound = false;

        /** 
         * Goes left to right through each coordinate one by one, for example starts at 0,0
         * then 1,0 then 2,0 etc. As soon as it hits a character on the board that's not a dash
         * it begins to build up a new word letter by letter. Once it hits another dash or the end
         * of the board, it checks if the word it has built up is greater than length 1 and that
         * it hasn't been placed down for points already. If both of these conditions are true,
         * checks if it's a valid word using the Dictionary API.
         */
        for (let yCoord = 0; yCoord < 12; yCoord++) {
            let possibleWord = "";
            for (let xCoord = 0; xCoord < 12; xCoord++) {
                let letter = this.state.letterBoard[xCoord][yCoord];
                if (letter !== "-") {
                    possibleWord += letter;
                }
                if (letter === "-" || xCoord === 11) {
                    if (possibleWord.length > 1 && !this.state.usedWords.includes(possibleWord)) {
                        wordFound = true;
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
        for (let xCoord = 0; xCoord < 12; xCoord++) {
            let possibleWord = "";
            for (let yCoord = 0; yCoord < 12; yCoord++) {
                let letter = this.state.letterBoard[xCoord][yCoord];
                if (letter !== "-") {
                    possibleWord += letter;
                }
                if (letter === "-" || yCoord === 11) {
                    if (possibleWord.length > 1 && !this.state.usedWords.includes(possibleWord)) {
                        wordFound = true;
                        this.state.usedWords.push(possibleWord);
                        this.fetchWord(possibleWord);
                    }
                    possibleWord = "";
                }
            }
        }
        if(!wordFound) {
            this.setState({ error: 'No valid words found' });        
        }
    }

    /** 
     * Uses the dictionary api to check if the passed in word is valid
     */
    fetchWord(word) {
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
        if (data && data.getElementsByTagName('ew')[0] !== undefined) {
            let word = data.getElementsByTagName('ew')[0].childNodes[0].nodeValue;
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
        if (this.isAlphabetic(word)) {
            word = word.toLowerCase();
            this.setState({ wordLastPlayed: word.toUpperCase() });
            let oldScore = 0;
            if (this.state.player1Active) {
                oldScore = this.state.score1;
            } else {
                oldScore = this.state.score2;
            }
            let wordScore = 0;
            /** 
             * Builds up the word score 
             */
            for (let i = 0; i < word.length; i++) {
                let character = word.charAt(i);
                let characterValue = tileValues.tileValues[character];
                wordScore += characterValue;
            }
            this.setState({ lastScore: wordScore });
            let newScore = 0;
            /** 
             * Updates the user score with the new word score added
             */
            if (this.state.player1Active) {
                newScore = this.state.score1 + wordScore;
                this.setState({ score1: newScore });
            } else {
                newScore = this.state.score2 + wordScore;
                this.setState({ score2: newScore });
            }
            return !(oldScore === newScore);
        } else {
            return false;
        }
    }

    /** 
     * Makes sure that the word passed in is only alphabetic characters,
     * non alphabetic characters returned by the dictionary api call are not
     * allowed
     */
    isAlphabetic(word) {
        for (let i = 0; i < word.length; i++) {
            let character = word.charAt(i);
            if (!character.match(/[a-z]/i)) {
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
                <BoardTile key={i} callBack={this.updateBoard} xCoord={xCoord} yCoord={yCoord}
                    userLetter={this.state.userLetter}
                    userTileSelected={this.state.userTileSelected}
                    placeTileMode={this.state.placeTileMode}
                    tilesPlacedThisTurn={this.state.tilesPlacedThisTurn} />
            )
        }

        /**
         * Gets the initials of the current user to be displayed in the scoreboard
         */
        //let userInitial = this.state.currentUser.displayName.charAt(0);

        return (
            <div className='container'>
                <div className='row justify-content-between banner'>
                    <h1>Words With Friendz</h1>
                    <div className='d-flex'>
                        <div className='user text-center'>{this.state.currentUser.displayName ? this.state.currentUser.displayName.charAt(0) : "U"}</div>
                        <div id='user1' className='yellow-text'>
                            <p>{this.state.currentUser.displayName}</p>
                            <h5 id="score1">{this.state.score1}</h5>
                        </div>
                    </div>
                    <div className='d-flex'>
                        <div className='user text-center'>G</div>
                        <div id='user2'>
                            <p>Guest</p>
                            <h5 id="score2">{this.state.score2}</h5>
                        </div>
                    </div>
                    <div>
                        <span>Remaining Turns: {this.state.remainingTurns}</span>
                    </div>
                    <div>
                        <button onClick={() => this.handleSignOut()} type='button' className='btn btn-dark'>
                            Sign Out
                        </button>
                    </div>
                </div>
                <div className='p-3'>
                    {(this.state.wordLastPlayed || this.state.shuffledLastTurn) 
                    && !this.state.player1Active && !this.state.error ?
                        <Alert username={this.state.currentUser.displayName} word={this.state.wordLastPlayed} points={this.state.lastScore} shuffledLastTurn={this.state.shuffledLastTurn} /> : undefined}
                    {(this.state.wordLastPlayed || this.state.shuffledLastTurn) 
                    && this.state.player1Active && !this.state.error ?
                        <Alert username='Guest' word={this.state.wordLastPlayed} points={this.state.lastScore} shuffledLastTurn={this.state.shuffledLastTurn} /> : undefined}
                    {this.state.error ?
                        <div className='alert alert-danger text-center mb-0'>
                            {this.state.error}
                        </div> : undefined}
                </div>
                <div className="container d-flex flex-wrap">
                    {tiles}
                </div>
                <div className='row justify-content-center p-3'>
                    {this.state.player1Active ? this.state.user1Tiles : this.state.user2Tiles}
                </div>
                <div className='row justify-content-center banner'>
                    <div className="mr-5">
                        <button onClick={() => this.checkWord()} className='btn btn-success'>
                            Play Word
                        </button>
                    </div>
                    <div className="mx-5 d-flex">
                        <div className="mr-2">
                            <button onClick={() => this.setState({
                                placeTileMode: true,
                                userTileSelected: false
                            })}
                                disabled={this.state.placeTileMode}
                                className='btn btn-primary'>
                                Place Tile
                            </button>
                        </div>
                        <div className="ml-2">
                            <button onClick={() => this.setState({
                                placeTileMode: false,
                                userTileSelected: true,
                                userLetter: undefined
                            })}
                                disabled={!this.state.placeTileMode}
                                className='btn btn-danger'>
                                Remove Tile
                            </button>
                        </div>
                    </div>
                    <div className="ml-5">
                        <button onClick={() => this.renderShuffled(true, true)} 
                            disabled={this.state.tilesPlacedThisTurn.length !== 0} 
                            className='btn btn-warning'>
                            Shuffle Letters
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}