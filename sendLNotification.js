const sendWsMessage = (u_id, msg) => {
  try {
    // if (msg.data.c_type == 0) {
    Object.keys(usercon).map((val, key) => {
      if (val == u_id) {
        for (let i = 0; i < usercon[val].length; i++) {
          usercon[val][i].send(JSON.stringify(msg));
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
};
async function sendMessageToCustomer(u_id, msg) {
  try {
    // if (msg.data.c_type == 0) {
    Object.keys(customercon).map((val, key) => {
      if (val == u_id) {
        for (let i = 0; i < customercon[val].length; i++) {
          customercon[val][i].send(JSON.stringify(msg));
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  sendWsMessage,
  sendMessageToCustomer,
};
