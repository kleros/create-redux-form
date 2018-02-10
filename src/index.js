import form from './form'
import wizardForm from './wizard-form'

/**
 * Creates a form generator function that uses the passed in UIKit to render fields.
 * @param {object} UIKit - A map of field types to react components.
 * @param {object} store - The redux store.
 * @returns {{ form: function, wizardForm: function }} - An object with a form generator function and a wizard form generator function.
 */
export default function createFormGenerator(UIKit, store) {
  return {
    form: (...args) => form({ UIKit, store }, ...args),
    wizardForm: (...args) => wizardForm({ UIKit, store }, ...args)
  }
}
