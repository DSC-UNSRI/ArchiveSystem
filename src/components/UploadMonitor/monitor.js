import React from 'react';

class Monitor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            progress: 0,
            mode: null
        }
    }

    componentDidMount() {
        this.listener = this.props.upload.task.on(
            this.props.upload.enum.event.STATE_CHANGED,
            snapshot => {
                this.setState({
                    progress: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
                    mode: this.props.upload.enum.states.RUNNING
                });
            },
            error => {
                this.setState({
                    mode: this.props.upload.enum.states.ERROR
                });
            },
            complete => {
                this.setState({
                    mode: this.props.upload.enum.states.SUCCESS
                });
            }
        )
    }

    componentWillUnmount() {
        this.listener()
    }

    render() {
        const { progress } = this.state;
        return (
            <li key={this.id}>
                <p>{this.props.id}: {progress}%</p>
                <button></button>
            </li>
        )
    }
}

export default Monitor;