import form from './form'
import wizardForm from './wizard-form'

/**
 * Creates a form generator function that uses the passed in UI-Kit to render fields.
 * @param {object} UIKit - A map of field types to react components.
 * @returns {{ form: function, wizardForm: function }} - An object with a form generator function and a wizard form generator function.
 */
export default function createReduxForm(UIKit) {
  return {
    form: (...args) => form(UIKit, ...args),
    wizardForm: (...args) => wizardForm(UIKit, ...args)
  }
}
