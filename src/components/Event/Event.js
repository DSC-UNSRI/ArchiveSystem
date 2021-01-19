import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { AuthUserContext } from '../Session';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

class EventList extends Component {
  constructor(props) {
    super(props);

    this.state = {
        data: {
            name: '',
            date: '',
        },
        loading: false,
        events: [],
    };
  }

  componentDidMount() {
    this.setState({ loading: true });

    this.unsubscribe = this.props.firebase
      .events()
      .onSnapshot(snapshot => {
        let events = [];

        snapshot.forEach(doc =>
            events.push({ ...doc.data(), id: doc.id }),
        );

        this.setState({
            events,
            loading: false,
        });
      });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onCreateEvent = (event, authUser) => {
    this.props.firebase.events().add({
      name: this.state.data.name,
      date: this.state.data.date,
      userId: authUser.uid,
      createdAt: this.props.firebase.fieldValue.serverTimestamp(),
    });

    this.setState({ data: {
        name: '',
        date: '',
    } });

    event.preventDefault();
  };

  render() {
    const { data, loading, events } = this.state;

    return (
    <AuthUserContext.Consumer>
    {authUser => (
      <div>
        <h2>Users</h2>
        {loading && <div>Loading ...</div>}
        <ul>
          {events.map(event => (
            <li key={event.id}>
              <span>
                <strong>ID:</strong> {event.id}
              </span>
              <span>
                <strong>Nama:</strong> {event.name}
              </span>
              <span>
                <strong>Tanggal:</strong> {event.date}
              </span>
              <span>
                <Link
                  to={{
                    pathname: `${ROUTES.EVENT}/${event.id}`,
                    state: { event },
                  }}
                >
                  Details
                </Link>
              </span>
            </li>
          ))}
        </ul>
        {!events && <div>There are no events ...</div>}

            <form
              onSubmit={event =>
                this.onCreateEvent(event, authUser)
              }
            >
              <input
                type="text"
                value={data.name}
                onChange={event => this.setState(prev => ({...prev, data:{
                    ...prev.data,
                    name: event.target.value
                }}))}
              />
              <input
                type="date"
                value={data.date}
                onChange={event => this.setState(prev => ({...prev, data:{
                    ...prev.data,
                    date: event.target.value
                }}))}
              />
              <button type="submit">Send</button>
            </form>
      </div>)}
    </AuthUserContext.Consumer>
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
          <h2>User ({this.props.match.params.id})</h2>
          {loading && <div>Loading ...</div>}
  
          {event && (
            <div>
              <span>
                <strong>ID:</strong> {event.id}
              </span>
              <span>
                <strong>Nama:</strong> {event.name}
              </span>
              <span>
                <strong>Tanggal:</strong> {event.date}
              </span>
            </div>
          )}
        </div>
      );
    }
  }

const EventItems = withFirebase(EventItem);

export {EventLists, EventItems};
