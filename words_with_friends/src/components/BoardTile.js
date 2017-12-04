import React from 'react';

export default class BoardTile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            letter: "",
            point: undefined
        }
    }

    handleTilePlace(evt) {
        if(this.props.placeTileMode) {
            evt.classList.add('glass');
            this.setState({
                letter: this.props.userLetter.letter, 
                point: this.props.userLetter.point
            });
            this.props.callBack(this.props.xCoord, this.props.yCoord);
        } else {
            evt.classList.remove('glass');
            this.setState({
                letter: "",
                point: undefined
            });
            this.props.callBack(this.props.xCoord, this.props.yCoord);
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