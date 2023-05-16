import React, { useEffect, useState } from "react";
import { Button, Col, Row, Typography, Space } from "antd";
import { Link } from "react-router-dom";
import { socket } from "./socket";
import "./App.css";
const { Title } = Typography;

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.connect();
    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
  });

  return (
    <div>
      <Space
        direction="horizontal"
        style={{ width: "100%", justifyContent: "center" }}
      >
        <h1
          style={{
            fontFamily: "Roboto Mono",
            verticalAlign: "middle",
            color: "#F0F3BD",
            marginTop: "70px",
            fontSize: "50px",
          }}
        >
          Liar Game
        </h1>
      </Space>

      <Space
        direction="horizontal"
        style={{ width: "100%", justifyContent: "center" }}
      >
        <Link to="create">
          <Button
            size="large"
            style={{
              fontFamily: "Roboto Mono",
              fontSize: "25px",
              fontWeight: "bold",
              marginTop: "50px",
              width: "300px",
              height: "120px",
              color: "#090C08",
              backgroundColor: "#F0F3BD",
            }}
            className="ant-button"
          >
            Create
          </Button>
        </Link>
      </Space>
      <Space
        direction="horizontal"
        style={{ width: "100%", justifyContent: "center" }}
      >
        <Link to="join">
          <Button
            size="large"
            style={{
              fontFamily: "Roboto Mono",
              fontSize: "25px",
              fontWeight: "bold",
              color: "#090C08",
              marginTop: "50px",
              width: "300px",
              height: "120px",
              backgroundColor: "#F0F3BD",
            }}
          >
            Join
          </Button>
        </Link>
      </Space>
    </div>
  );
}

export default App;
