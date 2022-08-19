const mongoose = require("mongoose");

const connect = () => {
    mongoose.connect("mongodb+srv://test:sparta@cluster0.rhzwl.mongodb.net/Tinder_Clone?retryWrites=true&w=majority", { ignoreUndefined: true }).catch((err) => {
      // mongoose.connect("mongodb://localhost:27017/socketStudy", { ignoreUndefined: true }).catch((err) => {
        console.error(err);
    })
}

mongoose.connection.on('error', (error) => {
  console.error('몽고디비 연결 에러', error);
});
mongoose.connection.on('disconnected', () => {
  console.error('몽고디비 연결이 끊겼습니다. 연결을 재시도합니다.');
  connect();
});

module.exports = connect;