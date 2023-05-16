import React, { useState, useEffect } from "react";
import { Button, Col, Space, Typography, Input, Form } from "antd";
import { Link, useNavigate } from "react-router-dom";
const { Title } = Typography;

function Join({ socket }) {
  const [roomCodeSubmitted, setRoomCodeSubmitted] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [roomCode, setRoomCode] = useState(null);
  const [isConnected, setIsConnected] = useState(socket.connected);

  const navigate = useNavigate();

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("joined_room", () => {
      navigate(`/rooms/${roomCode}`);
    });

    socket.on("failed_joined_room", (err) => {
      setCodeError(true);
      setRoomCodeSubmitted(false);
      setTimeout(() => {
        setCodeError(false);
      }, 1500);
    });
  });

  function onRoomCodeSubmit(values) {
    setRoomCode(values.room_id.toUpperCase());
    setRoomCodeSubmitted(true);
  }

  function onNameSubmit(values) {
    const name = values.name;

    const data = {
      name: name,
      room_id: roomCode,
    };

    socket.emit("join_room", data);
  }

  function enterRoomCode() {
    return (
      <Form name="roomCode" onFinish={onRoomCodeSubmit}>
        <Form.Item name="room_id">
          <Input
            style={{
              fontFamily: "Roboto Mono",
              textAlign: "center",
              fontSize: "25px",
              color: "black",
              width: "300px",
              height: "50px",
            }}
            onInput={(e) => (e.target.value = e.target.value.toUpperCase())}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{
              fontFamily: "Roboto Mono",
              fontWeight: "bold",
              color: "#090C08",
              width: "100%",
              height: "50px",
              backgroundColor: "#F0F3BD",
              fontSize: "20px",
            }}
          >
            {codeError ? "Invalid Room Code" : "Join Room"}
          </Button>
        </Form.Item>
      </Form>
    );
  }

  function enterName() {
    return (
      <Form name="roomCode" onFinish={onNameSubmit}>
        <Form.Item
          name="name"
          rules={[{ required: true, message: "Please input a name" }]}
        >
          <Input
            style={{
              fontFamily: "Roboto Mono",
              textAlign: "center",
              fontSize: "25px",
              color: "black",
              width: "300px",
              height: "50px",
            }}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{
              fontFamily: "Roboto Mono",
              fontWeight: "bold",
              color: "#090C08",
              width: "100%",
              height: "50px",
              backgroundColor: "#F0F3BD",
              fontSize: "20px",
            }}
          >
            Enter
          </Button>
        </Form.Item>
      </Form>
    );
  }

  return (
    <>
      <Space
        direction="horizontal"
        style={{ width: "100%", justifyContent: "center" }}
      >
        {roomCodeSubmitted ? (
          <h1
            style={{
              fontFamily: "Roboto Mono",
              verticalAlign: "middle",
              color: "#F0F3BD",
              marginTop: "80px",
              fontSize: "25px",
            }}
          >
            Enter Your Name
          </h1>
        ) : (
          <h1
            style={{
              fontFamily: "Roboto Mono",
              verticalAlign: "middle",
              color: "#F0F3BD",
              marginTop: "80px",
              fontSize: "25px",
            }}
          >
            Enter Room Code
          </h1>
        )}
      </Space>
      <Space
        direction="horizontal"
        style={{ width: "100%", justifyContent: "center" }}
      >
        {roomCodeSubmitted ? enterName() : enterRoomCode()}
      </Space>
    </>
  );
}

export default Join;
