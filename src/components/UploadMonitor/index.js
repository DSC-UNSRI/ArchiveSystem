import { Component } from 'react';

import { withFirebase } from '../Firebase';
import Monitor from './monitor';

class UploadMonitor extends Component {
    constructor(props) {
        super(props);

        this.state = {
            uploads: null
        }
    }

    componentDidMount() {
        const monitorListener = this.props.firebase.uploadMonitor;
        this.listener = monitorListener.subscribe(() => {
            this.setState({
                uploads: monitorListener.getState()
            })
        })
    }

    componentWillUnmount() {
        this.listener();
    }

    removeMonitor = id => {
        this.props.firebase.uploadMonitor.dispatch({
            type: 'remove',
            id
        });
    }

    reupload = (id, file, group) => this.props.firebase.uploadTask(file, id, group)

    renderMonitors() {
        const { uploads } = this.state;
        const monitors = [];
        {
            (uploads && uploads.size > 0) && uploads.forEach((value, key) => monitors.push(
                <Monitor key={key} id={key} upload={value}
                    removeFun={this.removeMonitor}
                    reuploadFun={this.reupload} />
            ))
        }
        return monitors;
    }

    render() {
        return (
            <div>
                <ul>
                    {this.renderMonitors()}
                </ul>
            </div>
        )
    }
}

export {Monitor};

export default withFirebase(UploadMonitor);