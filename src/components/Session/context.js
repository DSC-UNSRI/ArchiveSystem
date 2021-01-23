import React from 'react';

const AuthUserContext = React.createContext(null);

export const consumeAuthentication = Component => props => (
    <AuthUserContext.Consumer>
        {authUser => <Component {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>
);

export default AuthUserContext;
