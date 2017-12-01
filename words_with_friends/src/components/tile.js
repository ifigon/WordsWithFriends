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
        let tileStyles = {
            backgroundColor: "#D8B997",
            color: "#403E3E",
           // fontSize: "200%",
            margin: "5px",
            borderRadius: "3px",
            fontWeight: "bold"
        }

        let letter = this.props.randomTile.letter;
        let point = this.props.randomTile.point;

        return (
            <button onClick={() => this.handleTileSelect()} className="btn col-1" disabled={this.props.userTileSelected} style= {tileStyles} >
                {letter} {point}
            </button>
        );
    }
}