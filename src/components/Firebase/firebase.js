import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
};

class Firebase {
  constructor() {
    app.initializeApp(config);

    /* Helper */

    this.fieldValue = app.firestore.FieldValue;

    /* Firebase APIs */

    this.auth = app.auth();
    this.db = app.firestore();

    /* Social Sign In Method Provider */

    this.googleProvider = new app.auth.GoogleAuthProvider();
  }

  // *** Auth API ***
  doSignInWithGoogle = () =>
    this.auth.signInWithPopup(this.googleProvider);

  doSignOut = () => this.auth.signOut();

  // *** Merge Auth and DB User API *** //

  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        Promise.all([
          this.user(authUser.uid).get(),
          this.admin(authUser.uid).get()])
        .then(([user, admin]) => {
          const dbUser = user.data();
          let dbAdmin = admin.data();

          if (!dbAdmin) {
            dbAdmin = {}
          } else if (!dbAdmin.roles){
            dbAdmin.roles = {};
          }

            // merge auth and db user
            authUser = {
              uid: authUser.uid,
              email: authUser.email,
              emailVerified: authUser.emailVerified,
              providerData: authUser.providerData,
              ...dbUser,
              ...dbAdmin
            };

            next(authUser);
        })
      } else {
        fallback();
      }
    });

  // *** User API ***

  user = uid => this.db.doc(`users/${uid}`);

  admin = uid => this.db.doc(`admins/${uid}`);

  users = () => this.db.collection('users');
  
  
  // *** Event API ***

  events = () => this.db.collection('events');
  
  event = id => this.db.doc(`events/${id}`);

  // *** Message API ***

  message = uid => this.db.doc(`messages/${uid}`);

  messages = () => this.db.collection('messages');
}

export default Firebase;
