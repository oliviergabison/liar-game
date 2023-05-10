const Math = require('mathjs');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const helpers = require('./helpers');



const jobs = [{ "category": "job category 1", "item": "job 1"}, { "category": "job category 2", "item": "job 2"}];
const foods = [{ "category": "food category 1", "item": "food 1"}];
const animals = [{ "category": "animal category 1", "item": "animal 1"}];
const races = [{ "category": "race category 1", "item": "race 1"}];

const CATEGORIES_LIST = [jobs, foods, animals, races];

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000"
  }
});

const rooms = {};

app.get('/', (req, res) => {
  res.send('<h1>Hello worlsd</h1>');
});

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    room_id = helpers.findRoomIDByUserID(rooms, socket.id);
    if (room_id == -1) {
      return;
    }

    // if host disconnects, auto assign next person to be the host
    // if room is empty, delete room data
    if (rooms[room_id].host == socket.id) {
      if (rooms[room_id].users.length == 1) {
        delete rooms[room_id];
        return;
      } else {
        rooms[room_id].host = rooms[room_id].users[1].id;
      }
    }

    rooms[room_id].users = helpers.deleteUser(rooms[room_id].users, socket.id);
    io.in(room_id).emit('load_users', helpers.getUsers(rooms[room_id].users), rooms[room_id].host);
  })
  socket.on('create_room', (data) => {
    const room_id = helpers.generateRoomID();
    socket.join(room_id);

    socket.name = data.name;

    const category_data = {};

    for (category of data.categories) {
      category_data[category] = CATEGORIES_LIST[category].slice();
    };

    rooms[room_id] = {
      'categories_board': category_data,
      'host': socket.id,
      'users': [{ "name": data.name, "id": socket.id }]
    };

    const event_data = {
      room_id: room_id
    };

    socket.emit("room_created", event_data);
  });

  socket.on('join_room', (data) => {
    const { name, room_id } = data;

    socket.name = name;

    if (room_id in rooms) {
      socket.join(room_id);

      rooms[room_id].users.push({ "name": name, "id": socket.id });

      io.in(room_id).emit('joined_room');
    } else {
      socket.emit("failed_joined_room", "Invalid Room ID");
    }
  });

  socket.on('fetch_users', (room_id) => {
    const userInRoom = helpers.isUserInRoom(socket.id, room_id, rooms);
    if (!userInRoom) {
      socket.emit('access_denied');
      return;
    }
    if (room_id in rooms) {
      io.in(room_id).emit('load_users', helpers.getUsers(rooms[room_id].users), rooms[room_id].host);
    }
  });

  socket.on('new_custom_game', (room_id) => {
    if (!rooms[room_id]) { return };

    rooms[room_id]['custom_game'] = [];

    io.in(room_id).emit('create_custom_game');
  });

  socket.on('new_custom_item', (room_id, data) => {
    if (rooms[room_id].custom_game) {
      rooms[room_id].custom_game.push(data);
      console.log(rooms[room_id].custom_game);
      socket.emit('item_submitted_success');
    }
  })



  socket.on('new_game', (room_id) => {
    playRound(room_id);
  })
});

function playRound(room_id) {
  if (rooms[room_id] && rooms[room_id].categories_board) {
    // no more available categories
    if (Object.keys(rooms[room_id].categories_board).length == 0) {
      io.in(room_id).emit('completed_game');
      return;
    }
    const randomCategoryIndex = Math.floor(Math.random() * Object.keys(rooms[room_id].categories_board).length);
    const categoryKey = Object.keys(rooms[room_id].categories_board)[randomCategoryIndex];
    const items = rooms[room_id].categories_board[categoryKey];
    const randomIndex = Math.floor(Math.random() * items.length);


    const item = rooms[room_id].categories_board[categoryKey].pop(randomIndex);

    if (rooms[room_id].categories_board[categoryKey].length == 0) {
      delete rooms[room_id].categories_board[categoryKey];
    }

    io.in(room_id).emit('play_round', item);
  }
}

server.listen(4000, () => {
  console.log('listening on *:4000');
});
