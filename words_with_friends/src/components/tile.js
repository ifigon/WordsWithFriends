import React from "react";

export default class Tile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    };

    render() {

        let letter = this.props.tiles.letter;
        let point = this.props.tiles.point;

        return (
            <div className="btn">
                {letter} {point}
            </div>
        );
    }
}