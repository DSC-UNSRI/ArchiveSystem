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
            if (store.getState().storageConfigReducer.URL == this.props.match.params[0]
                && !store.getState().storageConfigReducer.loading
                && store.getState().storageConfigReducer.loadingType == 'storage')
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

        return <div className='right-side'>
            <div className='nav-right-side'>
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
            </div>
            {loading
                ? <div>Loading...</div>
                : <div className='content-right-side'>
                    <div className='storage-container-content'>
                        {(folders && folders.length > 0) &&
                            folders.map(itm =>
                                <Link key={itm.fullPath} to={{
                                    pathname: `${this.props.match.url.endsWith('/')
                                        ? this.props.match.url
                                        : this.props.match.url + '/'}${itm.name}`
                                }}>
                                    <button className='button-add'><p><b>{itm.name}</b></p></button>
                                </Link>
                            )}
                    </div>
                    {(files && files.length > 0) &&
                        <div className='storage-container-content'>
                            {files.map(itm =>
                                <div className='storage-content' key={itm.ref.fullPath}>
                                    <a href={itm.dataurl}>
                                        <div className='leading' style={{ backgroundImage: `url(${itm.metadata.contentType.split('/')[0] == 'image' ? itm.dataurl : 'http://via.placeholder.com/160x160?text=image'})` }}></div>
                                        <p>{itm.ref.name}</p>
                                    </a>
                                    <button onClick={
                                        e => this.props.firebase.getStorage(itm.ref.fullPath).delete()
                                            .then(value => this.props.firebase.store.dispatch({ type: 'notifyStorage', data: 'getStorage' }))
                                    }>
                                        Delete
                                    </button>
                                    <p>{itm.metadata.contentType}</p>
                                </div>)}
                        </div>}
                </div>
            }
        </div>
    }
}

export default withFirebase(DocumentView);