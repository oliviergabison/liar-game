import React, { useState, useEffect } from 'react';
import { Button, Col, Space, Typography, Input, Form, notification } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
const { Title } = Typography;

function Join({ socket }) {
  const [roomCodeSubmitted, setRoomCodeSubmitted] = useState(false);
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

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect)

    socket.on('joined_room', () => {
      navigate(`/rooms/${roomCode}`);
    });

    socket.on('failed_joined_room', (err) => {
      notification.error({
        message: 'Could not join room',
        description: err
      });
      setRoomCodeSubmitted(false);
    })
  })

  function onRoomCodeSubmit(values) {
    setRoomCode(values.room_id.toUpperCase());
    setRoomCodeSubmitted(true);
  }

  function onNameSubmit(values) {
    const name = values.name;

    const data = {
      'name': name,
      'room_id': roomCode
    };

    socket.emit('join_room', data)
  }

  function enterRoomCode() {
    return (
      <Form name="roomCode" onFinish={onRoomCodeSubmit}>
        <Form.Item name='room_id'>
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type='primary' htmlType='submit' style={{width: '100%'}}>
            Join
          </Button>
        </Form.Item>
      </Form>
    );
  }

  function enterName() {
    return (
      <Form name="roomCode" onFinish={onNameSubmit}>
        <Form.Item name='name'>
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type='primary' htmlType='submit' style={{width: '100%'}}>
            Enter
          </Button>
        </Form.Item>
      </Form>
    )
  }

  return (
    <>
      <Space direction="horizontal" style={{width: '100%', justifyContent: 'center'}}>
        <Title>Join Room</Title>
      </Space>
      <Space direction="horizontal" style={{width: '100%', justifyContent: 'center'}}>
        {isConnected ? roomCodeSubmitted ? <h1>Enter Your Name</h1> :
          <h1>Enter Room Code </h1> : null}
      </Space>
      <Space direction="horizontal" style={{width: '100%', justifyContent: 'center'}}>
        {isConnected ? roomCodeSubmitted ? enterName() : enterRoomCode() : <h1>Could not connect</h1>}
      </Space>
      <Link to='/' replace>
        <Button type='primary'>Back</Button>
      </Link>
    </>
  );
}

export default Join;
