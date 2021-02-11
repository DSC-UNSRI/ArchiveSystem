const uploadReducer = (state = new Map(), action) => {
    switch (action.type) {
        case 'add':
            return state.set(action.id, action.data)
        case 'remove':
            state.delete(action.id)
            return state
        case 'removeall':
            state.clear()
            return state
        default:
            return state
    }
}

const storageReducer = (state = { folders: [], files: []}, action) => {
    switch (action.type) {
        case 'addFolder':
            return { ...state, folders: action.data }
        case 'addFiles':
            return { ...state, files: action.data }
        case 'removeallStorage':
            return { folders: [], files: [] }
        default:
            return state
    }
}

const storageConfigReducer = (state = {
    URL: '',
    notify: false,
    notifierType: '',
    loading: false,
    loadingType: ''
}, action) => {
    switch (action.type) {
        case 'changeStorageURL':
            return { ...state, URL: action.data }
        case 'notifyStorage':
            return { ...state, notify: true, notifierType: action.data }
        case 'notifyStorageOff':
            return { ...state, notify: false }
        case 'storageLoading':
            return { ...state, loading: true, loadingType: action.data }
        case 'storageFinish':
            return { ...state, loading: false }
        default:
            return state;
    }
}

export { uploadReducer, storageReducer, storageConfigReducer }