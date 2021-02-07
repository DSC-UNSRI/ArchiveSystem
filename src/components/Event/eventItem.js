import { Component } from 'react';

import { withFirebase } from '../Firebase';
import DocumentView from '../Document/documentView';
class EventItem extends Component {
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
                date: this.props.firebase.timestamp.fromDate(new Date(this.state.event.datelocale)),
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
                        <DocumentView match={{ url: `document/public/dokumentasi/${this.props.match.params.id}`, params: [`public/dokumentasi/${this.props.match.params.id}`] }} />
                        <button type="submit">Send</button>
                    </form>
                }
            </div>
        );
    }
}

export default withFirebase(EventItem);