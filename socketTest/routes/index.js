const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Room = require('../schemas/room');
const Chat = require('../schemas/chat');
const User = require('../schemas/user');

const router = express.Router();

router.get('/:userEmail', async (req, res, next) => {
  try {
    const { userEmail } = req.params;
    const user = await User.findOne({userEmail: userEmail});
    const members = user.like.filter(x => user.likeMe.includes(x));
    const member2=[];
    for(let i=0; i<members.length; i++){
      member2.push(await User.findOne({ userEmail: members[i]}))
    }
    
    res.json({member2, userEmail})
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/room', async (req, res, next) => {
  try {
    const { user, other } = req.body;
    const otherInfo = await User.findOne({userEmail: other});
    const userRoom = await Room.findOne({ user: user, other: other});
    if(userRoom){
      console.log('기존방이 있어 기존방으로 이동');
      res.json({newRoom2: userRoom._id, otherInfo2: otherInfo});
      return;
    }
    const existRoom = await Room.findOne({ other: user, user:other });
    if(existRoom){
      console.log('기존방이 있어 기존방으로 이동');
      // res.redirect(`/room/${existRoom._id}`);
      res.json({newRoom2: existRoom._id, otherInfo2: otherInfo});
      return;
    }
    const newRoom = await Room.create({
      user,
      other
    });
    console.log('신규방 생성 후 이동');
    const io = req.app.get('io');
    io.of('/room').emit('newRoom', newRoom);
    // res.redirect(`/room/${newRoom._id}`);
    res.json({newRoom2: newRoom._id, otherInfo2: otherInfo});
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

router.get('/chatlist/:id', async (req, res, next) => {
  try {
    console.log('req.params.id: '+req.params.id)
    const room = await Room.findOne({ _id: req.params.id });
    // console.log('room: ' + room);
    if (!room) {
      return res.redirect('/?error=존재하지 않는 방입니다.');
    }
    const chats = await Chat.find({ room: room._id }).sort('createdAt');
    // console.log('chats: '+chats)
    // return res.render('chat', {
    //   room,
    //   title: room.title,
    //   chats,
    //   user: req.session.color,
    // });
    res.json({room: room, chats: chats})
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.delete('/room/:id', async (req, res, next) => {
  try {
    await Room.remove({ _id: req.params.id });
    await Chat.remove({ room: req.params.id });
    res.send('ok');
    setTimeout(() => {
      req.app.get('io').of('/room').emit('removeRoom', req.params.id);
    }, 2000);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/room/:id/chat', async (req, res, next) => {
  try {
    const chat = await Chat.create({
      room: req.params.id,
      user: req.session.color,
      chat: req.body.chat,
      userEmail: req.body.userEmail
    });
    console.log('chat: '+chat);
    req.app.get('io').of('/chat').to(req.params.id).emit('chat', chat);
    res.send('ok');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

try {
  fs.readdirSync('uploads');
} catch (err) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');
}
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, 'uploads/');
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname);
      done(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});
router.post('/room/:id/gif', upload.single('gif'), async (req, res, next) => {
  try {
    const chat = await Chat.create({
      room: req.params.id,
      user: req.session.color,
      gif: req.file.filename,
    });
    req.app.get('io').of('/chat').to(req.params.id).emit('chat', chat);
    res.send('ok');
  } catch (error) {
    console.error(error);
    next(error);
  }
});



module.exports = router;
