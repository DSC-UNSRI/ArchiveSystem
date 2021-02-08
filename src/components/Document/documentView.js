import { Component } from 'react';
import { Link } from 'react-router-dom';

import { withFirebase } from '../Firebase';

class DocumentView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            files: [],
            folders: []
        }
    }

    getStorage = () => {
        this.props.firebase.store.dispatch({ type: 'changeURL', data: this.props.match.params[0] })
        this.setState({ loading: true })
        this.props.firebase.fetchStorage(this.props.match.params[0], this.props.match.params[0])
    }

    handleUpload = event => {
        const images = Array.from(event.target.files);
        if (images.length >= 0) {
            images.forEach(img => {
                this.props.firebase.uploadTask(img, `${this.props.match.params[0]}/${img.name}`, this.getStorage);
            });
        }
    }

    componentWillUnmount() {
        this.props.firebase.store.dispatch({ type: 'removeallStorage' })
        this.listener()
    }

    componentDidMount() {
        const store = this.props.firebase.store;
        this.listener = store.subscribe(() => {
            if (store.getState().storageURLReducer == this.props.match.params[0] && !store.getState().storageReducer.loading)
                this.setState({ loading: false, ...store.getState().storageReducer })
        })
        this.getStorage()
    }

    componentDidUpdate(prevProps) {
        if (prevProps.match.url != this.props.match.url)
            this.getStorage()
    }

    render() {
        const { loading, files, folders } = this.state;

        return <div>
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
            <div>{this.props.match.params[0]}</div>
            {loading
                ? <div>Loading...</div>
                : <div>
                    <ul>
                        {(folders && folders.length > 0) &&
                            folders.map(itm =>
                                <li key={itm.fullPath}>
                                    <Link to={{
                                        pathname: `${this.props.match.url.endsWith('/')
                                            ? this.props.match.url
                                            : this.props.match.url + '/'}${itm.name}`
                                    }}>
                                        {itm.name}
                                    </Link>
                                </li>)}
                    </ul>
                    <ul>
                        {(files && files.length > 0) &&
                            files.map(itm =>
                                <li key={itm.ref.fullPath}>
                                    {itm.ref.name}
                                </li>)}
                    </ul>
                </div>
            }
        </div>
    }
}

export default withFirebase(DocumentView);