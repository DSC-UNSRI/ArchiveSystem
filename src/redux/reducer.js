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

const storageReducer = (state = [], action) => {
    switch (action.type) {
        
        default:
            return state
    }
}

export { uploadReducer, storageReducer }