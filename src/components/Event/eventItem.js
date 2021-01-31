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
        this.setState({ loading: true });

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

    handleUpload = event => {
        const images = Array.from(event.target.files);
        if (images.length >= 0) {
            images.forEach(img => {
                this.props.firebase.uploadTask(img, `public/dokumentasi/${this.props.match.params.id}/${img.name}`, this.props.match.params.id);
            });
        }
    }

    render() {
        const { loading, event, images } = this.state;
        //console.log(event.date)

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
                        <div>
                            <ul>
                                {(images && images.length > 0) &&
                                    images.map(itm =>
                                        <li key={itm.ref.fullPath}>
                                            <img src={itm.image || 'http://via.placeholder.com/120x120?text=loading'} />
                                        </li>)}
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

export default withFirebase(EventItem);