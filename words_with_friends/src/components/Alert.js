import React from 'react';

export default class Alert extends React.Component {
    render() {
        return (
            <div className='alert alert-primary text-center mb-0'>
                {this.props.username} played <span className='yellow-text'>{this.props.word}</span> for {this.props.points}
            </div>
        );
    }
}