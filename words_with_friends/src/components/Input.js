import React from 'react';

export default class Input extends React.Component {
    render() {
        return (
            <div className='form-group'>
                <label htmlFor={this.props.for}>{this.props.title}:</label>
                <input id={this.props.id}
                    type={this.props.type}
                    className='form-control'
                    placeholder={this.props.placeholder}
                    value={this.props.value}
                    onInput={evt => this.props.onInput(evt)} required />
                    <div className='invalid-feedback'>Please provide a valid {this.props.id}.</div>
            </div>
        );
    }
}