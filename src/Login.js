import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: ""
        }
    }

    updatePassword(e) {
        this.setState({
            password: e.target.value
        })
    }

    updateUsername(e) {
        this.setState({
            username: e.target.value
        });
    }
    
    render() {
        return <div className={"Login"}>
            <div id="LoginTitle" class="text-center">
                    <h1>{"Play Damocles"}</h1>
            </div>
            <Form id="login">
                <Form.Group>
                    <Form.Label>Username</Form.Label>
                    <Form.Control id="uname" 
                                  type="text" 
                                  placeholder="Enter username" 
                                  value={this.state.username}
                                  onChange={e => this.setState({ username: e.target.value})}/>
                </Form.Group>
                <Button variant="primary"
                        onClick={() => this.props.onClick(this.state.username, this.state.password)} 
                        type="button">Login
                </Button>   
            </Form>
        </div>;
    }
}

export default Login;