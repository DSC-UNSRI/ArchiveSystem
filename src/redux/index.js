import { createStore, combineReducers, applyMiddleware } from 'redux';
import { uploadReducer, storageReducer, storageConfigReducer } from './reducer'
import thunk from "redux-thunk";

export default () => {
    const store = createStore(
        combineReducers({
            uploadReducer,
            storageReducer,
            storageConfigReducer
        }),
        applyMiddleware(thunk)
    );
    return store;
}