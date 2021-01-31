import { Component } from 'react';
import { compose } from 'recompose';
import { Redirect } from 'react-router-dom';

import { consumeAuthentication } from '../Session';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

class EventAdd extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            event: {
                name: 'Tidak Ada Judul',
                date: new Date().toISOString().split(':')[0] + ':00:00'
            },
            doc: null
        };
    }

    componentDidMount() {
        this.setState({ loading: true })
        this.props.firebase.events().add({
            name: this.state.event.name,
            date: this.props.firebase.timestamp.fromDate(new Date(this.state.event.date)),
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

    render() {
        const { loading, doc, event } = this.state;

        if (!loading && doc) {
            const events = { ...event, id: doc.id, datelocale: event.date }
            return (
                <Redirect to={{
                    pathname: `${ROUTES.EVENT}/${doc.id}`,
                    state: { event: events },
                }} />
            );
        }
        return (
            <div>
                <h2>Menambah Laporan</h2>
                <div>Loading ...</div>
            </div>
        );
    }
}

export default compose(
    withFirebase,
    consumeAuthentication)(EventAdd);