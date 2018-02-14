import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import { connect } from 'react-redux'
import { isInvalid, submit, destroy } from 'redux-form'

import { objMap } from './utils'
import form from './form'

/**
 * Generate a redux wizard form from a schema.
 * @param {object} UIKitAndStore - An object with a map of field types to react components and the redux store.
 * @param {string} formName - The name of the form.
 * @param {object} schema  - The schema to use.
 * @param {object} reduxFormOptions - Optional options object for `redux-form`.
 * @returns {object} - The form react element.
 */
export default function wizardForm(
  UIKitAndStore,
  formName,
  schema,
  reduxFormOptions
) {
  const pages = objMap(schema, pageSchema =>
    form(UIKitAndStore, formName, pageSchema, {
      ...reduxFormOptions,
      destroyOnUnmount: false,
      forceUnregisterOnUnmount: true
    })
  )
  const lastPageIndex = pages.length - 1

  class WizardForm extends PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        page: 0
      }

      const { backHandlerRef } = this.props
      if (backHandlerRef) backHandlerRef(this.previousPage)

      this.onPageChange()
    }

    componentWillUnmount() {
      const { destroy } = this.props
      destroy()
    }

    onPageChange = formData => {
      const { onPageChange } = this.props
      const { page } = this.state
      if (onPageChange)
        onPageChange(
          {
            currentPage: page,
            hasPrevPage: page !== 0,
            hasNextPage: page !== pages.length - 1,
            totalPages: pages.length
          },
          formData
        )
    }

    previousPage = () => {
      const { page } = this.state
      const nextPage = page > 0 ? page - 1 : page
      this.setState(
        {
          page: nextPage
        },
        this.onPageChange
      )
    }

    nextPage = formData => {
      const { page } = this.state
      const nextPage = page < lastPageIndex ? page + 1 : page
      this.setState(
        {
          page: nextPage
        },
        () => this.onPageChange(formData)
      )
    }

    handleSubmit = formData => {
      const { page } = this.state
      if (page !== lastPageIndex) return this.nextPage()

      const { onSubmit } = this.props
      onSubmit(formData)
    }

    render() {
      const {
        onSubmit: _onSubmit,
        destroy: _destroy,
        onPageChange: _onPageChange,
        backHandlerRef: _backHandlerRef,
        className,
        disabled,
        ...rest
      } = this.props
      const { page } = this.state
      const key = page
      const { Form } = pages[key]
      return (
        <div className={className}>
          <ReactCSSTransitionGroup
            transitionName="carousel"
            transitionEnterTimeout={800}
            transitionLeave={false}
          >
            <div key={key} style={{ position: 'relative' }}>
              <Form
                disabled={disabled}
                onSubmit={this.handleSubmit}
                {...rest}
              />
            </div>
          </ReactCSSTransitionGroup>
        </div>
      )
    }
  }

  WizardForm.propTypes = {
    // Redux Form
    onSubmit: PropTypes.func.isRequired,
    destroy: PropTypes.func.isRequired,

    // Handlers
    onPageChange: PropTypes.func,

    // Handler Refs
    backHandlerRef: PropTypes.func,

    // Modifiers
    className: PropTypes.string,
    disabled: PropTypes.bool
  }

  WizardForm.defaultProps = {
    // Handlers
    onPageChange: null,

    // Handler Refs
    backHandlerRef: null,

    // Modifiers
    className: '',
    disabled: false
  }

  return {
    Form: connect(null, { destroy: () => destroy(formName) })(WizardForm),
    isInvalid: isInvalid(formName),
    submit: () => submit(formName)
  }
}
