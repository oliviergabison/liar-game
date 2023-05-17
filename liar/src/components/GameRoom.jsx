import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Row,
  Typography,
  Space,
  Form,
  Checkbox,
  List,
  Card,
  Input,
  Modal,
} from "antd";
import { Link, useParams } from "react-router-dom";
import "./GameRoom.css";
import { useCookies } from "react-cookie";
const { Title, Text } = Typography;

function GameRoom({ socket }) {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [users, setUsers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [access, setAccess] = useState(true);
  const [inGame, setInGame] = useState(false);
  const [gameData, setGameData] = useState({});
  const [submittedCustom, setSubmittedCustom] = useState(false);
  const [createCustomGame, setCreateCustomGame] = useState(false);
  const [inCustomGame, setInCustomGame] = useState(false);
  const [gameCardClicked, setGameCardClicked] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form] = Form.useForm();
  const [cookies, setCookie] = useCookies(["name"]);
  const { id } = useParams();

  function showModal() {
    setCreateCustomGame(true);
  }

  function handleOk() {
    setCreateCustomGame(false);
  }

  function handleCancel() {
    setCreateCustomGame(false);
  }

  useEffect(() => {
    socket.emit("fetch_users", id);
    socket.emit("join_room", { name: cookies.name, room_id: id });
  }, []);

  useEffect(() => {
    function onDisconnect() {
      setIsConnected(false);
    }

    function loadUsers(users, host_id) {
      console.log(users);
      setUsers(users);
      if (host_id == socket.id) {
        setIsHost(true);
      } else {
        setIsHost(false);
      }
    }

    function playRound(data, liarId) {
      setGameCardClicked(false);
      setCreateCustomGame(false);
      if (liarId == socket.id) {
        setGameData({ category: data.category, item: "LIAR" });
      } else {
        setGameData(data);
      }

      if (!inGame) setInGame(true);
    }

    function completedGame() {
      const gameData = { category: "Game Over", item: "Ran out of items" };
      setGameData(gameData);
      setInCustomGame(false);
    }

    function onSuccessCustomSubmit() {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        form.resetFields();
      }, 400);
    }

    socket.on("disconnect", onDisconnect);

    // socket.on("joined_room", () => {
    //   setTimeout(function () {
    //     socket.emit("fetch_users", id);
    //     console.log(id);
    //   }, 1000);
    // });
    socket.on("load_users", loadUsers);
    socket.on("access_denied", () => setAccess(false));
    socket.on("play_round", playRound);
    socket.on("completed_game", completedGame);
    socket.on("create_custom_game", createCustomGameSocket);
    socket.on("item_submitted_success", onSuccessCustomSubmit);
    socket.on("finished_submitting", onFinishedSubmitting);
    socket.on("unfinished_submitting", () => setSubmittedCustom(false));
    socket.on("play_custom_game", playCustomGame);
  });

  function createCustomGameSocket() {
    setCreateCustomGame(true);
    setSubmittedCustom(false);
    setInGame(false);
  }

  function playCustomGame(data, liarId) {
    if (createCustomGame) setCreateCustomGame(false);
    if (!inCustomGame) setInCustomGame(true);
    setGameCardClicked(false);

    if (liarId === socket.id) {
      setGameData({ category: data.category, item: "LIAR" });
    } else {
      setGameData(data);
    }

    if (!inGame) setInGame(true);
  }

  function onFinishedSubmitting() {
    setSubmittedCustom(true);
  }

  function newGameButton() {
    return (
      <>
        <Space
          direction="horizontal"
          style={{ width: "100%", justifyContent: "center" }}
        >
          {inCustomGame ? (
            <Button
              type="primary"
              onClick={() => socket.emit("new_custom_game", id)}
              style={{
                fontFamily: "Roboto Mono",
                fontSize: "12px",
                fontWeight: "bold",
                marginTop: "35px",
                borderStyle: "solid",
                borderColor: "#F26419",
                width: "150px",
                color: "#F26419",
                backgroundColor: "#F0F3BD",
              }}
            >
              Next Custom Game
            </Button>
          ) : null}
        </Space>
        <Space
          direction="horizontal"
          style={{ width: "100%", justifyContent: "center" }}
        >
          <Button
            onClick={() => {
              setCreateCustomGame(false);
              socket.emit("new_game", id);
            }}
            style={{
              fontFamily: "Roboto Mono",
              fontSize: "12px",
              fontWeight: "bold",
              marginTop: "5px",
              borderStyle: "solid",
              borderColor: "black",
              color: "#090C08",
              backgroundColor: "#F0F3BD",
              width: "150px",
            }}
          >
            New Game
          </Button>
        </Space>
        <Space
          direction="horizontal"
          style={{ width: "100%", justifyContent: "center" }}
        >
          <Button
            type="primary"
            onClick={() => socket.emit("create_new_custom_game", id)}
            style={{
              fontFamily: "Roboto Mono",
              fontSize: "12px",
              fontWeight: "bold",
              marginTop: "5px",
              borderStyle: "solid",
              borderColor: "black",
              color: "#090C08",
              width: "150px",
              backgroundColor: "#F0F3BD",
            }}
          >
            New Custom Game
          </Button>
        </Space>
      </>
    );
  }

  function displayUsers() {
    return users.map((user) => {
      return (
        <li
          key={user}
          style={{
            fontFamily: "Roboto Mono",
            verticalAlign: "middle",
            color: "#F0F3BD",
            fontSize: "15px",
            textAlign: "center",
          }}
        >
          {user}
        </li>
      );
    });
  }

  function defaultGameCard() {
    return (
      <Card
        bodyStyle={{
          fontFamily: "Roboto Mono",
          backgroundColor: "#F0F3BD",
          border: 0,
          textAlign: "center",
        }}
        headStyle={{
          fontFamily: "Roboto Mono",
          backgroundColor: "#F0F3BD",
          border: 0,
          textAlign: "center",
        }}
        style={{
          border: 0,
          minWidth: "250px",
        }}
      >
        Click to reveal
      </Card>
    );
  }

  function displayGameCard() {
    if (gameData && gameData.category && gameData.item) {
      return (
        <div onClick={() => setGameCardClicked(!gameCardClicked)}>
          {gameCardClicked ? (
            <Card
              bodyStyle={{
                fontFamily: "Roboto Mono",
                backgroundColor: "#F0F3BD",
                border: 0,
                textAlign: "center",
                fontSize: "25px",
                marginTop: "-20px",
              }}
              headStyle={{
                fontFamily: "Roboto Mono",
                backgroundColor: "#F0F3BD",
                border: 0,
                textAlign: "center",
                fontSize: "25px",
              }}
              style={{
                border: 0,
                minWidth: "250px",
                // maxWidth: "380px",
              }}
              title={`${gameData.category}`}
            >
              <p>{gameData.item}</p>
            </Card>
          ) : (
            defaultGameCard()
          )}
        </div>
      );
    }
    return <h1>Uh Oh! You shouldn't be seeing this</h1>;
  }

  function onCustomItemSubmit(values) {
    const data = {
      creator: socket.id,
      category: values.category,
      item: values.item,
    };
    socket.emit("new_custom_item", id, data);
  }

  function onFinished() {
    if (submittedCustom) {
      socket.emit("undo_finished_submission", id, socket.id);
    } else {
      socket.emit("finished_submission", id, socket.id);
    }
  }

  function displayCreateCustomGame() {
    return (
      <Modal
        open={createCustomGame}
        onOk={handleOk}
        onCancel={handleCancel}
        closable={false}
        keyboard={isHost}
        bodyStyle={{ backgroundColor: "#136F63" }}
        maskClosable={isHost}
        footer={[
          <Button
            form="customGameForm"
            key="button1"
            style={{
              fontFamily: "Roboto Mono",
              fontSize: "12px",
              fontWeight: "bold",
              color: "#090C08",
              backgroundColor: "#F0F3BD",
            }}
            disabled={submittedCustom}
            loading={success}
            htmlType="submit"
          >
            {submittedCustom
              ? "Waiting for others to finish..."
              : "Submit Item"}
          </Button>,
          <Button
            form="customGameForm"
            key="button2"
            style={{
              fontFamily: "Roboto Mono",
              fontSize: "12px",
              fontWeight: "bold",
              color: "#090C08",
              backgroundColor: "#F0F3BD",
            }}
            onClick={onFinished}
          >
            {submittedCustom ? "Keep Writing" : "Finished"}
          </Button>,
        ]}
      >
        <Form
          form={form}
          id="customGameForm"
          name="createentries"
          colon={false}
          onFinish={onCustomItemSubmit}
          requiredMark={false}
          style={{}}
        >
          <>
            <Form.Item
              key="category"
              rules={[{ required: true, message: "Please input a category" }]}
              label={
                <p
                  style={{
                    fontFamily: "Roboto Mono",
                    verticalAlign: "middle",
                    color: "#F0F3BD",
                    marginTop: "0px",
                    fontSize: "15px",
                  }}
                >
                  Category
                </p>
              }
              name="category"
            >
              <Input
                style={{
                  fontFamily: "Roboto Mono",
                  verticalAlign: "middle",
                  color: "black",
                }}
                disabled={submittedCustom}
              />
            </Form.Item>
            <Form.Item
              key="item"
              rules={[{ required: true, message: "Please input an item" }]}
              label={
                <p
                  style={{
                    fontFamily: "Roboto Mono",
                    verticalAlign: "middle",
                    color: "#F0F3BD",
                    fontSize: "15px",
                  }}
                >
                  Item
                </p>
              }
              name="item"
            >
              <Input
                style={{
                  fontFamily: "Roboto Mono",
                  verticalAlign: "middle",
                  color: "black",
                }}
                disabled={submittedCustom}
              />
            </Form.Item>
          </>
        </Form>
      </Modal>
    );
  }

  if (access === false) {
    return <h1>You don't have valid access</h1>;
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
            fontSize: "30px",
            marginTop: "50px",
          }}
        >
          Room Code: {id}
        </h1>
      </Space>
      <Space
        direction="horizontal"
        style={{ width: "100%", justifyContent: "center" }}
      >
        <p
          style={{
            fontFamily: "Roboto Mono",
            verticalAlign: "middle",
            color: "#F0F3BD",
            fontSize: "20px",
            marginTop: "5px",
            marginBottom: "-20px",
            textDecoration: "underline",
          }}
        >
          Players
        </p>
      </Space>
      <Space
        direction="horizontal"
        wrap
        style={{ width: "100%", justifyContent: "center", overflowX: "scroll" }}
      >
        <ul style={{ listStyleType: "none", paddingLeft: "0px" }}>
          {displayUsers()}
        </ul>
      </Space>
      <Space
        wrap
        direction="horizontal"
        style={{
          width: "100%",
          justifyContent: "center",
          overflowX: "scroll",
          marginTop: "30px",
        }}
      >
        {createCustomGame ? displayCreateCustomGame() : null}
        {inGame ? displayGameCard() : null}
      </Space>
      {isHost ? newGameButton() : null}
    </>
  );
}

export default GameRoom;
