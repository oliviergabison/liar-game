module.exports.generateRoomID = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  const charactersLength = letters.length;
  for (let i = 0; i < 4; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return result;
};

module.exports.getUsers = (users) => {
  let res = [];

  for (const user of users) {
    res.push(user.name);
  }

  return res;
};

module.exports.deleteUser = (users, disconnectedID) => {
  let i = 0;
  for (const user of users) {
    if (user.id == disconnectedID) {
      users.splice(i, 1);
      return users;
    }
    i = i + 1;
  }
  return users;
};

module.exports.findRoomIDByUserID = (rooms, userID) => {
  for (const room in rooms) {
    for (const user of rooms[room].users) {
      if (user.id == userID) {
        return room;
      }
    }
  }
  return -1;
};

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
};

module.exports.removeUserFromSubmitted = (users, name) => {
  let i = 0;
  for (const user of users) {
    if (user == name) {
      users.splice(i, 1);
      return users;
    }
    i = i + 1;
  }
  return users;
};

module.exports.pickLiar = (users) => {
  const randomIndex = Math.floor(Math.random() * users.length);
  const randomUser = users[randomIndex];
  return randomUser.id;
};

module.exports.pickCustomLiar = (users, creator_id) => {
  let randomIndex = Math.floor(Math.random() * users.length);
  let randomUserId = users[randomIndex].id;

  // Creator of a submission cannot be the liar of it
  while (randomUserId === creator_id) {
    randomIndex = Math.floor(Math.random() * users.length);
    randomUserId = users[randomIndex].id;
  }
  return randomUserId;
};

module.exports.buildList = (category, items) => {
  // console.log(items);
  let res = [];

  for (const item of items) {
    res.push({ category: category, item: item });
  }
  return res;
};
