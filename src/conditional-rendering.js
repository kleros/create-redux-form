import React from 'react'
import PropTypes from 'prop-types'
import { formValues } from 'redux-form'

export const visibleIf = (Component, valueKey) => {
  const isNegated = valueKey[0] === '!'
  const key = isNegated ? valueKey.slice(1) : valueKey

  const VisibleIf = ({ [key]: value, ...rest }) =>
    (isNegated ? !value : value) ? <Component {...rest} /> : null

  VisibleIf.propTypes = {
    // State
    [key]: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.string,
      PropTypes.number
    ])
  }

  VisibleIf.defaultProps = {
    // State
    [key]: false
  }

  return formValues(key)(VisibleIf)
}

export const validateIf = (validate, valueKey) => (val, allVals, ...rest) => {
  const isNegated = valueKey[0] === '!'
  const key = isNegated ? valueKey.slice(1) : valueKey
  return (isNegated ? !allVals[key] : allVals[key])
    ? validate(val, allVals, ...rest)
    : undefined
}
