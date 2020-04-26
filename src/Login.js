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
        //<label htmlFor={"passw"}><b>{"Password"}</b></label>
        //<input type={"password"} id={"passw"} placeholder={"Enter Password"} onChange={(e) => this.updatePassword(e)}></input>
        return <div className={"Login"}>
            <form id="login">
                <label type={"sign"} htmlFor={"uname"}><b>{"Play DAMOCLES!"}</b></label>
                <input type={"text"} id={"uname"} placeholder={"username"} onChange={(e) => this.updateUsername(e)}></input>
                <button onClick={() => this.props.onClick(this.state.username, this.state.password)} type={"button"}>{"Login"}</button>
            </form>
        </div>;
    }
}

export default Login;