import React from 'react';
import firebase from 'firebase/app';
import { Redirect } from 'react-router-dom';
import constants from './constants';

export default class BoardTile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            letter: "",
            point: undefined,
            key: undefined
        }
    }

    handleTilePlace(evt) {
        if(this.props.placeTileMode) {
            evt.classList.add('glass');
            this.setState({
                letter: this.props.userLetter.letter, 
                point: this.props.userLetter.point,
                key: this.props.userLetter.key
            });
            this.props.callBack(this.props.xCoord, this.props.yCoord, this.state.key);
        } else {
            /** 
             * Checks to make sure the tile was placed this turn before it removes it
             */    
            let isTileFromThisTurn = false;
            for(let i = 0; i < this.props.tilesPlacedThisTurn.length; i++) {
                if(this.props.tilesPlacedThisTurn[i].props.randomTile.key === this.state.key && !isTileFromThisTurn) {
                    isTileFromThisTurn = true;
                }
            }
            if(isTileFromThisTurn) {
                evt.classList.remove('glass');
                this.setState({
                    letter: "",
                    point: undefined,
                    key: undefined
                });
                this.props.callBack(this.props.xCoord, this.props.yCoord, this.state.key);
            }
        }
    }

    render() {
        return (
            <div className="col-1 p-0 tile-button">
                <button onClick={(evt) => this.handleTilePlace(evt.currentTarget)} className="w-100 h-100" disabled={!this.props.userTileSelected}>{this.state.letter}<sup>{this.state.point}</sup></button>
            </div>
        )
    }
}