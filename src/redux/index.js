import { createStore, combineReducers, applyMiddleware } from 'redux';
import { uploadReducer, storageReducer, storageURLReducer } from './reducer'
import thunk from "redux-thunk";

export default () => {
    const store = createStore(
        combineReducers({
            uploadReducer,
            storageReducer,
            storageURLReducer
        }),
        applyMiddleware(thunk)
    );
    return store;
}