class ChatBox extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          current: ""
      }
    }
    renderChat() {
      let chats = [];
      for (let i = 0; i < this.props.chat.length; i++) {
        chats.push(<p>{this.props.chat[i].user + ": " + this.props.chat[i].message}</p>);
      }
      return chats;
    }
    
    addMessage() {
        this.props.socket.emit("sendChat", {
            user: this.props.getCookie(),
            id: this.props.id,
            message: this.state.current
        })
        $("#message").val("");
        this.setState({
            current: ""
        })
    }

    updateInput(e) {
        this.setState({
            current: e.target.value
        });
    }

    render() {
        return (<div id="Chat">
            <div id="chatBox">
                {this.renderChat()}
            </div>
            <input id="message" type="text" onChange={(e) => this.updateInput(e)}></input>
            <button onClick={() =>  this.addMessage() }>{"Send"}</button>
        </div>);
    }
  }

  export default ChatBox;