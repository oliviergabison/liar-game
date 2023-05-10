import React, { useEffect, useState } from 'react';
import { Button, Col, Row, Typography, Space } from 'antd';
import { Link } from 'react-router-dom';
import { socket } from './socket';
import './App.css';
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
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect)
  });



  return (
    <>
      <Row>
        {isConnected ? <h1>Connected</h1> : <h1>Not Connected</h1>}
        <Col offset={12} span={24}>
          <Space >
            <Title level={3}>Liar Game</Title>
          </Space>
        </Col>
      </Row>
      <Row style={{marginTop: '50px'}}>
        <Col offset={4} span={6}>
          <Link to='create'>
            <Button size='large' type='primary' style={{width: '100%'}}>Create</Button>
          </Link>
        </Col>
        <Col offset={4} span={6}>
          <Link to='join'>
            <Button size='large' type='primary' style={{width: '100%'}}>Join</Button>
          </Link>
        </Col>
      </Row>
    </>
  );
}

export default App;
