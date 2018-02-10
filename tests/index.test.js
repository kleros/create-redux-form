import expect from 'expect'
import React from 'react'
import { submit as reduxFormSubmit } from 'redux-form'

import setupIntegrationTest, { flushPromises } from './setup-integration-test'

let integration = {
  dispatchSpy: null,
  store: null,
  mountTest: null,
  form: null,
  wizardForm: null
}

beforeEach(() => {
  integration = setupIntegrationTest()
})

// Validation
const required = name => v => (v ? undefined : `${name} is required.`)
const number = name => v =>
  Number.isNaN(Number(v)) ? `${name} must be a number.` : undefined

// Schemas
const schema = {
  payment: {
    type: 'number',
    placeholder: 'Payment (ETH)',
    validate: [required, number]
  },
  timeout: {
    type: 'number',
    visibleIf: 'payment',
    validate: [required, number]
  },
  partyB: {
    type: 'text',
    formValues: 'arbitratorExtraData',
    visibleIf: 'email'
  },
  arbitratorExtraData: {
    type: 'text',
    visibleIf: '!payment'
  },
  email: {
    type: 'text'
  },
  description: {
    type: 'text'
  }
}
const schema2 = {
  payment2: {
    type: 'number',
    placeholder: 'Payment (ETH)'
  },
  timeout2: {
    type: 'number',
    visibleIf: 'payment'
  },
  partyB2: {
    type: 'text',
    formValues: 'arbitratorExtraData',
    visibleIf: 'email'
  },
  arbitratorExtraData2: {
    type: 'text',
    visibleIf: '!payment'
  },
  email2: {
    type: 'text'
  },
  description2: {
    type: 'text'
  }
}
const schema3 = {
  payment3: {
    type: 'number',
    placeholder: 'Payment (ETH)'
  },
  timeout3: {
    type: 'number',
    visibleIf: 'payment'
  },
  partyB3: {
    type: 'text',
    formValues: 'arbitratorExtraData',
    visibleIf: 'email'
  },
  arbitratorExtraData3: {
    type: 'text',
    visibleIf: '!payment'
  },
  email3: {
    type: 'text'
  },
  description3: {
    type: 'text'
  }
}

describe('form', () =>
  it('Takes a schema and returns a form component with utils.', async () => {
    const formName = 'testForm'
    const { Form, isInvalid, submit } = integration.form(formName, schema)
    expect(isInvalid({})).toBe(false)
    expect(submit()).toEqual(reduxFormSubmit(formName))

    // Mount form
    integration.mountTest(
      <Form initialValues={{ payment: 'invalid', timeout: 1000 }} />
    )
    await flushPromises()
  }))

describe('wizardForm', () =>
  it('Takes a nested schema and returns a wizard form component with utils.', async () => {
    const formName = 'testWizardForm'
    const { Form, isInvalid, submit } = integration.wizardForm(formName, {
      step1: schema,
      step2: schema2,
      step3: schema3
    })
    expect(isInvalid({})).toBe(false)
    expect(submit()).toEqual(reduxFormSubmit(formName))

    // Handlers
    let backHandlerRef
    const getBackHandlerRef = func => (backHandlerRef = func)
    const onPageChange = expect.createSpy()
    const handleSubmit = expect.createSpy()

    // Mount wizard form
    const app = integration.mountTest(
      <Form
        initialValues={{ payment: 10, timeout: 1000 }}
        backHandlerRef={getBackHandlerRef} // eslint-disable-line react/jsx-no-bind
        onPageChange={onPageChange}
        onSubmit={handleSubmit}
      />
    )
    await flushPromises()
    expect(onPageChange.calls.length).toBe(1)

    // Go to the next page
    integration.store.dispatch(submit())
    expect(onPageChange.calls.length).toBe(2)

    // Go back to the previous page
    backHandlerRef()
    expect(onPageChange.calls.length).toBe(3)

    // Go to the next page
    integration.store.dispatch(submit())
    expect(onPageChange.calls.length).toBe(4)

    // Go to the next page
    integration.store.dispatch(submit())
    expect(onPageChange.calls.length).toBe(5)

    // Submit the form
    integration.store.dispatch(submit())
    expect(onPageChange.calls.length).toBe(5)
    expect(handleSubmit.calls.length).toBe(1)

    // destroy() form
    app.unmount()
  }))
