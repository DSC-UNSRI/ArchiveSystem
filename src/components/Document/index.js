import React from 'react';
import { Switch, Route, Redirect, Link } from 'react-router-dom';
import { compose } from 'recompose';

import { withAuthorization } from '../Session';

import documentView from './documentView';
import * as ROLES from '../../constants/roles';
import * as ROUTES from '../../constants/routes';

const DocumentPage = () => (
    <div className='main-content'>
        <div className='left-side'>
            <p>
                <Link to={`${ROUTES.DOCUMENTS}/private`}>
                    <button className='button-add'>
                        <p><b>private</b></p>
                        <span className="material-icons">arrow_right</span>
                    </button>
                </Link>
            </p>
            <p>
                <Link to={`${ROUTES.DOCUMENTS}/public`}>
                    <button className='button-add'>
                        <p><b>public</b></p>
                        <span className="material-icons">arrow_right</span>
                    </button>
                </Link>
            </p>
        </div>
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