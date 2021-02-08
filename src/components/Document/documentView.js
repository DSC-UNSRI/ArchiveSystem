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
        this.props.firebase.store.dispatch({ type: 'changeStorageURL', data: this.props.match.params[0] })
        this.setState({ loading: true })
        this.props.firebase.fetchStorage(this.props.match.params[0], this.props.match.params[0])
    }

    handleUpload = event => {
        const images = Array.from(event.target.files);
        if (images.length >= 0) {
            images.forEach(img => {
                this.props.firebase.uploadTask(img, `${this.props.match.params[0]}/${img.name}`);
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
            if (store.getState().storageConfigReducer.notify
                && store.getState().storageConfigReducer.URL == this.props.match.params[0]) {
                store.dispatch({ type: 'notifyStorageOff' })
                switch (store.getState().storageConfigReducer.notifierType) {
                    case 'updateStorage':
                        return this.setState({ ...store.getState().storageReducer })
                    case 'getStorage':
                        return this.getStorage()
                }
            }
            if (store.getState().storageConfigReducer.URL == this.props.match.params[0] && !store.getState().storageReducer.loading)
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
                    {(files && files.length > 0) &&
                        <table>
                            <thead>
                                <th>No.</th>
                                <th>Nama File</th>
                                <th>Tipe File</th>
                                <th>Aksi</th>
                            </thead>
                            <tbody>
                                {files.map((itm, index) =>
                                    <tr key={itm.ref.fullPath}>
                                        <td>{index + 1}</td>
                                        <td>{itm.ref.name}</td>
                                        <td>
                                            {
                                                (() => {
                                                    if (itm.metadata != null) {
                                                        const type = itm.metadata.contentType.split('/');
                                                        switch (type[0]) {
                                                            case 'image':
                                                                return <img src={itm.dataurl} height='100' />
                                                            default:
                                                                return <p>{itm.metadata.contentType}</p>
                                                        }
                                                    }
                                                })()
                                            }
                                        </td>
                                        <td>
                                            <button onClick={
                                                e => this.props.firebase.getStorage(itm.ref.fullPath).delete()
                                                    .then(value => this.props.firebase.store.dispatch({ type: 'notifyStorage', data: 'getStorage' }))
                                            }>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>)}
                            </tbody>
                        </table>}
                </div>
            }
        </div>
    }
}

export default withFirebase(DocumentView);