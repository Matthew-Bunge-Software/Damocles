import React from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

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
        return (<Col xs={3} id="Chat">
            <Form>
                <Row>
                    <Col xs={10}>
                        <Form.Control id="message"
                            type="text"
                            onChange={(e) => this.updateInput(e)}>
                        </Form.Control>
                    </Col>
                    <Col xs={2}>
                        <Button variant="damocles-primary"
                                onClick={() => this.addMessage()}
                                type="button">
                            {"Send"}
                        </Button>
                    </Col>
                </Row>
                <Row>
                    <Form.Group id="chatBox">
                        {this.renderChat()}
                    </Form.Group>
                </Row>
            </Form>
        </Col>);
    }
  }

  export default ChatBox;