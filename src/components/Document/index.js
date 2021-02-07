import React from 'react';
import { Switch, Route, Redirect, Link } from 'react-router-dom';
import { compose } from 'recompose';

import { withAuthorization } from '../Session';

import documentView from './documentView';
import * as ROLES from '../../constants/roles';
import * as ROUTES from '../../constants/routes';

const DocumentPage = () => (
        <div>
            <h1>Arsip Dokumen</h1>
            <p>
                <Link to={`${ROUTES.DOCUMENTS}/private`}>
                    private
                </Link>
            </p>
            <p>
                <Link to={`${ROUTES.DOCUMENTS}/public`}>
                    public
                </Link>
            </p>
            <Switch>
                <Redirect exact from={`${ROUTES.DOCUMENTS}/`} to={`${ROUTES.DOCUMENTS}/private`} />
                <Route exact path={ROUTES.DOCUMENT} component={documentView} />
            </Switch>
        </div>
    );

const condition = authUser =>
    authUser && !!authUser.roles[ROLES.ADMIN];

export default compose(
    withAuthorization(condition)
)(DocumentPage);