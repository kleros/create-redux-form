import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import { connect } from 'react-redux'
import { isInvalid, submit, destroy } from 'redux-form'

import { objMap } from './utils'
import form from './form'

/**
 * Generate a redux wizard form from a schema.
 * @param {object} UIKit - A map of field types to react components.
 * @param {string} formName - The name of the form.
 * @param {object} schema  - The schema to use.
 * @param {object} reduxFormOptions - Optional options object for `redux-form`.
 * @returns {object} - The form react element.
 */
export default function wizardForm(UIKit, formName, schema, reduxFormOptions) {
  const pages = objMap(schema, pageSchema =>
    form(UIKit, formName, pageSchema, {
      ...reduxFormOptions,
      destroyOnUnmount: false,
      forceUnregisterOnUnmount: true
    })
  )
  const lastPageIndex = pages.length - 1

  class WizardForm extends PureComponent {
    state = { page: 0 }

    constructor(props) {
      super(props)

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
        backHandlerRef: _backHandlerRef,
        onPageChange: _onPageChange,
        wizardFormClassName,
        disabled,
        ...rest
      } = this.props
      const { page } = this.state
      const key = page
      const { Form } = pages[key]
      return (
        <div className={wizardFormClassName}>
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

    // Handler Refs
    backHandlerRef: PropTypes.func,

    // Handlers
    onPageChange: PropTypes.func,

    // Modifiers
    wizardFormClassName: PropTypes.string,
    disabled: PropTypes.bool
  }

  WizardForm.defaultProps = {
    // Handler Refs
    backHandlerRef: null,

    // Handlers
    onPageChange: null,

    // Modifiers
    wizardFormClassName: '',
    disabled: false
  }

  return {
    Form: connect(null, { destroy: () => destroy(formName) })(WizardForm),
    isInvalid: isInvalid(formName),
    submit: () => submit(formName)
  }
}
