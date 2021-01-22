import React from 'react';

import { withFirebase } from '../Firebase';
import './monitor';
import Monitor from './monitor';

class UploadMonitor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            Uploads: null
        }
    }

    componentDidMount() {
        const monitorListener = this.props.firebase.uploadMonitor;
        this.listener = monitorListener.subscribe(() => {
            this.setState({
                Uploads: monitorListener.getState()
            })
        })
    }

    componentWillUnmount() {
        this.listener();
    }

    renderMonitors() {
        const { Uploads } = this.state;
        const monitors = [];
        {
            Uploads && Uploads.forEach((value, key) => monitors.push(
                <Monitor id={key} upload={value} />
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

export default withFirebase(UploadMonitor);