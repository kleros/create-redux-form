const validatorNamer = name => v =>
  typeof v('', {}) === 'function' ? v(name) : v

const combineValidators = validators => (...args) => {
  for (const validator of validators) {
    const error = validator(...args)
    if (error) return error
  }
  return undefined
}

export default (name, validate) => {
  const namer = validatorNamer(name)
  return combineValidators(validate.map(namer))
}
