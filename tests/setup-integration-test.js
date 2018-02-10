import expect from 'expect'
import { mount } from 'enzyme'
import React from 'react'
import { combineReducers, applyMiddleware, createStore } from 'redux'
import { Provider } from 'react-redux'
import { reducer as formReducer } from 'redux-form'

// Create Redux Form
import createFormGenerator from '../src'

// Mock Component
const MockComponent = () => <div />

/**
 * Wait for all promises to resolve in a test environment.
 * @returns {Promise<number>} A promise that resolves when setImmediate is called.
 */
export function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 1000))
}

/**
 * Sets up an integration test environment.
 * @param {object} [initialState={}] The initial state.
 * @returns {{ store: object, dispatchSpy: function, mountTest: function, form: function, wizardForm: function }} Utilities for testing and the create-redux-form functions to test.
 */
export default function setupIntegrationTest(initialState = {}) {
  const dispatchSpy = expect.createSpy(() => ({}))
  const store = createStore(
    combineReducers({ form: formReducer }),
    initialState,
    applyMiddleware(store => next => action => {
      dispatchSpy(action)
      return next(action)
    })
  )
  const mountTest = element =>
    mount(<Provider store={store}>{element}</Provider>)

  const { form, wizardForm } = createFormGenerator(
    {
      header: MockComponent,
      info: MockComponent,
      text: MockComponent,
      number: MockComponent
    },
    store
  )

  return { dispatchSpy, store, mountTest, form, wizardForm }
}
