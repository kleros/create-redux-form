import React from 'react'
import { Field, formValues } from 'redux-form'

import { objMap, camelToTitleCase } from './utils'
import resolveValidate from './resolve-validate'
import { visibleIf, validateIf } from './conditional-rendering'

/**
 * Generate fields for a `redux-form` from a schema.
 * @param {{ UIKit: object, store: object }} UIKitAndStore - An object with a map of field types to react components and the redux store.
 * @param {string} formName - The name of the form.
 * @param {object} schema  - The schema to use.
 * @returns {object[]} - An array of field react elements.
 */
export default function createFields({ UIKit, store }, formName, schema) {
  return objMap(schema, (rawField, fieldKey) => {
    const name = camelToTitleCase(fieldKey)
    const field = {
      ...rawField,
      validate: rawField.validate
        ? resolveValidate(name, rawField.validate)
        : null,
      props: {
        ...rawField.props,
        placeholder:
          rawField.props && rawField.props.placeholder
            ? rawField.props.placeholder
            : name
      }
    }
    let Component = UIKit[field.type]

    // Conditional rendering
    if (field.visibleIf) {
      Component = visibleIf(Component, field.visibleIf)
      field.validate =
        field.validate && validateIf(field.validate, field.visibleIf)
    }

    // Access form values
    if (field.formValues) Component = formValues(field.formValues)(Component)

    return (
      <Field
        key={`${formName}-${fieldKey}`}
        name={fieldKey}
        component={Component}
        validate={field.validate}
        props={{ style: { flex: 1 }, ...field.props }}
        {...field.reduxFormFieldProps}
      />
    )
  })
}
