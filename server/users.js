const userList = [];

const addUser = ({id, name, room}) => {
  //Room One =  roomone

  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  const existingUser = userList.find((user) => user.room === room && user.name === name);

  if(existingUser) {
    return { error: 'Username is taken, choose another name!'};
  }

  const user = {id, name, room};

  userList.push(user);

  return { user };
}

const removeUser = (id) => {
  const index =  userList.findIndex((user) => user.id === id);

  if(index !== -1) {
    return userList.splice(index, 1)[0];
  }
}

const getUser = (id) => userList.find((user) => user.id === id)

const getUsersInRoom = (room) => userList.filter((user) => user.room === room);

module.exports = { addUser, removeUser, getUser, getUsersInRoom };