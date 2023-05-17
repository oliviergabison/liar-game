import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Row,
  Typography,
  Space,
  Form,
  Checkbox,
  Input,
  notification,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
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
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("room_created", roomCreated);
  });

  function roomCreated(value) {
    const room_id = value.room_id;

    navigate(`/rooms/${room_id}`);
  }

  const options = ["Job", "Food", "Animal", "Races", "Sports"];
  const tags = [0, 1, 2, 3, 4];

  function renderCategoriesList() {
    return options.map((option, index) => (
      <Form.Item valuePropName="checked" key={option} name={tags[index]}>
        <Checkbox
          style={{
            fontFamily: "Roboto Mono",
            verticalAlign: "middle",
            color: "#F0F3BD",
            fontSize: "15px",
          }}
        >
          {option}
        </Checkbox>
      </Form.Item>
    ));
  }

  function onFinish(values) {
    var categories = [];
    for (const c in values) {
      if (values[c] == true) {
        categories.push(c);
      }
    }

    if (categories.length == 0) {
      console.log("hi");
      notification.error({
        message: "Must select a category",
      });
      return;
    }
    const data = {
      name: values.name,
      categories: categories,
    };
    if (isConnected) {
      socket.emit("create_room", data);
    } else {
      notification.error({
        message: "Socket is down. GL fixing this",
      });
    }
  }

  return (
    <>
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
          Create Room
        </h1>
      </Space>

      <Space
        direction="horizontal"
        style={{ width: "100%", justifyContent: "center" }}
      >
        <Form
          name="createroom"
          requiredMark={false}
          onFinish={onFinish}
          colon={false}
        >
          <Form.Item
            rules={[{ required: true }]}
            label={
              <p
                style={{
                  fontFamily: "Roboto Mono",
                  verticalAlign: "middle",
                  color: "#F0F3BD",
                  marginTop: "0px",
                  fontSize: "25px",
                }}
              >
                Name
              </p>
            }
            name="name"
          >
            <Input
              style={{
                fontFamily: "Roboto Mono",
                verticalAlign: "middle",
                color: "black",
                fontSize: "18px",
              }}
            />
          </Form.Item>
          <Space
            direction="horizontal"
            style={{ width: "100%", justifyContent: "center" }}
          >
            <h1
              style={{
                fontFamily: "Roboto Mono",
                verticalAlign: "middle",
                color: "#F0F3BD",
                marginTop: "0px",
                fontSize: "25px",
              }}
            >
              Select your categories
            </h1>
          </Space>
          {renderCategoriesList()}
          <Space
            direction="horizontal"
            style={{ width: "100%", justifyContent: "center" }}
          >
            <Form.Item>
              <Button
                style={{
                  fontFamily: "Roboto Mono",
                  fontSize: "25px",
                  fontWeight: "bold",
                  color: "#090C08",
                  marginTop: "50px",
                  width: "150px",
                  height: "70px",
                  backgroundColor: "#F0F3BD",
                }}
                type="primary"
                htmlType="submit"
              >
                Submit
              </Button>
            </Form.Item>
          </Space>
        </Form>
      </Space>
      {/* <Link to="/" replace>
        <Button type="primary">Back</Button>
      </Link> */}
    </>
  );
}

export default Create;
