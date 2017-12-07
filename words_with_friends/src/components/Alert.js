/** 
 * Used as an alert each time a turn ends to update the user with what happened
 * during the turn, such as whether it was a valid or invalid turn or whether
 * the user shuffled their tiles
 */

import React from 'react';

export default class Alert extends React.Component {
    render() {
        if(!this.props.shuffledLastTurn) {
            return (
                <div className='alert alert-primary text-center mb-0'>
                    {this.props.username} played <span className='yellow-text'>{this.props.word}</span> for {this.props.points}
                </div>
            );
        } else {
            return(
                <div className='alert alert-warning text-center mb-0'>
                    {this.props.username} shuffled their tiles
                </div>
            );
        }
    }
}