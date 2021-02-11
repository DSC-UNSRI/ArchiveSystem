import React from 'react';
import { Link } from 'react-router-dom';

import { AuthUserContext } from '../Session';
import SignOutButton from '../SignOut';
import { SignInGoogle } from '../SignIn';
import * as ROUTES from '../../constants/routes';
import * as ROLES from '../../constants/roles';

const Navigation = () => (
  <AuthUserContext.Consumer>
    {authUser =>
      authUser ? (
        <NavigationAuth authUser={authUser} />
      ) : (
          <NavigationNonAuth />
        )
    }
  </AuthUserContext.Consumer>
);

const SideNavigationAuth = () => (
  <AuthUserContext.Consumer>
    {
      authUser =>
        (authUser && !!authUser.roles[ROLES.ADMIN]) && (
          <div className='sidebar'>
            <div className='container'>
              <Link to={ROUTES.DASHBOARD}>
                <button className='button-menu'>
                  Dashboard
                </button>
              </Link>
              <Link to={ROUTES.AGENDA}>
                <button className='button-menu'>
                  Laporan
                </button>
              </Link>
              <Link to={`${ROUTES.DOCUMENTS}/private`}>
                <button className='button-menu'>
                  Arsip Dokumen
                </button>
              </Link>
            </div>
          </div>
        )
    }
  </AuthUserContext.Consumer>
);

const NavigationAuth = ({ authUser }) => (
  <ul>
    <li>
      <Link to={ROUTES.LANDING}>Landing</Link>
    </li>
    <li>
      <Link to={ROUTES.HOME}>Home</Link>
    </li>
    <li>
      <Link to={ROUTES.ACCOUNT}>Account</Link>
    </li>
    {(authUser && !!authUser.roles[ROLES.ADMIN]) && (<li>
      <Link to={ROUTES.DASHBOARD}>Dashboard</Link>
    </li>)}
    <li>
      <SignOutButton />
    </li>
  </ul>
);

const NavigationNonAuth = () => (
  <ul>
    <li>
      <Link to={ROUTES.LANDING}>Landing</Link>
    </li>
    <li>
      <SignInGoogle />
    </li>
  </ul>
);

export default Navigation;

export { SideNavigationAuth }