import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import store from '../../redux';

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
    this.store = store();

    this.taskEnums = {
      event: app.storage.TaskEvent,
      states: app.storage.TaskState
    }
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
  uploadTask = (upload, path, callback) =>
    this.store.dispatch({
      type: 'add',
      id: path,
      data: {
        callback,
        file: upload,
        task: this.getStorage(path).put(upload),
      }
    });

  getStorage = path => this.storage.ref(path);

  fetchStorage = (path, url) => {
    this.getStorage(path)
      .list().then(result => {
        if (this.store.getState().storageURLReducer == url) {
          this.store.dispatch({ type: 'storageLoading' })
          this.store.dispatch({
            type: 'addFolder',
            data: result.prefixes
          })
          this.store.dispatch({
            type: 'addFiles',
            data: result.items.map(itm => {
              const file = { ref: itm, dataurl: null }
              itm.getDownloadURL().then(url => file.dataurl = url)
              return file;
            })
          })
          this.store.dispatch({ type: 'storageFinish' })
        }
      })
  }
}

export default Firebase;
