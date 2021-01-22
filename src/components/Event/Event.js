import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { AuthUserContext } from '../Session';
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
                <th>
                  No.
                </th>
                <th>
                  Judul Laporan
                </th>
                <th>
                  Tanggal
                </th>
                <th>
                  Aksi
                </th>
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
                      Details
                        </Link>
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

const EventLists = withFirebase(EventList);

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
    if (this.state.event) {
      return;
    }

    this.setState({ loading: true });

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

  render() {
    const { event, loading } = this.state;

    return (
      <div>
        <h2>Detail Laporan: ({this.props.match.params.id})</h2>
        {loading && <div>Loading ...</div>}

        {event && (
          <div>
            <span>
              <strong>Created:</strong> {new Date(event.createdAt.seconds * 1000).toLocaleString()}
            </span>
            <span>
              <strong>Nama:</strong> {event.name}
            </span>
            <span>
              <strong>Tanggal:</strong> {new Date(event.date.seconds * 1000).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    );
  }
}

const EventItems = withFirebase(EventItem);

class EventAdd extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      date: '',
      images: []
    };
  }

  onCreateEvent = (event, authUser) => {
    event.preventDefault();

    this.props.firebase.events().add({
      name: this.state.name,
      date: this.props.firebase.timestamp.fromDate(new Date(this.state.date)),
      createdAt: this.props.firebase.fieldValue.serverTimestamp(),
    })
    .then(doc => {
      return this.props.firebase.eventMeta(doc.id).set({
        userId: authUser.uid,
        userName: authUser.providerData[0].displayName
      });
    });

    if(this.state.images.length >= 0){
      this.state.images.forEach(img => {
        this.props.firebase.uploadTask(img, `dokumentasi/${img.name}`,function(url){});
      });
    }

    this.setState({
      name: '',
      date: '',
      images: []
    });

    return false;
  };

  handleFile = event => {
      this.setState({
        images: [...event.target.files]
      });
  }

  render() {
    const { name, date } = this.state;

    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <div>
            <h2>Tambah Laporan</h2>
            <form
              onSubmit={event =>
                this.onCreateEvent(event, authUser)
              }
            >
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
              <input
                type="file"
                onChange={this.handleFile}
                multiple
              />
              <button type="submit">Send</button>
            </form>
          </div>)}
      </AuthUserContext.Consumer>
    );
  }
}

const EventItemAdd = withFirebase(EventAdd);

export { EventLists, EventItems, EventItemAdd };
