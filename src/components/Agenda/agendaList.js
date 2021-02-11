import { Component } from 'react';
import { Link } from 'react-router-dom';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

class AgendaList extends Component {
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
            <>
                <div className='left-side'>
                    <Link
                        to={{
                            pathname: `${ROUTES.AGENDA_ADD}`,
                        }}
                    >
                        <button className="button-add">
                            <p><b>Add Agenda</b></p>
                            <span className="material-icons">add</span>
                        </button>
                    </Link>
                </div>
                <div className='right-side'>
                    <div className='nav-right-side'>
                        <div className="child">
                            <p><b>May 2021</b></p>
                            <span className="material-icons" style={{ fontSize: '1.5em' }}>arrow_drop_down</span>
                        </div>
                        <div className="inputan">
                            <span className="material-icons" style={{ padding: '10px' }}>search</span>
                            <input type="text" placeholder="Search Agenda..." />
                            <span className="material-icons" style={{ fontSize: '1.5em' }}>arrow_drop_down</span>
                        </div>
                    </div>
                    <div className='content-right-side'>
                        {loading && <div>Loading ...</div>}
                        {(!loading && events) &&
                            <div className='container-content'>
                                <div className="top-content">
                                    <p><b>TODAY 1/05/21</b></p>
                                </div>
                                {events.map(event => (
                                    <div className='date-content' key={event.id}>
                                        <input type="checkbox" className="checkbox" />
                                        <div className='jam'>
                                            <p><b>{new Date(event.date.seconds * 1000).toLocaleString()}</b></p>
                                        </div>
                                        <div className='title'>
                                            <p><b>{event.name}</b></p>
                                        </div>
                                        <div className="link">
                                            <p><b>{event.registrationLink}</b></p>
                                        </div>
                                        <div className='action'>
                                            <Link
                                                to={{
                                                    pathname: `${ROUTES.AGENDA}/${event.id}`,
                                                    state: { event },
                                                }}
                                            >
                                                <button id='button'>
                                                    <span className="material-icons">border_color</span>
                                                </button>
                                            </Link>
                                            <button id='button' onClick={
                                                e => {
                                                    this.props.firebase.batch()
                                                    .delete(this.props.firebase.eventMeta(event.id))
                                                    .delete(this.props.firebase.event(event.id))
                                                    .commit()
                                                }
                                            }>
                                                <span className="material-icons">delete_outline</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>}
                        {!events && <div>There are no events ...</div>}
                    </div>
                </div>
            </>
        );
    }
}

export default withFirebase(AgendaList);