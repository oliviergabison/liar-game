const Math = require("mathjs");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const helpers = require("./helpers");
const food = require("./data/food");
const jobs = require("./data/jobs");
const race = require("./data/race");
const sports = require("./data/sports");
const animals = require("./data/animals");
const enforce = require("express-sslify");
const path = require("path");

const jobsLst = helpers.buildList("Job", jobs.jobs);
const foodsLst = helpers.buildList("Food", food.food);
const raceLst = helpers.buildList("Race & Religion", race.race);
const sportsLst = helpers.buildList("Sport", sports.sports);
const animalsLst = helpers.buildList("Animal", animals.animals);

const CATEGORIES_LIST = [jobsLst, foodsLst, animalsLst, raceLst, sportsLst];

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const rooms = {};

app.use(enforce.HTTPS());

app.use(express.static(path.join(__dirname, "/public")));

app.get("/*", function (req, res) {
  res.sendFile(
    path.join(__dirname, "/../liar/public/index.html"),
    function (err) {
      if (err) {
        res.status(500).send(err);
      }
    }
  );
});

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    try {
      room_id = helpers.findRoomIDByUserID(rooms, socket.id);
      if (room_id == -1) {
        return;
      }

      leaveRoom(socket, room_id);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("leave_room", (room_id) => {
    try {
      leaveRoom(socket, room_id);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("create_room", (data) => {
    try {
      const room_id = helpers.generateRoomID();
      const socket_id = socket.id;
      socket.join(room_id);

      socket.name = data.name;

      const category_data = {};

      for (category of data.categories) {
        category_data[category] = CATEGORIES_LIST[category].slice();
      }

      rooms[room_id] = {
        categories_board: category_data,
        host: socket_id,
        users: [{ name: data.name, id: socket_id }],
        user_ids: {},
        default_categories: structuredClone(category_data),
      };
      rooms[room_id]["user_ids"][socket_id] = data.name;

      const event_data = {
        room_id: room_id,
      };

      socket.emit("room_created", event_data);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("join_room", (data) => {
    try {
      console.log("Joined Room");
      console.log(socket.id);
      const { name, room_id } = data;

      socket.name = name;

      if (room_id in rooms) {
        if (helpers.isUserInRoom(socket.id, room_id, rooms)) {
          return;
        }
        socket.join(room_id);

        rooms[room_id].users.push({ name: name, id: socket.id });
        rooms[room_id].user_ids[socket.id] = name;

        io.in(room_id).emit("joined_room");
      } else {
        console.log("Room Not Found");
        console.log(room_id);
        console.log(rooms);
        socket.emit("failed_joined_room", "Invalid Room ID");
      }
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("fetch_users", (room_id) => {
    try {
      // const userInRoom = helpers.isUserInRoom(socket.id, room_id, rooms);
      // if (!userInRoom) {
      //   socket.emit("access_denied");
      //   return;
      // }
      if (room_id in rooms) {
        io.in(room_id).emit(
          "load_users",
          helpers.getUsers(rooms[room_id].users),
          rooms[room_id].host
        );
      }
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("create_new_custom_game", (room_id) => {
    try {
      if (!rooms[room_id]) {
        return;
      }

      rooms[room_id]["custom_game"] = { data: [], submitted: [] };

      io.in(room_id).emit("create_custom_game");
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("new_custom_item", (room_id, data) => {
    try {
      if (rooms[room_id].custom_game) {
        rooms[room_id].custom_game.data.push(data);
        socket.emit("item_submitted_success");
      }
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("finished_submission", (room_id, id) => {
    try {
      if (!rooms[room_id] && !rooms[room_id].custom_game) {
        return;
      }
      const mappedName = rooms[room_id].user_ids[id];
      rooms[room_id].custom_game.submitted.push(mappedName);

      socket.emit("finished_submitting");
      if (
        rooms[room_id].custom_game.submitted.length ==
          rooms[room_id].users.length &&
        rooms[room_id].custom_game.data.length > 0
      ) {
        playCustomGameRound(room_id);
      } else {
        io.in(room_id).emit(
          "user_submitted_update",
          rooms[room_id].custom_game.submitted
        );
      }
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("new_custom_game", (room_id) => {
    try {
      playCustomGameRound(room_id);
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("undo_finished_submission", (room_id, id) => {
    try {
      if (!rooms[room_id] && rooms[room_id].custom_game) {
        return;
      }

      const mappedName = rooms[room_id].user_ids[id];
      rooms[room_id].custom_game.submitted = helpers.removeUserFromSubmitted(
        rooms[room_id].custom_game.submitted,
        mappedName
      );

      io.in(room_id).emit(
        "user_submitted_update",
        rooms[room_id].custom_game.submitted
      );
      socket.emit("unfinished_submitting");
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("new_game", (room_id) => {
    try {
      playRound(room_id);
    } catch (err) {
      console.error(err);
    }
  });
});

function playCustomGameRound(room_id) {
  try {
    if (!rooms[room_id] || !rooms[room_id].custom_game) {
      return;
    }

    const entries = rooms[room_id].custom_game.data;

    if (entries.length == 0) {
      io.in(room_id).emit("completed_game");
      return;
    }
    const randomIndex = Math.floor(Math.random() * entries.length);

    const entry = rooms[room_id].custom_game.data[randomIndex];
    rooms[room_id].custom_game.data.splice(randomIndex, 1);

    // pick liar
    const liar = helpers.pickCustomLiar(rooms[room_id].users, entry.creator);

    const data = { category: entry["category"], item: entry["item"] };

    io.in(room_id).emit("play_custom_game", data, liar);
  } catch (err) {
    console.error(err);
  }
}

function playRound(room_id) {
  try {
    if (rooms[room_id] && rooms[room_id].categories_board) {
      // no more available categories
      if (Object.keys(rooms[room_id].categories_board).length == 0) {
        io.in(room_id).emit("completed_game");
        // reset categories
        rooms[room_id].categories_board = structuredClone(
          rooms[room_id].default_categories
        );
        return;
      }

      // pick random category
      const randomCategoryIndex = Math.floor(
        Math.random() * Object.keys(rooms[room_id].categories_board).length
      );
      const categoryKey = Object.keys(rooms[room_id].categories_board)[
        randomCategoryIndex
      ];
      const items = rooms[room_id].categories_board[categoryKey];
      const randomIndex = Math.floor(Math.random() * items.length);

      const item = rooms[room_id].categories_board[categoryKey][randomIndex];
      rooms[room_id].categories_board[categoryKey].splice(randomIndex, 1);

      // pick liar
      const liar = helpers.pickLiar(rooms[room_id].users);

      if (rooms[room_id].categories_board[categoryKey].length == 0) {
        delete rooms[room_id].categories_board[categoryKey];
      }

      io.in(room_id).emit("play_round", item, liar);
    }
  } catch (err) {
    console.error(err);
  }
}

function leaveRoom(socket, room_id) {
  try {
    if (!rooms[room_id]) {
      return;
    }
    if (rooms[room_id].host == socket.id) {
      if (rooms[room_id].users.length == 1) {
        socket.leave(room_id);
        delete rooms[room_id];
        return;
      } else {
        rooms[room_id].host = rooms[room_id].users[1].id;
      }
    }

    // remove user from users list
    rooms[room_id].users = helpers.deleteUser(rooms[room_id].users, socket.id);
    // remove user from user_ids list
    delete rooms[room_id].user_ids[socket.id];
    socket.leave(room_id);
    socket
      .to(room_id)
      .emit(
        "load_users",
        helpers.getUsers(rooms[room_id].users),
        rooms[room_id].host
      );
  } catch (err) {
    console.error(err);
  }
}

server.listen(process.env.PORT || 4000, () => {});
