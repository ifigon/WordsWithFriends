import React from 'react';
import firebase from 'firebase/app';
import { Redirect } from 'react-router-dom';
import constants from './constants';

export default class InGameView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    handleTilePlace() {
        console.log(this.props.xCoord + " " + this.props.yCoord);
        this.props.callBack(this.props.xCoord, this.props.yCoord);
    }

    render() {
        return (
            <div className="col-1 p-0 tile-button">
                <button onClick={() => this.handleTilePlace()} className="w-100 h-100"></button>
            </div>
        )
    }
}