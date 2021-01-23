import { Component } from 'react';

import { withFirebase } from '../Firebase';

class EventItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            images: [],
            event: null,
            ...props.location.state,
        };
    }

    componentDidMount() {
        this.props.firebase
            .getDocumentation(this.props.match.params.id)
            .list().then(result => {
                this.setState({
                    images: Array(result.items.length)
                })
                result.items.map((itm, index) => {
                    this.setState(prev => prev.images[index] = { ref: itm, image: null })
                    itm.getDownloadURL().then(url => this.setState(prev => prev.images[index].image = url))
                })
            })

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
        const { event, loading, images } = this.state;

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
                        <ul>
                            {(images && images.length > 0) &&
                                images.map(itm =>
                                    <li key={itm.ref.fullPath}>
                                        <img src={itm.image || 'http://via.placeholder.com/120x120?text=loading'} />
                                    </li>)}
                        </ul>
                    </div>
                )}
            </div>
        );
    }
}

export default withFirebase(EventItem);