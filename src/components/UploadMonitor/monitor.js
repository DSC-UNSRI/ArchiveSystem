import React from 'react';

class Monitor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            progress: 0,
            mode: null
        }
    }

    cancelMonitor = () => {
        this.props.upload.task.cancel()
        this.props.removeFun(this.props.id)
    }

    removeMonitor = () => this.props.removeFun(this.props.id)

    reupload = () => this.props.reuploadFun(this.props.id, this.props.upload.file)

    componentDidMount() {
        this.listener = this.props.upload.task.on(
            this.props.enums.event.STATE_CHANGED,
            snapshot => {
                this.setState({
                    progress: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
                    mode: snapshot.state
                });
            },
            error => {
                this.setState({
                    mode: this.props.enums.states.ERROR
                });
            },
            complete => {
                this.setState({
                    mode: this.props.enums.states.SUCCESS
                });
                this.listener()
                this.props.callback()
            }
        )
    }

    componentWillUnmount() {
        this.listener()
    }

    render() {
        const { progress, mode } = this.state;
        return (
            <li key={this.props.id}>
                <p>{this.props.upload.file.name}: {progress}%</p>
                <p>{mode}</p>
                {(mode == this.props.enums.states.RUNNING) && (<button onClick={this.cancelMonitor}>Cancel</button>)}
                {(mode == this.props.enums.states.SUCCESS) && (<button onClick={this.removeMonitor}>X</button>)}
                {(mode == this.props.enums.states.ERROR) && (<button onClick={this.reupload}>Retry</button>)}
            </li>
        )
    }
}

export default Monitor;