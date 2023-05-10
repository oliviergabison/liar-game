import React, { useEffect, useState } from 'react';
import { Button, Col, Row, Typography, Space, Form, Checkbox, List, Card, Input, Modal } from 'antd';
import { Link, useParams } from 'react-router-dom';
const { Title, Text } = Typography;


function GameRoom({ socket }) {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [users, setUsers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [access, setAccess] = useState(true);
  const [inGame, setInGame] = useState(false);
  const [gameData, setGameData] = useState({});
  const [createCustomGame, setCreateCustomGame] = useState(false);
  const [form] = Form.useForm();
  const { id } = useParams();

  useEffect(() => {
    socket.emit('fetch_users', id);
    console.log(socket);
  }, []);

  useEffect(() => {
    function onDisconnect() {
      setIsConnected(false);
    }

  function createCustomGame() {
    setCreateCustomGame(true);
    setInGame(false);
  }

  function loadUsers(users, host_id) {
    setUsers(users);
    if (host_id == socket.id) {
      setIsHost(true);
    } else {
      setIsHost(false);
    }
  }

  function playRound(data) {
    if (inGame == false) {
      setInGame(true);
    }
    setGameData(data);
  }

  function completedGame() {
    const gameData = { 'category': 'Game Over', 'item': 'Ran out of items'}
    setGameData(gameData);
  }

  function onSuccessCustomSubmit() {
    form.resetFields();
  }

  socket.on('disconnect', onDisconnect)

  socket.on('joined_room', () => socket.emit('fetch_users', id));
  socket.on('load_users', loadUsers);
  socket.on('access_denied', () => setAccess(false));
  socket.on('play_round', playRound);
  socket.on('completed_game', completedGame);
  socket.on('create_custom_game', createCustomGame);
  socket.on('item_submitted_success', onSuccessCustomSubmit);

  });

  function newGameButton() {
    return (
      <>
        <Button type='primary' onClick={() => socket.emit('new_custom_game', id)}>Custom Game</Button>
        <Button type='primary' onClick={() => socket.emit('new_game', id)}>New Game</Button>
      </>
    )
  }

  function displayUsers() {
    return (
      <List
        header={<h1>Users</h1>}
        dataSource={users}
        renderItem={(item) => <List.Item><Text>{item}</Text></List.Item>}
      />
  )};

  function displayGameCard() {
    if (gameData && gameData.category && gameData.item) {
      return (
        <Card title={`Category: ${gameData.category}`}>
          <p>{gameData.item}</p>
        </Card>
      )
    }
    return <h1>couldn't retrieve game data</h1>;
  }

  function onCustomItemSubmit(values) {
    const data = { 'category': values.category, 'item': values.item };
    socket.emit('new_custom_item', id, data);
  }

  function displayCreateCustomGame() {
    return (
      <Form form={form} name='createentries' onFinish={onCustomItemSubmit}>
        <Form.Item label="Category" name="category">
          <Input />
        </Form.Item>
        <Form.Item label="Item" name="item">
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  }



if (access == false) {
  return <h1>You don't have valid access</h1>;
}


  return (
    <>
      <Space direction="horizontal" style={{width: '100%', justifyContent: 'center'}}>
        <Title>Game Room</Title>
      </Space>
      <Space direction="horizontal" style={{width: '100%', justifyContent: 'center'}}>
        <h1>{id}</h1>
      </Space>
      <Space direction="horizontal" style={{width: '100%', justifyContent: 'center'}}>
        {displayUsers()}
      </Space>
      <Space direction="horizontal" style={{width: '100%', justifyContent: 'center'}}>
        {isHost ? newGameButton() : null}
      </Space>
      <Space direction="horizontal" style={{width: '100%', justifyContent: 'center'}}>
        {createCustomGame ? displayCreateCustomGame() : null}
        {inGame ? displayGameCard() : null}
      </Space>

      <Link to="/" replace>
        <Button type='primary'>Exit</Button>
      </Link>
    </>
  );
}

export default GameRoom;
