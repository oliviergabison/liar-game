module.exports.generateRoomID = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = '';
    const charactersLength = letters.length;
    for ( let i = 0; i < 4; i++ ) {
        result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
  return result;
}

module.exports.getUsers = (users) => {
  let res = [];

  for (const user of users) {
    res.push(user.name);
  }

  return res;
}

module.exports.deleteUser = (users, disconnectedID) => {
  let i = 0;
  for (const user of users) {
    if (user.id == disconnectedID) {
      users.pop(i);
      return users;
    }
    i = i + 1;
  }
  return users;
}

module.exports.findRoomIDByUserID = (rooms, userID) => {
  for (const room in rooms) {
    for (const user of rooms[room].users) {
      if (user.id == userID) {
        return room;
      }
    }
  }
  return -1;
}

module.exports.isUserInRoom = (user_id, room_id, rooms) => {
  if (!(room_id in rooms)) {
    return false;
  }

  for (const user of rooms[room_id].users) {
    if (user.id == user_id) {
      return true;
    }
  }
  return false;
}
