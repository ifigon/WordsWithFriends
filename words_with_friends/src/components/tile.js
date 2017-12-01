import React from "react";

export default class Tile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    };
    
    handleTileSelect() {
        this.props.callBack(this.props.randomTile);
    }

    render() {
        let letter = this.props.randomTile.letter;
        let point = this.props.randomTile.point;

        return (
            <button onClick={() => this.handleTileSelect()} className="btn col-1 glass" disabled={this.props.userTileSelected} >
                {letter}<sup>{point}</sup>
            </button>
        );
    }
}