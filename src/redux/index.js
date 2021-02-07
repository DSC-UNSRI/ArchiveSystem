import { createStore, combineReducers, applyMiddleware } from 'redux';
import { uploadReducer, storageReducer } from './reducer'
import thunk from "redux-thunk";

export default () => {
    const store = createStore(
        combineReducers({
            uploadReducer,
            storageReducer
        }),
        applyMiddleware(thunk)
    );
    return store;
}