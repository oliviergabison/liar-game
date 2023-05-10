import React, { useEffect, useState } from 'react';
import { Button, Col, Row, Typography, Space, Form, Checkbox, Input } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
const { Title } = Typography;

function Create({ socket }) {
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

    socket.on('room_created', roomCreated);
  });

  function roomCreated(value) {
    const room_id = value.room_id;

    navigate(`/rooms/${room_id}`);
  }

  const options = ['Job', 'Food', 'Animal', 'Races'];
  const tags = [0, 1, 2, 3];

  function renderCategoriesList() {
    return options.map((option, index) =>
      <Form.Item valuePropName="checked" key={option} name={tags[index]}>
        <Checkbox>{option}</Checkbox>
      </Form.Item>
    )
  }

  function onFinish(values) {
    var categories = []
    for (const c in values) {
      if (values[c] == true) {
        categories.push(c)
      }
    }
    const data = {
      'name': values.name,
      'categories': categories
    }
    if (isConnected) {
      socket.emit('create_room', data)
    }
  }

  return (
    <>
      <Space direction="horizontal" style={{width: '100%', justifyContent: 'center'}}>
        <Title>Creating Room</Title>
      </Space>
      <Space direction="horizontal" style={{width: '100%', justifyContent: 'center'}}>
        <h1>Select your categories</h1>
      </Space>
      <Space direction="horizontal" style={{width: '100%', justifyContent: 'center'}}>
        <Form
          name="createroom"
          onFinish={onFinish}
        >
          {renderCategoriesList()}
          <Form.Item label="Name" name="name">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Space>
      <Link to="/" replace>
        <Button type='primary'>Back</Button>
      </Link>
    </>
  );
}

export default Create;
