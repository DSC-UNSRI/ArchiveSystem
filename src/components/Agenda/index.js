import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { compose } from 'recompose';

import { withAuthorization } from '../Session';
import AgendaItemAdd from './agendaAdd';
import AgendaItems from './agendaItem';
import AgendaLists from './agendaList';
import * as ROLES from '../../constants/roles';
import * as ROUTES from '../../constants/routes';

const AgendaPage = () => (
  <div className='main-content'>
    <Switch>
      <Route exact path={ROUTES.AGENDA_ADD} component={AgendaItemAdd} />
      <Route exact path={ROUTES.AGENDA_DETAILS} component={AgendaItems} />
      <Route exact path={ROUTES.AGENDA} component={AgendaLists} />
    </Switch>
  </div>
);

const condition = authUser =>
  authUser && !!authUser.roles[ROLES.ADMIN];

export default compose(
  withAuthorization(condition),
)(AgendaPage);