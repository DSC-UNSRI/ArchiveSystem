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
        this.setState({ loading: true, files: [], folders: [] })
        const urlNow = this.props.match.url;
        this.props.firebase.getStorage(this.props.match.params[0])
            .list().then(result => {
                const files = []
                result.items.map((itm, index) => {
                    files[index] = { ref: itm, dataurl: null }
                    itm.getDownloadURL().then(url => files[index].dataurl = url)
                })
                if (urlNow == this.props.match.url) {
                    this.setState({ loading: false, folders: result.prefixes, files })
                }
            })
    }

    handleUpload = event => {
        const images = Array.from(event.target.files);
        if (images.length >= 0) {
            images.forEach(img => {
                this.props.firebase.uploadTask(img, `${this.props.match.params[0]}/${img.name}`, this.getStorage);
            });
        }
    }

    componentWillUnmount(){
        
    }

    componentDidMount() {
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