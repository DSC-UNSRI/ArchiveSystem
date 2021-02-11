import AdminPage from '../Admin';
import AgendaPage from '../Agenda';
import Document from '../Document';
import DashboardPage from './dashboard';
import { SideNavigationAuth } from '../Navigation';

import { Switch, Route } from 'react-router-dom';
import { withAuthentication } from '../Session';
import * as ROUTES from '../../constants/routes';

const Dashboard = () => (
    <div className='main'>
        <SideNavigationAuth />
        <Switch>
            <Route exact path={ROUTES.DASHBOARD} component={DashboardPage} />
            <Route path={ROUTES.ADMIN} component={AdminPage} />
            <Route path={ROUTES.AGENDA} component={AgendaPage} />
            <Route path={ROUTES.DOCUMENTS} component={Document} />
        </Switch>
    </div>
)

export default withAuthentication(Dashboard);