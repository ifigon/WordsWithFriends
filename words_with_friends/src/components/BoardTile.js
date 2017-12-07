/** 
 * Every tile on the actual game board
 */

import React from 'react';

export default class BoardTile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            letter: "",
            point: undefined,
            key: undefined,
            tilePlaced: false
        }
    }

    /** 
    * Updates the state when a tile is placed
    */
    handleTilePlace(evt) {
        /** 
         * If the user is in place tile mode, a tile is placed and this board tile is updated
         */   
        if(this.props.placeTileMode && !this.state.tilePlaced) {
            this.setState({ tilePlaced : true });
            evt.classList.add('glass');
            evt.classList.remove('tile');
            this.setState({
                letter: this.props.userLetter.letter, 
                point: this.props.userLetter.point,
                key: this.props.userLetter.key
            });
            this.props.callBack(this.props.xCoord, this.props.yCoord, this.state.key);
        } else if(!this.props.placeTileMode) {
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
                this.setState({ tilePlaced : false });
                evt.classList.remove('glass');
                evt.classList.add('tile');
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
            <div className="col-1 p-1 tile-button">
                <button onClick={(evt) => this.handleTilePlace(evt.currentTarget)} className="w-100 h-100 tile text-center" disabled={!this.props.userTileSelected}>{this.state.letter}<sup>{this.state.point}</sup></button>
            </div>
        )
    }
}