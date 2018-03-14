<p align="center">
  <b style="font-size: 32px;">Create Redux Form</b>
</p>

<p align="center">
  <a href="https://travis-ci.org/kleros/create-redux-form"><img src="https://travis-ci.org/kleros/create-redux-form.svg?branch=master" alt="Build Status"></a>
  <a href="https://coveralls.io/github/kleros/create-redux-form?branch=master"><img src="https://coveralls.io/repos/github/kleros/create-redux-form/badge.svg?branch=master" alt="Coverage Status"></a>
  <a href="https://david-dm.org/kleros/create-redux-form"><img src="https://david-dm.org/kleros/create-redux-form.svg" alt="Dependencies"></a>
  <a href="https://david-dm.org/kleros/create-redux-form?type=dev"><img src="https://david-dm.org/kleros/create-redux-form/dev-status.svg" alt="Dev Dependencies"></a>
  <a href="https://github.com/facebook/jest"><img src="https://img.shields.io/badge/tested_with-jest-99424f.svg" alt="Tested with Jest"></a>
  <a href="https://standardjs.com"><img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="JavaScript Style Guide"></a>
  <a href="https://github.com/prettier/prettier"><img src="https://img.shields.io/badge/styled_with-prettier-ff69b4.svg" alt="Styled with Prettier"></a>
  <a href="https://conventionalcommits.org"><img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg" alt="Conventional Commits"></a>
  <a href="http://commitizen.github.io/cz-cli/"><img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" alt="Commitizen Friendly"></a>
</p>

# What is This?

[Redux Form](https://github.com/erikras/redux-form) is a great library for creating and managing forms and their state in redux applications. But, it leaves a lot of common boilerplate code up for the user to implement. This library aims to remove this duplication of code while at the same time keeping the ability to define your own custom form components.

## Install

To install, run `yarn add create-redux-form` or `npm install create-redux-form`.

## Create Your Form Generator

First, you'll need `redux-form` compatible input components. See [Redux Form Field Usage](https://redux-form.com/7.2.3/docs/api/field.md/#usage).
Once you have the components you need you can go ahead and create your custom generator like this:

```js
/* form-generator.js */
import createReduxForm from 'create-redux-form'
import FormHeader from './components/form-header'
import FormInfo from './components/form-info'
import TextInput from './components/text-input'
import NumberInput from './components/number-input'

export const { form, wizardForm } = createReduxForm({
  header: FormHeader,
  info: FormInfo,
  text: TextInput,
  number: NumberInput
})
```

The object passed in as the first parameter will be the `UIKit` used to generate your forms.

## Generate a Form or Wizard Form

This is how you would then use your generator to generate a form. Both `form` and `wizardForm` take two parameters, a `formName` and a `schema`.

```js
/* validation.js */
export const required = name => v => (v ? undefined : `${name} is required.`)
export const number = name => v =>
  Number.isNaN(Number(v)) ? `${name} must be a number.` : undefined
```

```js
/* buy-pnk-form.js */
import { form } from './form-generator'
import { required, number } from './validation'

export const {
  Form: BuyPNKForm, // The form react component
  isInvalid: getBuyPNKFormIsInvalid, // A redux state selector that returns true if the form's validation passed and false otherwise
  submit: submitBuyPNKForm // An action creator that returns an action object that submits the form when dispatched
} = form('buyPNKForm', {
  header: {
    type: 'header',
    props: { title: 'BUY PNK' }
  },
  rate: {
    type: 'info'
  },
  amount: {
    type: 'text',
    validate: [required, number]
  }
})
```

If you wanted a wizard form instead, all you need to do is nest the schema one level deeper with components grouped in "steps". E.g.

```js
/* buy-pnk-wizard-form.js */
import { form } from './form-generator'
import { required, number } from './validation'

export const {
  Form: BuyPNKForm,
  isInvalid: getBuyPNKFormIsInvalid,
  submit: submitBuyPNKForm
} = form('buyPNKForm', {
  // The names of the steps are irrelevant
  info: {
    header: {
      type: 'header',
      props: { title: 'BUY PNK' }
    },
    rate: {
      type: 'info'
    }
  },
  pay: {
    amount: {
      type: 'text',
      validate: [required, number]
    }
  }
})
```

## Breaking Down The Form Schema

These are all the properties you can have in a schema.

```js
const schema: {
  // The key gets passed to your component as the prop `placeholder` after being converted from `camelCase` to `TitleCase`. E.g. accountUsername => Account Username
  [placeholder]: {
    type: string, // This is the component you want to use from the `UIKit` passed in to `createReduxForm`
    // Validator functions or functions that take the field's placeholder and return a validator function, like the examples above, (`required`, `number`). Validator functions should return undefined if the checks passed or a string with an error message for the failure
    validate: (
      | ((placeholder: string) => (value: string) => undefined | string)
      | ((value: string) => undefined | string)
    )[],
    visibleIf: string, // Only render this field if the value of the specified field is truthy or falsy. I.e. `visibleIf: 'email'` or `visibleIf: '!email'`
    // `redux-form` [formValues](https://redux-form.com/7.2.3/docs/api/formvalues.md/)
    formValues: boolean,
    props: object, // Props to pass down to your component
    reduxFormFieldProps: object // Props to pass to `redux-form`'s [Field](https://redux-form.com/7.2.3/docs/api/field.md/) component
  }
} = {
  email: {
    type: 'text',
    validate: [v => (v ? undefined : `${name} is required.`)],
    visibleIf: 'username',
    formValues: { currentUsername: 'username' },
    props: { placeholder: 'Secondary Email' }, // You can override the default placeholder, `camelToTitleCase(key)`, like this too
    reduxFormFieldProps: { normalize: v => v.replace(' ', '') }
  }
}
```

## Rendering the Form and WizardForm

This is how you would render and use the Form.

```js
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import {
  BuyPNKForm,
  getBuyPNKFormIsInvalid,
  submitBuyPNKForm
} from './buy-pnk-form'

const Component = ({ buyPNKFormIsInvalid, submitBuyPNKForm }) => (
  <div>
    {/* In addition to these props, you can also pass in any prop that a `redux-form` [form](https://redux-form.com/7.2.3/docs/api/reduxform.md/) takes */}
    <BuyPNKForm
      onSubmit={formData => `We submitted! ${formData}`} // Do what you need to do with the data
      className="BuyPNKForm" // Inner `fieldset` will have class name `BuyPNKForm-fieldset` and inner `fields` will have class name `BuyPNKForm-fieldset-fields`
      disabled={false}
    />
    <button onClick={submitBuyPNKForm} disabled={buyPNKFormIsInvalid}>
      Submit
    </button>
  </div>
)

export default connect(
  state => (
    {
      buyPNKFormIsInvalid: getBuyPNKFormIsInvalid(state)
    },
    {
      submitBuyPNKForm
    }
  )
)(Component)
```

This is how you would render and use the WizardForm.

```js
import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import {
  BuyPNKForm,
  getBuyPNKFormIsInvalid,
  submitBuyPNKForm
} from './buy-pnk-form'

class Component extends PureComponent {
  state = {
    currentPage: 0,
    hasPrevPage: false,
    hasNextPage: false,
    totalPages: 0
  }

  getBackHandlerRef = ref => (this.backHandlerRef = ref)

  handlePageChange = (wizardFormState, formData) => {
    console.log(`This is what we have entered so far ${formData}!`)
    this.setState(wizardFormState)
  }

  render() {
    const { buyPNKFormIsInvalid, submitBuyPNKForm } = this.props
    const { hasPrevPage, hasNextPage } = this.state
    return (
      <div>
        {/* In addition to these props, you can also pass in any prop that a `create-redux-form` Form takes and they will be applied to the current page in the wizard */}
        <BuyPNKForm
          onSubmit={formData => `We submitted! ${formData}`} // Do what you need to do with the data
          backHandlerRef={this.getBackHandlerRef}
          onPageChange={this.handlePageChange}
          transitionName="someCSSAnimation" // Default is `carousel` and can be imported from the module, i.e. `@import '~create-redux-form/animations/carousel.css';`
          className="BuyPNKWizardForm" // Inner `Form` will have class name `BuyPNKWizardForm-form`
        />
        {hasPrevPage && <button onClick={this.backHandlerRef}>Go Back</button>}
        <button onClick={submitBuyPNKForm} disabled={buyPNKFormIsInvalid}>
          {hasNextPage ? 'Next' : 'Submit'}
        </button>
      </div>
    )
  }
}

export default connect(
  state => (
    {
      buyPNKFormIsInvalid: getBuyPNKFormIsInvalid(state)
    },
    {
      submitBuyPNKForm
    }
  )
)(Component)
```

## Rendering Decorational/Informational Components

Because you create your own `UIKit` to pass into the `createReduxForm`, it is very easy to extend your schema to support purely decorational components. Here is how you would make a simple info box.

```js
import React from 'react'
import PropTypes from 'prop-types'

import './form-info.css'

const FormInfo = ({ input: { value } }) => (
  <div className="FormInfo">
    <h5 className="FormInfo-text">{value}</h5>
  </div>
)

FormInfo.propTypes = {
  input: PropTypes.shape({ value: PropTypes.string.isRequired }).isRequired
}

export default FormInfo
```

Then, when rendering the form that contains this field, you pass in the value in the `redux-form` `initialValues` prop.

```js
<SomeForm
  enableReinitialize // Enable this if the value is dynamic, so the form rerenders when it changes
  keepDirtyOnReinitialize // This lets you keep the value of the other fields when the form reinitializes
  initialValues={{
    yourFieldSchemaKey: `Here is your info: ${someDynamicInfo}`
  }}
/>
```
