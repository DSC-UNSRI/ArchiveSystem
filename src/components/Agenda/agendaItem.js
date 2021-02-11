import { Component } from 'react';

import { withFirebase } from '../Firebase';
import DocumentView from '../Document/documentView';
class AgendaItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            event: null,
            ...props.location.state,
        };
    }

    componentDidMount() {
        this.setState({ loading: true });

        if (this.state.event) {
            this.setState({ loading: false });
            return;
        }

        this.unsubscribe = this.props.firebase
            .event(this.props.match.params.id)
            .onSnapshot(snapshot => {
                this.setState({
                    event: snapshot.data(),
                    loading: false,
                });
            });
    }

    componentWillUnmount() {
        this.unsubscribe && this.unsubscribe();
    }

    onCreateEvent = event => {
        event.preventDefault();

        this.props.firebase.event(this.props.match.params.id)
            .set({
                name: this.state.event.name,
                registrationLink: this.state.event.registrationLink,
                description: this.state.event.description,
                date: this.props.firebase.timestamp.fromDate(new Date(this.state.event.datelocale)),
                progress: this.state.event.progress
            }, { merge: true })

        return false;
    };

    render() {
        const { loading, event } = this.state;

        return (
            <div>
                <h2>Tambah Laporan</h2>
                {loading && <div>Loading ...</div>}
                {(!loading && event) &&
                    <form onSubmit={this.onCreateEvent}>
                        <input
                            type="text"
                            value={event.name}
                            onChange={event => this.setState(prev => ({
                                event: {
                                    ...prev.event,
                                    name: event.target.value
                                }
                            }))}
                        />
                        <input
                            type="datetime-local"
                            value={event.datelocale}
                            onChange={event => this.setState(prev => ({
                                event: {
                                    ...prev.event,
                                    datelocale: event.target.value
                                }
                            }))}
                        />
                        <input
                            type="text"
                            value={event.registrationLink}
                            onChange={event => this.setState(prev => ({
                                event: {
                                    ...prev.event,
                                    registrationLink: event.target.value
                                }
                            }))}
                        />
                        <textarea value={event.description} onChange={event => this.setState(prev => ({
                            event: {
                                ...prev.event,
                                description: event.target.value
                            }
                        }))} />
                        <input type="checkbox" className="checkbox" checked={event.progress} onChange={event => this.setState(prev => ({
                            event: {
                                ...prev.event,
                                progress: event.target.checked
                            }
                        }))} />
                        <button type="submit">Send</button>
                        <DocumentView match={{ url: `document/public/dokumentasi/${this.props.match.params.id}`, params: [`public/dokumentasi/${this.props.match.params.id}`] }} />
                    </form>
                }
            </div>
        );
    }
}

export default withFirebase(AgendaItem);