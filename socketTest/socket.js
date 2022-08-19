const SocketIO = require('socket.io');
const axios = require('axios');
const cookieParser = require('cookie-parser');
var roomId = '';
module.exports = (server, app, sessionMiddleware) => {
  const io = SocketIO(server, {
    path: '/socket.io' ,
    cors:{
      origin: "*",
      methods: ["GET", "POST"]
    }
  },);
  app.set('io', io);
  const room = io.of('/room');
  const chat = io.of('/chat');

  const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
  chat.use(wrap(cookieParser(process.env.COOKIE_SECRET)));
  chat.use(wrap(sessionMiddleware));

  room.on('connection', (socket) => {
    console.log('room 네임스페이스에 접속');
    socket.on('disconnect', () => {
      console.log('room 네임스페이스 접속 해제');
    });
  });

  chat.on('connection', (socket) => {
    console.log('chat 네임스페이스에 접속');
    socket.on('newRoomId', (data) => {
      roomId = data;
      socket.join(roomId);
      socket.to(roomId).emit('join', {
      user: 'system',
    })
    });
    socket.on('disconnect', () => {
      console.log('chat 네임스페이스 접속 해제');
      console.log('roomId: ' + roomId);
      socket.leave(roomId);
      // const currentRoom = socket.adapter.rooms.get(roomId);
      // const userCount = currentRoom ? currentRoom.size : 0;
      // if (userCount === 0) { // 유저가 0명이면 방 삭제
      //   const signedCookie = cookie.sign(req.signedCookies['connect.sid'], process.env.COOKIE_SECRET);
      //   const connectSID = `${signedCookie}`;
      //   axios.delete(`http://http://sparta-swan.shop/room/${roomId}`, {
      //     headers: {
      //       Cookie: `connect.sid=s%3A${connectSID}`
      //     } 
      //   })
      //     .then(() => {
      //       console.log('방 제거 요청 성공');
      //     })
      //     .catch((error) => {
      //       console.error(error);
      //     });
      // } else {
      //   socket.to(roomId).emit('exit', {
      //     user: 'system',
      //     chat: `${req.session.color}님이 퇴장하셨습니다.`,
      //   });
      // }
    });
    socket.on('chat', (data) => {
      console.log('채팅')
      socket.to(data.room).emit(data);
    });
  });
};
