import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Navigation from '../Navigation';
import LandingPage from '../Landing';
import HomePage from '../Home';
import AccountPage from '../Account';
import UploadMonitor from '../UploadMonitor';
import Dashboard from '../Dashboard';

import * as ROUTES from '../../constants/routes';
import { withAuthentication } from '../Session';

const App = () => (
  <Router>
    <Navigation />

    <hr />
    <Route exact path={ROUTES.LANDING} component={LandingPage} />
    <Route path={ROUTES.HOME} component={HomePage} />
    <Route path={ROUTES.ACCOUNT} component={AccountPage} />
    <Route path={ROUTES.DASHBOARD} component={Dashboard} />
    <UploadMonitor />
  </Router>
);

export default withAuthentication(App);
