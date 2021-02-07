import { Component } from 'react';
import { Link } from 'react-router-dom';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

class EventList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            events: [],
        };
    }

    componentDidMount() {
        this.getEvents();
    }

    getEvents() {
        this.setState({ loading: true });

        this.unsubscribe = this.props.firebase
            .events()
            .orderBy('date', 'desc')
            .onSnapshot(snapshot => {
                if (snapshot.size) {
                    let events = [];

                    snapshot.forEach(doc =>
                        events.push({ ...doc.data(), id: doc.id }),
                    );

                    this.setState({
                        events: events,
                        loading: false,
                    });
                } else {
                    this.setState({
                        events: null,
                        loading: false,
                    });
                }
            });
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    render() {
        const { loading, events } = this.state;

        return (
            <div>
                <h2>Daftar Laporan</h2>
                <Link
                    to={{
                        pathname: `${ROUTES.EVENT_ADD}`,
                    }}
                >
                    Tambah Laporan
              </Link>
                {loading && <div>Loading ...</div>}
                {(!loading && events) &&
                    <table>
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Judul Laporan</th>
                                <th>Tanggal</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((event, index) => (
                                <tr key={event.id}>
                                    <td>
                                        {index + 1}
                                    </td>
                                    <td>
                                        {event.name}
                                    </td>
                                    <td>
                                        {new Date(event.date.seconds * 1000).toLocaleString()}
                                    </td>
                                    <td>
                                        <Link
                                            to={{
                                                pathname: `${ROUTES.EVENT}/${event.id}`,
                                                state: { event },
                                            }}
                                        >
                                            Edit
                                        </Link>
                                        <button onClick={
                                            e => this.props.firebase.event(event.id).delete()
                                        }>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>}
                {!events && <div>There are no events ...</div>}
            </div>
        );
    }
}

export default withFirebase(EventList);