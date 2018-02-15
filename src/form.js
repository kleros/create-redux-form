import React from 'react'
import PropTypes from 'prop-types'
import { reduxForm, isInvalid, submit } from 'redux-form'

import createFields from './create-fields'

/**
 * Generate a redux form from a schema.
 * @param {object} UIKit - A map of field types to react components.
 * @param {string} formName - The name of the form.
 * @param {object} schema  - The schema to use.
 * @param {object} reduxFormOptions - Optional options object for `redux-form`.
 * @returns {object} - The form react element.
 */
export default function form(UIKit, formName, schema, reduxFormOptions) {
  const fields = createFields(UIKit, formName, schema)
  const Form = ({ formClassName, fieldsClassName, disabled }) => (
    <form className={`Form ${formClassName}`}>
      <fieldset className="Form-fieldset" disabled={disabled}>
        <div className={`Form-fieldset-fields ${fieldsClassName}`}>
          {fields}
        </div>
      </fieldset>
    </form>
  )

  Form.propTypes = {
    // Modifiers
    formClassName: PropTypes.string,
    fieldsClassName: PropTypes.string,
    disabled: PropTypes.bool
  }

  Form.defaultProps = {
    // Modifiers
    formClassName: '',
    fieldsClassName: '',
    disabled: false
  }

  return {
    Form: reduxForm({ form: formName, ...reduxFormOptions })(Form),
    isInvalid: isInvalid(formName),
    submit: () => submit(formName)
  }
}
