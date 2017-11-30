import React from "react";

export default class Tile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    };

    render() {

        let letter = this.props.randomTile.letter;
        let point = this.props.randomTile.point;

        return (
            <div className="btn">
                {letter} {point}
            </div>
        );
    }
}