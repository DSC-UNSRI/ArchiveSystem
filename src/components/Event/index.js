import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { compose } from 'recompose';

import { withAuthorization } from '../Session';
import EventItemAdd from './eventAdd';
import EventItems from './eventItem';
import EventLists from './eventList';
import * as ROLES from '../../constants/roles';
import * as ROUTES from '../../constants/routes';

const EventPage = () => (
  <div>
    <h1>Laporan</h1>

    <Switch>
      <Route exact path={ROUTES.EVENT_ADD} component={EventItemAdd} />
      <Route exact path={ROUTES.EVENT_DETAILS} component={EventItems} />
      <Route exact path={ROUTES.EVENT} component={EventLists} />
    </Switch>
  </div>
);

const condition = authUser =>
  authUser && !!authUser.roles[ROLES.ADMIN];

export default compose(
  withAuthorization(condition),
)(EventPage);