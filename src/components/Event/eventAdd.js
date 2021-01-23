import { Component } from 'react';
import { compose } from 'recompose';

import { consumeAuthentication } from '../Session';
import { withFirebase } from '../Firebase';
import { Monitor } from '../UploadMonitor';

class EventAdd extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            name: 'Tidak Ada Judul',
            date: new Date().toISOString(),
            uploads: null,
            doc: null
        };
    }

    componentDidMount() {
        this.setState({ loading: true })
        const monitorListener = this.props.firebase.uploadMonitor;
        this.listener = monitorListener.subscribe(() => {
            this.setState({
                uploads: monitorListener.getState()
            })
        })
        this.props.firebase.events().add({
            name: this.state.name,
            date: this.props.firebase.timestamp.fromDate(new Date(this.state.date)),
            createdAt: this.props.firebase.fieldValue.serverTimestamp(),
        }).then(doc => {
            this.props.firebase.eventMeta(doc.id).set({
                userId: this.props.authUser.uid,
                userName: this.props.authUser.providerData[0].displayName
            });
            this.setState({
                loading: false,
                doc
            })
        });
    }

    componentWillUnmount() {
        this.listener();
    }

    onCreateEvent = event => {
        event.preventDefault();

        this.state.doc.set({
            name: this.state.name,
            date: this.props.firebase.timestamp.fromDate(new Date(this.state.date)),
        }, { merge: true })

        return false;
    };

    handleUpload = event => {
        const images = Array.from(event.target.files);
        if (images.length >= 0) {
            images.forEach(img => {
                this.props.firebase.uploadTask(img, `public/dokumentasi/${this.state.doc.id}/${img.name}`, this.state.doc.id);
            });
        }
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
            (uploads && uploads.size > 0) && uploads.forEach((value, key) => (value.group == this.state.doc.id) && 
            monitors.push(
                <Monitor key={key} id={key} upload={value}
                    removeFun={this.removeMonitor}
                    reuploadFun={this.reupload} />
            ))
        }
        return monitors;
    }

    render() {
        const { name, date, loading, doc, uploads } = this.state;

        return (
            <div>
                <h2>Tambah Laporan</h2>
                {loading && <div>Loading ...</div>}
                {(!loading && doc) &&
                    <form onSubmit={this.onCreateEvent}>
                        <input
                            type="text"
                            value={name}
                            onChange={event => this.setState({
                                name: event.target.value
                            })}
                        />
                        <input
                            type="datetime-local"
                            value={date}
                            onChange={event => this.setState({
                                date: event.target.value
                            })}
                        />
                        <div>
                            <ul>
                                {this.renderMonitors()}
                            </ul>
                            <input
                                id="inputfile"
                                type="file"
                                onChange={this.handleUpload}
                                multiple
                                hidden
                            />
                            <label htmlFor="inputfile">
                                <p>Choose File</p>
                            </label>
                        </div>
                        <button type="submit">Send</button>
                    </form>
                }
            </div>
        );
    }
}

export default compose(
    withFirebase,
    consumeAuthentication)(EventAdd);