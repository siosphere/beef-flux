import * as React from 'react'
import Context, { Manager } from '../context'

const Wrapper = (Component : typeof React.Component) : (props : any) => JSX.Element => {

    return (props) => {
        return <Context.Consumer>
            {manager => <Component {...props} _manager={manager} />}
        </Context.Consumer>
    }
}

export default Wrapper