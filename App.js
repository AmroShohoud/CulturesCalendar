import React, {Component} from 'react'
import {createStore} from 'redux'
import {Provider} from 'react-redux'
import {persistStore, persistReducer} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import {PersistGate} from 'redux-persist/integration/react'
import Main from './app/Main.js'

const initialState = {
    counter: 0
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'GET_HOLIDAYS':
            return { }
    }
    return state
}

const persistConfig = {
  key: 'root',
  storage,
}

const persistedReducer = persistReducer(persistConfig, reducer)

let store = createStore(persistedReducer)
let persistor = persistStore(store)


const store = createStore(reducer)

class App extends Component {

    render() {
        return (
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <Main />
            </PersistGate>
          </Provider>
        );
    }
}

export default App
