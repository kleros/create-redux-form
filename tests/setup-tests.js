import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

// Configure
configure({ adapter: new Adapter() })

// Run
const context = require.context('.', true, /\.test\.js$/)
context.keys().forEach(context)
