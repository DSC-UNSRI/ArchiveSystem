import { Component } from 'react';
import { Link } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';

class Dashboard extends Component {
    render() {
        return (
            <div>
                <Link to={ROUTES.ADMIN}>Admin</Link>
            </div>
        )
    }
}

export default Dashboard;