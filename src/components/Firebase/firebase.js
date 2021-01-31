import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import { createStore } from 'redux';

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
    this.timestamp = app.firestore.Timestamp;

    /* Firebase APIs */
    this.auth = app.auth();
    this.db = app.firestore();
    this.storage = app.storage();

    /* Social Sign In Method Provider */
    this.googleProvider = new app.auth.GoogleAuthProvider();

    /* Upload Monitor */
    this.uploadMonitor = createStore(this.uploadReducer);
  }

  // *** Auth API ***
  doSignInWithGoogle = () =>
    this.auth.signInWithPopup(this.googleProvider);

  doSignOut = () => this.auth.signOut();

  // *** Broadcast ***
  doPasswordReset = (email, action) => this.auth.sendPasswordResetEmail(email, { ...action, handleCodeInApp: true });

  // *** Merge Auth and DB User API *** //
  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        this.admin(authUser.uid).get()
          .then(admin => {
            let dbAdmin = admin.data();

            if (!dbAdmin) {
              dbAdmin = { roles: {} }
            }

            // merge auth and db user
            authUser = {
              uid: authUser.uid,
              email: authUser.email,
              emailVerified: authUser.emailVerified,
              providerData: authUser.providerData,
              ...dbAdmin
            };

            next(authUser);
          })
      } else {
        fallback();
      }
    });

  // *** Batch Write ***
  batch = () => this.db.batch();

  // *** User API ***
  user = uid => this.db.doc(`users/${uid}`);

  admin = uid => this.db.doc(`admins/${uid}`);

  users = () => this.db.collection('users');


  // *** Event API ***
  events = () => this.db.collection('events').withConverter({
    toFirestore: post => post,
    fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options);
      const calendar = new Date(data.date.seconds * 1000).toLocaleString().split(RegExp('\/|, '));
      const datelocale = calendar[2] + '-' + calendar[1] + '-' + calendar[0] + 'T' + calendar[3];
      return { ...data, datelocale };
    }
  });

  event = id => this.events().doc(id);

  eventMeta = id => this.db.doc(`events/${id}`).collection('private').doc('meta');


  // *** Upload API ***
  uploadReducer = (state = new Map(), action) => {
    switch (action.type) {
      case 'add':
        return state.set(action.id, action.data)
      case 'remove':
        state.delete(action.id)
        return state
      default:
        return state
    }
  }

  uploadTask = (upload, path, group = null) =>
    this.uploadMonitor.dispatch({
      type: 'add',
      id: path,
      data: {
        group,
        file: upload,
        task: this.storage.ref(path).put(upload),
        enums: {
          event: app.storage.TaskEvent,
          states: app.storage.TaskState
        }
      }
    });

  getDocumentation = id => this.storage.ref(`public/dokumentasi/${id}`)



  // *** Message API ***
  message = uid => this.db.doc(`messages/${uid}`);

  messages = () => this.db.collection('messages');
}

export default Firebase;
