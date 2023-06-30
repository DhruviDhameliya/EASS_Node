const http = require("http");
const https = require("https");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
// const req = require("express/lib/request");
const fileUpload = require("express-fileupload");
const paths = require("path");
// const { path } = require("express/lib/application");
const auth = require("./auth");
const adminapi = require("./adminapi-13062023");
const app = express();
const moment = require("moment");
const cron = require("node-cron");
const cron1 = require("node-cron");
const cron2 = require("node-cron");
const cron3 = require("node-cron");
const cron4 = require("node-cron");
const cron5 = require("node-cron");
const con = require("./database");
const fs = require("fs");
app.use(cors({ origin: true }));

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.use(
  "/images",
  express.static(paths.join(__dirname, "/public/Assets/images/"))
);

app.use(fileUpload());

app.use(function (req, res, next) {
  con.query(`SET GLOBAL sql_mode = 'NO_ENGINE_SUBSTITUTION'`, function (
    err,
    result
  ) {
    if (err) {
    }
    if (result) {
      // req.setHeader("Content-Type", "application/json; charset=utf-8");
      // console.log('reset settingdata');
      // console.log(result);
    }
  });
  // console.log(req.url);
  // console.log(moment().format("DD-MM-YYYY hh:mm:ss a"));
  // console.log("********REQ Params********", req.params);
  // console.log("********Req BODY********", req.body);
  next();
});

//Web Socket
const server = app.listen("8081", function () {
  console.log("Server Successfully Created");
});

// const options = {
//   cert: fs.readFileSync(
//     "../../../../etc/letsencrypt/live/www.online.measervices.in/fullchain.pem"
//   ),
//   key: fs.readFileSync(
//     "../../../../etc/letsencrypt/live/www.online.measervices.in/privkey.pem"
//   ),
// };
// const server = app.listen(5000, function (error) {
//   console.log("Server successfully created.");
// });
// const server = https.createServer(options, app).listen(8443);

// Importing the required modules
const WebSocketServer = require("ws");
const { sendWsMessage, sendMessageToCustomer } = require("./sendLNotification");
const { authTokenMiddleware } = require("./Middlewares/AuthMiddleware");
// Creating a new websocket server
const wss = new WebSocketServer.Server({ server });
global.usercon = {};
global.customercon = {};
// Creating connection using websocket
wss.on("connection", (ws, req) => {
  let uid = req.url.substr(3);
  if (req.url.slice(1, 2) == "s") {
    if (usercon[uid] == undefined) {
      usercon[uid] = [];
    }
    let isNew = true;
    for (let i = 0; i < usercon[uid].length; i++) {
      if (usercon[uid][i] == ws) {
        isNew = false;
        break;
      }
    }
    if (isNew) {
      ws.uid = uid;
      ws.id = usercon[uid].length;
      usercon[uid].push(ws);
    }
  } else {
    if (customercon[uid] == undefined) {
      customercon[uid] = [];
    }
    let isNew = true;
    for (let i = 0; i < customercon[uid].length; i++) {
      if (customercon[uid][i] == ws) {
        isNew = false;
        break;
      }
    }
    if (isNew) {
      ws.uid = uid;
      ws.id = customercon[uid].length;
      customercon[uid].push(ws);
    }
  }

  // // sending message
  ws.on("message", async (data) => {
    channelHandler(JSON.parse(data));
  });

  // handling what to do when clients disconnects from server
  ws.on("close", (code, reason) => { });
  // handling client connection error
  ws.onerror = function () {
    // console.log("Some Error occurred");
  };
});

async function channelHandler(msg) {
  if (msg.channel == "SEND_MESSAGE") {
    const data = await adminapi.insertUserMessageSocket(msg.data);
    if (msg.data.c_type == 0) {
      await sendWsMessage(msg.data.receiver_id, msg);
      let staffchat = await adminapi.getUsersChat(msg.data);
      let uid = { uid: msg.data.u_id, chat_user_type: 0 };
      let customer = await adminapi.getChatCustomerListSocket(uid);
      let respdata = {
        channel: "READ_CHAT",
        data: {
          staffchat: staffchat.data,
          customer: customer.data,
        },
      };
      sendWsMessage(msg.data.u_id, respdata);
    } else if (msg.data.c_type == 1) {
      // Send Message To Group Users Except Sender User
      let sql = `SELECT chat_group_members.*,chat_groups.g_name FROM chat_group_members,chat_groups WHERE chat_group_members.group_id = chat_groups.group_id and  chat_group_members.group_id = ${msg.data.receiver_id}`;
      await new Promise((resolve, reject) => {
        con.query(sql, async function (err, result) {
          if (err) {
            console.log(err);
            resolve({ status: 0, message: "Something went to wrong" });
          } else {
            if (result.length > 0) {
              for (let index = 0; index < result.length; index++) {
                const singleGroupMember = result[index];
                if (msg.data.sender_id != singleGroupMember.m_u_id) {
                  let respdata1 = {
                    channel: "SEND_MESSAGE",
                    data: { ...msg.data, created_timestamp: moment().format("YYYY-MM-DD HH:mm:ss"), chat_user_type: singleGroupMember.chat_user_type, g_name: singleGroupMember.g_name },
                  };
                  if (singleGroupMember.chat_user_type == 1) {
                    sendMessageToCustomer(singleGroupMember.m_u_id, respdata1);
                  } else {
                    sendWsMessage(singleGroupMember.m_u_id, respdata1);
                  }
                }
              }
            }
          }
          resolve({ status: 1 });
        });
      });
      uid = { uid: msg.data.u_id, chat_user_type: msg.data.chat_user_type };
      let groupList = await adminapi.getChatCustomerListSocket(uid);
      let respdata = {
        channel: "READ_CHAT_GROUP",
        data: {
          groupList: groupList.data,
        },
      };
      if (msg.data.chat_user_type == 1) {
        sendMessageToCustomer(msg.data.u_id, respdata);
      } else {
        sendWsMessage(msg.data.u_id, respdata);
      }
    } else {
      sendWsMessage(msg.data.receiver_id, msg);
    }
  } else if (msg.channel == "READ_CHAT") {
    await adminapi.readchat(msg.data);
    let staffchat = await adminapi.getUsersChat(msg.data);
    let uid = { uid: msg.data.login_id, chat_user_type: msg.data.chat_user_type };
    let customer = await adminapi.getChatCustomerListSocket(uid);
    let respdata = {
      channel: "READ_CHAT",
      data: {
        staffchat: staffchat.data,
        customer: customer.data,
      },
    };
    sendWsMessage(msg.data.login_id, respdata);
  } else if (msg.channel == "READ_CHAT_GROUP") {
    await adminapi.readchat(msg.data);
    let groupList = await adminapi.getChatCustomerListSocket({ uid: msg.data.login_id, chat_user_type: msg.data.chat_user_type });
    let respdata = {
      channel: "READ_CHAT_GROUP",
      data: {
        groupList: groupList.data,
      },
    };
    sendWsMessage(msg.data.login_id, respdata);
  } else if (msg.channel == "GET_STAFFFOR_CHAT") {
    let staffchat = await adminapi.getUsersChat(msg.data);
    let respdata = {
      channel: "GET_STAFFFOR_CHAT",
      data: staffchat.data,
    };
    sendWsMessage(msg.data.u_id, respdata);
  } else if (msg.channel == "GET_GROUPFOR_CHAT") {
    let groupList = await adminapi.getChatCustomerListSocket({ uid: msg.data.login_id, chat_user_type: msg.data.chat_user_type });
    let respdata = {
      channel: "READ_CHAT_GROUP",
      data: {
        groupList: groupList.data,
      },
    };
    if (msg.data.chat_user_type == 1) {
      sendMessageToCustomer(msg.data.login_id, respdata);
    } else {
      sendWsMessage(msg.data.login_id, respdata);
    }
  } else if (msg.channel == "GET_CHAT_BY_ID") {
    let chatdata = await adminapi.getChatByIDSocket(msg.data);
    adminapi.readchat(msg.data);
    let staffchat = { data: [] };
    if (msg.data.chat_user_type == 0) {
      staffchat = await adminapi.getUsersChat(msg.data);
    }
    let uid = { uid: msg.data.u_id, chat_user_type: msg.data.chat_user_type };
    let customer = await adminapi.getChatCustomerListSocket(uid);
    let tdata = await adminapi.chatnotification({ u_id: msg.data.u_id });
    let respdata = {
      channel: "GET_CHAT_BY_ID",
      data: {
        chatdata: chatdata.data,
        staffdata: staffchat.data,
        customer: customer.data,
        NotificationData: tdata
      },
    };
    if (msg.data.chat_user_type == 1) {
      await sendMessageToCustomer(msg.data.u_id, respdata);
    } else {
      await sendWsMessage(msg.data.u_id, respdata);
    }
  } else if (msg.channel == "SEARCH_MAIN_CUSTOMER") {
    let main_customer = await adminapi.searchMainCustomerChat(msg.data);
    let respdata = {
      channel: "SEARCH_MAIN_CUSTOMER",
      data: main_customer,
    };
    sendWsMessage(msg.data.created_id, respdata);
  } else if (msg.channel == "GET_ALLCHAT_CUSTOMER") {
    let cus = await adminapi.getChatCustomerListSocket(msg.data);
    let respdata = {
      channel: "GET_ALLCHAT_CUSTOMER",
      data: cus.data,
    };
    sendWsMessage(msg.data.uid, respdata);
  } else if (msg.channel == "GET_CHAT_BY_ID_CUS") {
    let chatdata = await adminapi.getChatByIDSocket(msg.data);
    let obj = { sender_id: msg.data.s_c_id, receiver_id: msg.data.login_id };
    let staffchat = await adminapi.getCustomerUserSocket(obj);
    let respdata = {
      channel: "GET_CHAT_BY_ID_CUS",
      data: {
        chatdata: chatdata.data,
        staffdata: staffchat.data,
      },
    };
    sendMessageToCustomer(msg.data.login_id, respdata);
  } else if (msg.channel == "SEND_TASK") {
    const tdata = await adminapi.newtasknotification(msg.data);
    let respdata = {
      channel: "GET_TASK_DATA",
      data: {
        counter: tdata.counter,
        data: tdata.data,
      },
    };
    sendWsMessage(msg.data.allocate_id, respdata);
  } else if (msg.channel == "SEND_DRAFTRECEIPT") {
    const ddata = await adminapi.getAlldraftreceipt(msg.data);
    let respdata = {
      channel: "GET_DRAFT_DATA",
      data: {
        counter: ddata.counter,
        data: ddata.data,
      },
    };
    sendWsMessage(msg.data.uid, respdata);
    if (ddata.user_type == 3 || ddata.user_type == 1) {
      if (msg.data.lbranchid == msg.data.bid || ddata.user_type == 3) {
        msg.data = { ...msg.data, qcid: 1 };
        const sddata = await adminapi.getAllsocketdraftreceipt(msg.data);
        let respdata1 = {
          channel: "GET_DRAFT_DATA",
          data: {
            counter: sddata.counter,
            data: sddata.data,
          },
        };
        sendWsMessage(sddata.buid, respdata1);
      }
      msg.data = { ...msg.data, qcid: 0 };
      const mddata = await adminapi.getAllsocketdraftreceipt(msg.data);
      let mrespdata1 = {
        channel: "GET_DRAFT_DATA",
        data: {
          counter: mddata.counter,
          data: mddata.data,
        },
      };
      sendWsMessage(1, mrespdata1);
    }
  } else if (msg.channel == "SEND_BRANCHTRANSFER") {
    const data = await adminapi.newCustomerofAnotherBranch(msg.data);
    let respdata = {
      channel: "GET_BRANCHTRANSFER",
      data: {
        counter: data.counter,
        data: data.data,
      },
    };
    if (msg.data.branch_id == 1) {
      sendWsMessage(1, respdata);
    }
    sendWsMessage(msg.data.u_id, respdata);
  } else if (msg.channel == "SEND_NEWLEAD") {
    const tdata = await adminapi.getAllNewLead(msg.data);

    let respdata = {
      channel: "READ_NEWLEAD",
      data: {
        counter: tdata.counter,
        data: tdata.data,
      },
    };
    sendWsMessage(msg.data.id, respdata);
    if (tdata.status == 1 && tdata.buid != null) {
      msg.data = { ...msg.data, id: tdata.buid };
      const tdata1 = await adminapi.getAllNewLead(msg.data);
      let respdata = {
        channel: "READ_NEWLEAD",
        data: {
          counter: tdata1.counter,
          data: tdata1.data,
        },
      };
      sendWsMessage(tdata.buid, respdata);
    }
    if (msg.data.uid != 1) {
      msg.data = { ...msg.data, id: 1 };
      const tdata2 = await adminapi.getAllNewLead(msg.data);
      let respdata2 = {
        channel: "READ_NEWLEAD",
        data: {
          counter: tdata2.counter,
          data: tdata2.data,
        },
      };
      sendWsMessage(1, respdata2);
    }
  } else if (msg.channel == "SEND_PROCESSOVERDUE") {
    const data = await adminapi.getallprocessoverdue(msg.data);

    let respdata = {
      channel: "READ_PROCESSOVERDUE",
      data: {
        total: data.total,
        data: data.data,
        status: data.status,
      },
    };
    sendWsMessage(msg.data.uid, respdata);

    //Sending To Branch Admin

    msg.data = {
      ...msg.data,
      uid: data.bresponse.u_id,
      branch_id: data.bresponse.branch_id,
      user_type: data.bresponse.user_type,
    };
    const data1 = await adminapi.getallprocessoverdue(msg.data);

    let respdata1 = {
      channel: "READ_PROCESSOVERDUE",
      data: {
        total: data1.total,
        data: data1.data,
        status: data1.status,
      },
    };
    sendWsMessage(data.bresponse.u_id, respdata1);

    //Sending To superadmin
    msg.data = {
      ...msg.data,
      uid: data.sresponse.u_id,
      branch_id: data.sresponse.branch_id,
      user_type: data.sresponse.user_type,
    };
    const data2 = await adminapi.getallprocessoverdue(msg.data);

    let respdata2 = {
      channel: "READ_PROCESSOVERDUE",
      data: {
        total: data2.total,
        data: data2.data,
        status: data2.status,
      },
    };
    sendWsMessage(data.sresponse.u_id, respdata2);
  } else if (msg.channel == "INSERT_DAILY_ANSWER") {
    const data = await adminapi.insertDailyQueAns(msg.data);
    const r_id = JSON.parse(msg.data.receiver_id);
    r_id.map(async (val, i) => {
      let newmsg = {
        channel: "SEND_MESSAGE",
        data: {
          sender_id: msg.data.sender_id,
          sender_name: msg.data.sender_name,
          message: msg.data.message,
          receiver_id: val,
          c_type: 0,
        },
      };
      await sendWsMessage(val, newmsg);
    });
  } else if (msg.channel == "GET_CUSTOMER_USER") {
    const data = await adminapi.getCustomerUser(msg.data);
    let respdata = {
      channel: "GET_CUSTOMER_USER",
      data: data.data,
    };
    sendMessageToCustomer(msg.data.receiver_id, respdata);
  } else if (msg.channel == "READ_CHAT_CUS") {
    let readchat = await adminapi.readchat(msg.data);
    const data = await adminapi.getCustomerUser(msg.data);
    let respdata = {
      channel: "GET_CUSTOMER_USER",
      data: data.data,
    };
    sendMessageToCustomer(msg.data.receiver_id, respdata);
  } else if (msg.channel == "GET_PICKUP_HANDLER") {
    let allInPickup = await adminapi.getAllinpickuplist(msg.data);
    let allOutPickup = await adminapi.getAlloutpickuplist(msg.data);
    let respdata = {
      channel: "GET_PICKUP_HANDLER",
      data: {
        allInPickup: allInPickup,
        allOutPickup: allOutPickup,
      },
    };
    sendWsMessage(msg.data.id, respdata);
  } else if (msg.channel == "GET_PICKUP_DONE") {
    let pickupdone = await adminapi.getAllpickupdonelist(msg.data);
    let respdata = {
      channel: "GET_PICKUP_DONE",
      data: pickupdone,
    };
    sendWsMessage(msg.data.id, respdata);
  } else if (msg.channel == "SEND_HOLDSTATUS") {
    const data = await adminapi.getAllHoldApplication(msg.data);

    let respdata = {
      channel: "READ_HOLDSTATUS",
      data: {
        counter: data.counter,
        data: data.data,
        status: data.status,
      },
    };

    sendWsMessage(msg.data.u_id, respdata);

    //Sending To Branch Admin

    msg.data = {
      ...msg.data,
      u_id: data.bresponse.u_id,
      branch_id: data.bresponse.branch_id,
    };
    const data1 = await adminapi.getAllHoldApplication(msg.data);

    let respdata1 = {
      channel: "READ_HOLDSTATUS",
      data: {
        counter: data1.counter,
        data: data1.data,
        status: data1.status,
      },
    };

    sendWsMessage(data.bresponse.u_id, respdata1);

    //Sending To superadmin
    msg.data = {
      ...msg.data,
      u_id: data.sresponse.u_id,
      branch_id: data.sresponse.branch_id,
    };
    const data2 = await adminapi.getAllHoldApplication(msg.data);

    let respdata2 = {
      channel: "READ_HOLDSTATUS",
      data: {
        counter: data2.counter,
        data: data2.data,
        status: data2.status,
      },
    };
    sendWsMessage(data.sresponse.u_id, respdata2);
  } else if (msg.channel == "SEND_LEADFOLLOWUP") {
    const tdata = await adminapi.getTodayLFollowup(msg.data);
    let respdata = {
      channel: "GET_LEAD_FOLLOWUP_DATA",
      data: {
        counter: tdata.counter,
        data: tdata.data,
      },
    };
    sendWsMessage(1, respdata);
    sendWsMessage(tdata.u_id, respdata);
    sendWsMessage(msg.data.id, respdata);
  } else if (msg.channel == "SEND_CHAT_NOTIFICATION") {
    if (msg.data.c_type == 1) {
      let sql = `SELECT * FROM chat_group_members WHERE group_id = ${msg.data.u_id}`;
      await new Promise((resolve, reject) => {
        con.query(sql, async function (err, result) {
          if (err) {
            console.log(err);
            resolve({ status: 0, message: "Something went to wrong" });
          } else {
            if (result.length > 0) {
              for (let index = 0; index < result.length; index++) {
                const singleGroupMember = result[index];
                if (msg.data.login_id != singleGroupMember.m_u_id) {
                  const tdata = await adminapi.chatnotification({ u_id: singleGroupMember.m_u_id });
                  let respdata1 = {
                    channel: "GET_CHAT_NOTIFICATION",
                    data: {
                      counter: tdata.counter,
                      data: tdata.data,
                    },
                  };
                  sendWsMessage(singleGroupMember.m_u_id, respdata1);
                }
              }
            }
          }
        });
      });
    } else {
      const tdata = await adminapi.chatnotification({ u_id: msg.data.u_id });
      let respdata = {
        channel: "GET_CHAT_NOTIFICATION",
        data: {
          counter: tdata.counter,
          data: tdata.data,
        },
      };
      sendWsMessage(msg.data.u_id, respdata);
    }
  } else if (msg.channel == "SEND_CUSTOMERFOLLOWUP") {
    const tdata = await adminapi.getTodayCFollowup(msg.data);
    let respdata = {
      channel: "GET_CUSTOMER_FOLLOWUP_DATA",
      data: {
        counter: tdata.counter,
        data: tdata.data,
      },
    };
    sendWsMessage(1, respdata);
    sendWsMessage(tdata.u_id, respdata);
    sendWsMessage(msg.data.id, respdata);
  } else if (msg.channel == "SEND_CASHFLOW") {
    const data = await adminapi.getallcashflow();
    let respdata = {
      channel: "GET_CASHFLOW",
      data: {
        counter: data.counter,
        data: data.data,
      },
    };
    sendWsMessage(1, respdata);
  } else if (msg.channel == "SEND_DISPATCHING_APPLICATIONS") {
    const data = await adminapi.getallDispatchingApplication(msg.data);
    let respdata = {
      channel: "GET_DISPATCHING_APPLICATIONS",
      data: {
        counter: data.counter,
        data: data.data,
        status: data.status,
      },
    };
    sendWsMessage(msg.data.u_id, respdata);

    //Sending To Branch Admin

    msg.data = {
      ...msg.data,
      u_id: data.bresponse.u_id,
      branch_id: data.bresponse.branch_id,
    };
    const data1 = await adminapi.getallDispatchingApplication(msg.data);

    let respdata1 = {
      channel: "GET_DISPATCHING_APPLICATIONS",
      data: {
        counter: data1.counter,
        data: data1.data,
        status: data1.status,
      },
    };
    sendWsMessage(data.bresponse.u_id, respdata1);

    //Sending To superadmin
    msg.data = {
      ...msg.data,
      u_id: data.sresponse.u_id,
      branch_id: data.sresponse.branch_id,
    };
    const data2 = await adminapi.getallDispatchingApplication(msg.data);

    let respdata2 = {
      channel: "GET_DISPATCHING_APPLICATIONS",
      data: {
        counter: data2.counter,
        data: data2.data,
        status: data2.status,
      },
    };
    sendWsMessage(data.sresponse.u_id, respdata2);
  }
}

//Due Amount mail send to customer (3 Months)
//cron schedule format (* * * * *) (min hr day mm yy)
//service process limit cron scedule
var task = cron1.schedule(`30 12 * * *}`, async () => {
  await adminapi.sendMailofApplicationStatus(); // await adminapi.sendMailofDetailStatus();
  await adminapi.sendcronleadstatusmail(); // await adminapi.sendleadstatusmail();
  await adminapi.sendmailofprocesslimittousers();
  await adminapi.sendMailOfProcessLimitDate();
  await adminapi.feedbackmailsend();
  await adminapi.sendmailallcustomer();
});
task.start();

var task2 = cron2.schedule(`*/5 * * * *`, async () => {
  await adminapi.setAttestationDetailStatusCron();
  await adminapi.setApostilleDetailStatusCron();
  await adminapi.setTranslationDetailStatusCron();
  await adminapi.setVisaDetailStatusCron();
  await adminapi.NextFollowupAutomation();
  await adminapi.NextCustFollowupAutomation();
});
task2.start();

var task3 = cron3.schedule(`30 09 * * *`, async () => {
  await adminapi.sendEnquiryCronMail();
});
task3.start();

var task4 = cron4.schedule(`30 13 * * *`, async () => {
  await adminapi.sendReadyforDispatchCronMail();
  await adminapi.sendReadyforDispatchUserCronMail();
});
task4.start();

var task5 = cron5.schedule(`00 10 * * *`, async () => {
  await adminapi.sendMailofHoldApplicationStatus();
});
task5.start();
//ready for delivery status change then next day send mail alternate day
let task1date = moment().format("DD");
var task1 = cron.schedule(`00 13 * * *}`, async () => {
  await adminapi.sendServiceStatusMail();
});
if (task1date % 2 == 1) {
  task1.start();
} else {
  task1.stop();
}

var logout_todayUser = cron.schedule(`59 23 * * *}`, async () => {
  await adminapi.logoutTodayUser();
});
logout_todayUser.start();

app.get("/", function (req, res) {
  res.send({
    message: "Working",
    status: 1,
  });
});

//Login
app.post("/login", async function (req, res) {
  const ip = req.socket.remoteAddress.split(":");
  console.log(ip);
  const data = await auth.login(
    req.body.email,
    req.body.password,
    ip[3],
    req.body.otp
  );
  res.send({
    ...data,
  });
});

//OTP
app.post("/otp", async function (req, res) {
  const data = await adminapi.sendOtp(req.body);
  res.send({
    ...data,
  });
});

//get-cashflowdetails
app.get("/get-cashflowdetails/:cashflow_id", async function (req, res) {
  const data = await adminapi.getpaymentDataByCashflow(req.params);
  res.send({
    ...data,
  });
});

//Verify OTP
app.post("/verifyotp", async function (req, res) {
  const data = await adminapi.verifyOtp(req.body);
  res.send({
    ...data,
  });
});

//Set New Password
app.post("/setnewpassword", async function (req, res) {
  const data = await adminapi.setNewPassword(req.body);
  res.send({
    ...data,
  });
});

//ChangePassword
app.post("/changepassword", async function (req, res) {
  const data = await adminapi.setChangePassword(req.body);
  res.send({
    ...data,
  });
});

//Update UserData
app.post("/updateuserdata", async function (req, res) {
  if (req.files != null) {
    var currentdate = new Date();
    var time = currentdate.getTime();
    if (req.files.invoice_signature != null) {
      const file = req.files.invoice_signature;
      var filename = time + ".jpg";
      let newpath = paths.join(
        __dirname,
        "/public/Assets/images/invoicesignature/"
      );
      file.mv(`${newpath}${filename}`, function (err) { });
    }
    if (req.files.u_image != null) {
      const ufile = req.files.u_image;
      var ufilename = time + ".jpg";
      let unewpath = paths.join(
        __dirname,
        "/public/Assets/images/profileImage/"
      );
      ufile.mv(`${unewpath}${ufilename}`, function (err) { });
    }
    const data = await adminapi.updateUserData(req.body, filename, ufilename);
    res.send({
      ...data,
    });
  } else {
    const data = await adminapi.updateUserData(req.body);
    res.send({
      ...data,
    });
  }
});

//Insert Attribute
app.post("/insert-attribute", async function (req, res) {
  const data = await adminapi.insertAttribute(req.body);
  res.send({
    ...data,
  });
});

//Get AllAttributes
app.get("/get-allattribute/:type/:page/:perpage", async function (req, res) {
  const data = await adminapi.getallAttribute(req.params);
  res.send({
    ...data,
  });
});

//Update Attribute Status
app.post("/update-attrstatus", async function (req, res) {
  const data = await adminapi.updateattrstatus(req.body);
  res.send({
    ...data,
  });
});

//Update Attribute
app.post("/update-attribute", async function (req, res) {
  const data = await adminapi.updateattribute(req.body);
  res.send({
    ...data,
  });
});

//Insert Branch
app.post("/insert-branch", async function (req, res) {
  const file = req.files.logo;
  var currentdate = new Date();
  var time = currentdate.getTime();
  var filename = time + ".jpg";
  // const filename = req.files.logo.name;
  let newpath = paths.join(__dirname, "/public/Assets/images/branchlogo/");
  file.mv(`${newpath}${filename}`, function (err) { });
  const data = await adminapi.insertBranch(req.body, filename);
  res.send(data);
});

//Get AllBranch
app.get("/get-allbranch", async function (req, res) {
  const data = await adminapi.getallBranch();
  res.send({
    ...data,
  });
});

//Update Branch
app.post("/update-branch", async function (req, res) {
  let filename = "null";
  if (req.files != undefined) {
    const file = req.files.logo;
    var currentdate = new Date();
    var time = currentdate.getTime();
    filename = time + ".jpg";
    let newpath = paths.join(__dirname, "/public/Assets/images/branchlogo/");
    file.mv(`${newpath}${filename}`, function (err) { });
    const data = await adminapi.updatebranch(req.body, filename);
    res.send(data);
  } else {
    const data = await adminapi.updatebranch(req.body);
    res.send(data);
  }
});

//Delete Branch
app.get("/delete-branch/:id", async function (req, res) {
  const data = await adminapi.deleteBranch(req.params);
  res.send({
    ...data,
  });
});

//Get Type Country For Service price
app.get("/get-typecountry/:type/:country", async function (req, res) {
  const data = await adminapi.gettypecountry(req.params);
  res.send({
    ...data,
  });
});

//Insert Service
app.post("/insert-service", async function (req, res) {
  const data = await adminapi.insertService(req.body);
  res.send({
    ...data,
  });
});

//Delete Service
app.get("/delete-service/:id", async function (req, res) {
  const data = await adminapi.deleteService(req.params);
  res.send({
    ...data,
  });
});

//Get AllService
app.get("/get-allservice/:page/:perpage", async function (req, res) {
  const data = await adminapi.getallService(req.params);
  res.send({
    ...data,
  });
});

//Insert Feature
app.post("/insert-feature", async function (req, res) {
  const data = await adminapi.insertFeature(req.body);
  res.send({
    ...data,
  });
});

//Get AllFeature
app.get("/get-allFeature", async function (req, res) {
  const data = await adminapi.getallFeature();
  res.send({
    ...data,
  });
});

//Update Feature
app.post("/update-feature", async function (req, res) {
  const data = await adminapi.updateFeature(req.body);
  res.send({
    ...data,
  });
});

//Delete Feature
app.get("/delete-feature/:id", async function (req, res) {
  const data = await adminapi.deleteFeature(req.params);
  res.send({
    ...data,
  });
});

//Get LandSource
app.get("/get-leadsource", async function (req, res) {
  const data = await adminapi.getLeadSource();
  res.send({
    ...data,
  });
});

//Insert Lead
app.post("/insert-lead", async function (req, res) {
  const data = await adminapi.insertLead(req.body);
  res.send({
    ...data,
  });
});

//Get All Lead
app.get("/get-alllead/:id/:page/:perpage", async function (req, res) {
  const data = await adminapi.getAllLead(req.params);
  res.send({
    ...data,
  });
});

//Delete Lead
app.get("/delete-lead/:id", async function (req, res) {
  const data = await adminapi.deleteLead(req.params);
  res.send({
    ...data,
  });
});

//Update Lead
app.post("/update-lead", async function (req, res) {
  const data = await adminapi.updateLead(req.body);
  res.send({
    ...data,
  });
});

//Search Lead
app.post("/search-lead", async function (req, res) {
  const data = await adminapi.searchlead(req.body);
  res.send({
    ...data,
  });
});

//Get All branch
app.get("/get-allbranch", async function (req, res) {
  const data = await adminapi.getAllBranch();
  res.send({
    ...data,
  });
});

//Get user-branch Admin-staff
app.get("/get-users/:bid/:uid", async function (req, res) {
  const data = await adminapi.getUsers(req.params);
  res.send({
    ...data,
  });
});

//Get All Lead Status
app.get("/get-allleadstatus", async function (req, res) {
  const data = await adminapi.getAllLeadStatus();
  res.send({
    ...data,
  });
});

//update-leadbranch
app.post("/update-leadbranch", async function (req, res) {
  const data = await adminapi.updateLeadBranch(req.body);
  res.send({
    ...data,
  });
});

//update-leadstatus
app.post("/update-leadstatus", async function (req, res) {
  if (req.files != undefined) {
    const file = req.files.pick_img;
    var currentdate = new Date();
    var time = currentdate.getTime();
    var filename = time + ".jpg";
    let newpath = paths.join(__dirname, "/public/Assets/images/lead_pick_img/");
    file.mv(`${newpath}${filename}`, function (err) { });
    const data = await adminapi.updateLeadStatus(req.body, filename);
    res.send(data);
  } else {
    const data = await adminapi.updateLeadStatus(req.body);
    res.send({
      ...data,
    });
  }
  // const data = await adminapi.updateLeadStatus(req.body);
  // res.send({
  //   ...data,
  // });
});

//update-leadpriority
app.post("/update-leadpriority", async function (req, res) {
  const data = await adminapi.updateLeadPriority(req.body);
  res.send({
    ...data,
  });
});

//insert-followup
app.post("/insert-followup", async function (req, res) {
  const data = await adminapi.insertFollowup(req.body);
  res.send({
    ...data,
  });
});

//Get Followup By Lead_id
app.post("/get-followup", async function (req, res) {
  const data = await adminapi.getFollowUp(req.body);
  res.send({
    ...data,
  });
});

app.get("/get-setting", async function (req, res) {
  const data = await adminapi.getsettingdata();
  res.send({
    ...data,
  });
});

// Update - Setting Admin
app.post("/update-setting", async function (req, res) {
  let filename = "null";
  if (req.files != undefined) {
    const file = req.files.logo;
    var currentdate = new Date();
    var time = currentdate.getTime();
    filename = time + ".jpg";
    let newpath = paths.join(__dirname, "/public/Assets/images/adminlogo/");
    file.mv(`${newpath}${filename}`, function (err) { });
    const data = await adminapi.updateSetting(req.body, filename);
    res.send(data);
  } else {
    const data = await adminapi.updateSetting(req.body);
    res.send(data);
  }
});

//insert-smstemplate
app.post("/insert-smstemplate", async function (req, res) {
  const data = await adminapi.insertSMSTemplate(req.body);
  res.send({
    ...data,
  });
});

//Get All SMSTemlate
app.get("/get-allsmstemlate", async function (req, res) {
  const data = await adminapi.getAllSMStemlate();
  res.send({
    ...data,
  });
});

//Delete SMSTemplate
app.get("/delete-smstemplate/:id", async function (req, res) {
  const data = await adminapi.deleteSMSTemlate(req.params);
  res.send({
    ...data,
  });
});

//update-smstemplate
app.post("/update-smstemplate", async function (req, res) {
  const data = await adminapi.updateSMSTemplate(req.body);
  res.send({
    ...data,
  });
});

//update-allocatedto
app.post("/update-allocatedto", async function (req, res) {
  const data = await adminapi.updateAllocatedTo(req.body);
  res.send({
    ...data,
  });
});

//sakshi
app.post("/insert-role", async function (req, res) {
  const data = await adminapi.insertrole(req.body);
  res.send({
    ...data,
  });
});

app.get("/get-allrole", async function (req, res) {
  const data = await adminapi.getroledata();
  res.send({
    ...data,
  });
});

app.get("/get-rolepermission/:id", async function (req, res) {
  const data = await adminapi.getrolepermission(req.params);
  res.send({
    ...data,
  });
});

app.post("/update-role", async function (req, res) {
  const data = await adminapi.updaterole(req.body);
  res.send({
    ...data,
  });
});

app.post("/insert-user", async function (req, res) {
  if (req.files != null) {
    var currentdate = new Date();
    var time = currentdate.getTime();
    let filename = "";
    let ifilename = "";
    if (typeof req.files.u_image != "undefined") {
      const file = req.files.u_image;
      filename = time + "_" + req.body.u_name + ".jpg";
      let newpath = paths.join(
        __dirname,
        "/public/Assets/images/profileImage/"
      );
      file.mv(`${newpath}${filename}`, function (err) { });
    }
    if (typeof req.files.invoice_signature != "undefined") {
      const ifile = req.files.invoice_signature;
      ifilename = time + ".jpg";
      let inewpath = paths.join(
        __dirname,
        "/public/Assets/images/invoicesignature/"
      );
      ifile.mv(`${inewpath}${ifilename}`, function (err) { });
    }
    const data = await adminapi.insertUser(req.body, filename, ifilename);
    res.send({
      ...data,
    });
  } else {
    const data = await adminapi.insertUser(req.body);
    res.send({
      ...data,
    });
  }
});

app.get("/get-userbyparent/:id/:branch_id", async function (req, res) {
  const data = await adminapi.getuserbyparent(req.params);
  res.send({
    ...data,
  });
});

app.get("/get-userpermission/:id", async function (req, res) {
  const data = await adminapi.getuserpermission(req.params);
  res.send({
    ...data,
  });
});

app.post("/update-user", async function (req, res) {
  if (req.files != null) {
    var currentdate = new Date();
    var time = currentdate.getTime();
    let filename = "";
    let ifilename = "";
    if (typeof req.files.u_image != "undefined") {
      const file = req.files.u_image;
      filename = time + "_" + req.body.u_name + ".jpg";
      let newpath = paths.join(
        __dirname,
        "/public/Assets/images/profileImage/"
      );
      file.mv(`${newpath}${filename}`, function (err) { });
    }
    if (typeof req.files.invoice_signature != "undefined") {
      const ifile = req.files.invoice_signature;
      ifilename = time + ".jpg";
      let inewpath = paths.join(
        __dirname,
        "/public/Assets/images/invoicesignature/"
      );
      ifile.mv(`${inewpath}${ifilename}`, function (err) { });
    }
    const data = await adminapi.updateuser(req.body, filename, ifilename);
    res.send({
      ...data,
    });
  } else {
    const data = await adminapi.updateuser(req.body);
    res.send({
      ...data,
    });
  }
});

app.get("/delete-user/:id", async function (req, res) {
  const data = await adminapi.deleteUser(req.params);
  res.send({
    ...data,
  });
});

app.get("/getuserbytype/:id", async function (req, res) {
  const data = await adminapi.getuserbytype(req.params);
  res.send({
    ...data,
  });
});

app.post("/insert-managerallocation", async function (req, res) {
  const data = await adminapi.insertmanagerallocation(req.body);
  res.send({
    ...data,
  });
});

app.get("/get-allocationlist", async function (req, res) {
  const data = await adminapi.getallocationlist();
  res.send({
    ...data,
  });
});

app.get("/get-branchallocationlist/:id", async function (req, res) {
  const data = await adminapi.getbranchallocationlist(req.params);
  res.send({
    ...data,
  });
});

app.post("/update-managerallocation", async function (req, res) {
  const data = await adminapi.updatemanagerallocation(req.body);
  res.send({
    ...data,
  });
});

app.get("/delete-managerallocation/:id", async function (req, res) {
  const data = await adminapi.deletemanagerallocation(req.params);
  res.send({
    ...data,
  });
});

app.get("/delete-allocatedbranchbyid/:id/:bid", async function (req, res) {
  const data = await adminapi.deleteallocatedbranchbyid(req.params);
  res.send({
    ...data,
  });
});

// Get Template Category
app.get("/get-template-category", async function (req, res) {
  const data = await adminapi.getemailtemplatecategory();
  res.send({
    ...data,
  });
});

//Change Template Status
app.post("/change-templatestatus", async function (req, res) {
  const data = await adminapi.updatetemplatestatus(req.body);
  res.send({
    ...data,
  });
});

//get Template SubCategory
app.get("/get-template-subcategory/:id", async function (req, res) {
  const data = await adminapi.gettemplatesubcategory(req.params);
  res.send({
    ...data,
  });
});

//Insert Email Template
app.post("/insert-emailTemplate", async function (req, res) {
  if (req.files != undefined) {
    const myfile = req.files.file;
    let newpath = paths.join(
      __dirname,
      "/public/Assets/images/emailtemplateimage/"
    );
    let recordname = [];
    if (req.files && myfile.length != undefined) {
      for (i = 0; i < myfile.length; i++) {
        // var currentdate = new Date();
        // var time = currentdate.getTime();
        // var name = Math.floor(Math.random() * 1000000) + "_" + time + ".jpg";
        var name = myfile[i].name;
        recordname.push(name);
        myfile[i].mv(`${newpath}${name}`, function (err) { });
      }
    } else {
      // var currentdate = new Date();
      // var time = currentdate.getTime();
      // var name = Math.floor(Math.random() * 1000000) + "_" + time + ".jpg";
      var name = myfile.name;
      recordname.push(name);
      myfile.mv(`${newpath}${name}`, function (err) { });
    }
    const data = await adminapi.insertEmailTemplate(req.body, recordname);
    res.send({
      ...data,
    });
  } else {
    const data = await adminapi.insertEmailTemplate(req.body);
    res.send({
      ...data,
    });
  }
});

//Get All Email Template
app.get("/get-emailtemplate", async function (req, res) {
  const data = await adminapi.getemailtemplate();
  res.send({
    ...data,
  });
});

//update email template
app.post("/update-emailtemplate", async function (req, res) {
  let recordname = [];
  if (req.files != undefined) {
    const myfile = req.files.file;
    let newpath = paths.join(
      __dirname,
      "/public/Assets/images/emailtemplateimage/"
    );

    if (req.files && myfile.length != undefined) {
      for (i = 0; i < myfile.length; i++) {
        // var currentdate = new Date();
        // var time = currentdate.getTime();
        // var name = Math.floor(Math.random() * 1000000) + "_" + time + ".jpg";
        var name = myfile[i].name;
        recordname.push(name);
        myfile[i].mv(`${newpath}${name}`, function (err) { });
      }
    } else {
      // var currentdate = new Date();
      // var time = currentdate.getTime();
      // var name = Math.floor(Math.random() * 1000000) + "_" + time + ".jpg";
      var name = myfile.name;
      recordname.push(name);
      myfile.mv(`${newpath}${name}`, function (err) { });
    }
    const data = await adminapi.updateEmailTemplate(req.body, recordname);
    res.send({
      ...data,
    });
  } else {
    const data = await adminapi.updateEmailTemplate(req.body);
    res.send({
      ...data,
    });
  }
});

//delete email template
app.get("/delete-emailtemplate/:id", async function (req, res) {
  const data = await adminapi.deleteEmailTemplate(req.params);
  res.send({
    ...data,
  });
});

app.get("/get-branchdata/:id", async function (req, res) {
  const data = await adminapi.getbranchdatabyid(req.params);
  res.send({
    ...data,
  });
});

//get attribute by id
app.get("/get-attributebyid/:id", async function (req, res) {
  const data = await adminapi.getAttributebyid(req.params);
  res.send({
    ...data,
  });
});

//delete email image
app.get("/delete-emailimage/:id", async function (req, res) {
  const data = await adminapi.deleteEmailImage(req.params);
  res.send({
    ...data,
  });
});

app.post("/update-branchsetting", async function (req, res) {
  let filename = "null";
  if (req.files != undefined) {
    const file = req.files.logo;
    var currentdate = new Date();
    var time = currentdate.getTime();
    filename = time + ".jpg";
    let newpath = paths.join(__dirname, "/public/Assets/images/branchlogo/");
    file.mv(`${newpath}${filename}`, function (err) { });
    const data = await adminapi.updateBranchSetting(req.body, filename);
    res.send(data);
  } else {
    const data = await adminapi.updateBranchSetting(req.body);
    res.send(data);
  }
});

//Insert Task
app.post("/insert-task", async function (req, res) {
  if (req.files != undefined) {
    const myfile = req.files.file;
    let newpath = paths.join(
      __dirname,
      "/public/Assets/images/task_attchment/"
    );
    let recordname = [];
    if (req.files && myfile.length != undefined) {
      for (let i = 0; i < myfile.length; i++) {
        // var currentdate = new Date();
        // var time = currentdate.getTime();
        // var name = Math.floor(Math.random() * 1000000) + "_" + time + ".jpg";
        var name = myfile[i].name;
        recordname.push(name);
        myfile[i].mv(`${newpath}${name}`, function (err) { });
      }
    } else {
      // var currentdate = new Date();
      // var time = currentdate.getTime();
      // var name = Math.floor(Math.random() * 1000000) + "_" + time + ".jpg";
      var name = myfile.name;
      recordname.push(name);
      myfile.mv(`${newpath}${name}`, function (err) { });
    }
    const data = await adminapi.insertTask(req.body, recordname);
    res.send({
      ...data,
    });
  } else {
    const data = await adminapi.insertTask(req.body);
    res.send({
      ...data,
    });
  }
});

//Get task
app.get("/get-alltask/:id/:page/:perPage", async function (req, res) {
  const data = await adminapi.getallTask(req.params);
  res.send({
    ...data,
  });
});

//delete task
app.get("/delete-task/:id", async function (req, res) {
  const data = await adminapi.deleteTask(req.params);
  res.send({
    ...data,
  });
});

//delete task image
app.get("/delete-taskimage/:id", async function (req, res) {
  const data = await adminapi.deleteTaskImage(req.params);
  res.send({
    ...data,
  });
});

//update task
app.post("/update-task", async function (req, res) {
  let recordname = [];
  if (req.files != undefined) {
    const myfile = req.files.file;
    let newpath = paths.join(
      __dirname,
      "/public/Assets/images/task_attchment/"
    );

    if (req.files && myfile.length != undefined) {
      for (i = 0; i < myfile.length; i++) {
        // var currentdate = new Date();
        // var time = currentdate.getTime();
        // var name = Math.floor(Math.random() * 1000000) + "_" + time + ".jpg";
        var name = myfile[i].name;
        recordname.push(name);
        myfile[i].mv(`${newpath}${name}`, function (err) { });
      }
    } else {
      // var currentdate = new Date();
      // var time = currentdate.getTime();
      // var name = Math.floor(Math.random() * 1000000) + "_" + time + ".jpg";
      var name = myfile.name;
      recordname.push(name);
      myfile.mv(`${newpath}${name}`, function (err) { });
    }
    const data = await adminapi.updateTask(req.body, recordname);
    res.send({
      ...data,
    });
  } else {
    const data = await adminapi.updateTask(req.body);
    res.send({
      ...data,
    });
  }
});

//update-taskpriority
app.post("/update-taskpriority", async function (req, res) {
  const data = await adminapi.updateTaskPriority(req.body);
  res.send({
    ...data,
  });
});

//update-taskstatus
app.post("/update-taskstatus", async function (req, res) {
  const data = await adminapi.updateTaskStatus(req.body);
  res.send({
    ...data,
  });
});

//Get today lead followup
app.get("/gettodayleadfollowup/:id", async function (req, res) {
  const data = await adminapi.getTodayLFollowup(req.params);
  res.send({
    ...data,
  });
});

//update taskrevision
app.post("/update-taskrevision", async function (req, res) {
  if (req.files != undefined) {
    const file = req.files.file;
    var currentdate = new Date();
    var time = currentdate.getTime();
    var filename = time + ".jpg";
    let newpath = paths.join(__dirname, "/public/Assets/images/task_feedback/");
    file.mv(`${newpath}${filename}`, function (err) { });
    const data = await adminapi.updateTaskRevision(req.body, filename);
    res.send(data);
  } else {
    const data = await adminapi.updateTaskRevision(req.body);
    res.send(data);
  }
});

//get allfeedback
app.get("/get-taskfeedback/:id", async function (req, res) {
  const data = await adminapi.getTaskFeedback(req.params);
  res.send({
    ...data,
  });
});

//update-taskallocatedto
app.post("/update-taskallocatedto", async function (req, res) {
  const data = await adminapi.updateTaskAllocatedTo(req.body);
  res.send({
    ...data,
  });
});

//Insert task feedback
app.post("/insert-taskfeedback", async function (req, res) {
  if (req.files != undefined) {
    const file = req.files.file;
    // var currentdate = new Date();
    // var time = currentdate.getTime();
    // var filename = time + ".jpg";
    var filename = file.name;
    let newpath = paths.join(__dirname, "/public/Assets/images/task_feedback/");
    file.mv(`${newpath}${filename}`, function (err) { });
    const data = await adminapi.insertTaskFeedback(req.body, filename);
    res.send(data);
  } else {
    const data = await adminapi.insertTaskFeedback(req.body);
    res.send(data);
  }
});

//get-totaltask
app.get("/get-totaltask/:u_id/:t_status", async function (req, res) {
  const data = await adminapi.getTotalTask(req.params);
  res.send({
    ...data,
  });
});

//get-totallead
app.get("/get-totallead/:u_id/:l_service", async function (req, res) {
  const data = await adminapi.getTotalLead(req.params);
  res.send({
    ...data,
  });
});

//get-totaltodaylead
app.get("/get-totaltodaylead/:u_id/:l_service", async function (req, res) {
  let date = moment().format("DD-MM-YYYY");
  const data = await adminapi.getTotalTodayLead(req.params, date);
  res.send({
    ...data,
  });
});

//insert maincustomer
app.post("/insert-maincustomer", async function (req, res) {
  const data = await adminapi.insertmaincustomer(req.body);
  res.send({
    ...data,
  });
});

//get customer
app.get("/get-allcustomer/:page/:perpage/:uid/:bid", async function (req, res) {
  const data = await adminapi.getallcustomer(req.params);
  res.send({
    ...data,
  });
});
//get customer amount
app.post("/get-customer-amount", async function (req, res) {
  const data = await adminapi.getcustomeramount(req.body);
  res.send({
    ...data,
  });
});

//payment update
app.post("/update-payment", async function (req, res) {
  tdate = moment().format("DD-MM-YYYY");
  const data = await adminapi.updatepayment(req.body, tdate);
  res.send({
    ...data,
  });
});

//payment update with additional charges
app.post("/update-paymentWithAdditionalCharges", async function (req, res) {
  const data = await adminapi.updatePaymentwithAdditionalCharges(req.body);
  res.send({
    ...data,
  });
});
//get-payment by id
app.get("/get-payment/:id", async function (req, res) {
  const data = await adminapi.getpayment(req.params);

  res.send({
    ...data,
  });
});

//search customer
app.post("/search-customer", async function (req, res) {
  const data = await adminapi.searchcustomer(req.body);
  res.send({
    ...data,
  });
});

//get customer by id
app.get("/get-customer/:id", async function (req, res) {
  const data = await adminapi.getcustomerbyId(req.params);

  res.send({
    ...data,
  });
});

//update customer
app.post("/update-customer", async function (req, res) {
  const data = await adminapi.updatecustomer(req.body);
  res.send({
    ...data,
  });
});

//get visacustomer
app.get("/get-visacustomer/:u_id/:branch_id/:page/:perPage", async function (
  req,
  res
) {
  const data = await adminapi.getVisaCustomer(req.params);
  res.send({
    ...data,
  });
});

//update visa status
app.post("/update-visastatus", async function (req, res) {
  date = moment().format("DD-MM-YYYY");
  const data = await adminapi.updateVisaStatus(req.body, date);
  res.send({
    ...data,
  });
});

//update visa/attestation status
app.post("/update-detailsstatus", async function (req, res) {
  date = moment().format("DD-MM-YYYY");
  const data = await adminapi.updateDetailsStatus(req.body, date);
  res.send({
    ...data,
  });
});

//delete visa customer
app.get("/delete-visacustomer/:id", async function (req, res) {
  const data = await adminapi.deleteVisaCustomer(req.params);
  res.send({
    ...data,
  });
});

app.post("/check-customer", async function (req, res) {
  const data = await adminapi.checkcustomer(req.body);
  res.send({
    ...data,
  });
});

//get attestationcustomer
app.get(
  "/get-attestationcustomer/:u_id/:branch_id/:page/:perPage",
  async function (req, res) {
    const data = await adminapi.getAttestationCustomer(req.params);
    res.send({
      ...data,
    });
  }
);

//get attestation-customerbyid
app.get("/get-attestationcustomerbyid/:detail_id", async function (req, res) {
  const data = await adminapi.getattestationcustomerbyid(req.params);
  res.send({
    ...data,
  });
});

//update visa customer
app.post("/update-visacustomer", async function (req, res) {
  const data = await adminapi.updateVisaCustomer(req.body);
  res.send({
    ...data,
  });
});

//update attestation status
app.post("/update-attestationstatus", async function (req, res) {
  let date = moment().format("DD-MM-YYYY");
  const data = await adminapi.updateAttestationStatus(req.body, date);
  res.send({
    ...data,
  });
});

//delete  attestation customer
app.get(
  "/delete-attestationcustomer/:id/:branch_state_id/:s_c_gst/:s_s_gst/:s_i_gst",
  async function (req, res) {
    let date = moment().format("DD-MM-YYYY");
    const data = await adminapi.deleteAttestationCustomer(req.params, date);
    res.send({
      ...data,
    });
  }
);

//update attestation customer
app.post("/update-attestationcustomer", async function (req, res) {
  const data = await adminapi.updateAttestationCustomer(req.body);
  res.send({
    ...data,
  });
});

//search visa customer
app.post("/search-visacustomer", async function (req, res) {
  const data = await adminapi.searchVisaCustomer(req.body);
  res.send({
    ...data,
  });
});

//send attestationcover letter mail
app.post("/send-attestationmail", async function (req, res) {
  const data = await adminapi.sendattestationmail(req.body);
  res.send({
    ...data,
  });
});

//send apostillecover letter mail
app.post("/send-apostillemail", async function (req, res) {
  const data = await adminapi.sendapostillemail(req.body);
  res.send({
    ...data,
  });
});

//send visacover letter mail
app.post("/send-visamail", async function (req, res) {
  const data = await adminapi.sendvisaemail(req.body);
  res.send({
    ...data,
  });
});

//search attestation customer
app.post("/search-attestationcustomer", async function (req, res) {
  const data = await adminapi.searchAttestationCustomer(req.body);
  res.send({
    ...data,
  });
});

//Insert customer conversation
app.post("/insert-customerconversation", async function (req, res) {
  if (req.files != undefined) {
    const file = req.files.file;
    var currentdate = new Date();
    var time = currentdate.getTime();
    var filename = time + ".jpg";
    let newpath = paths.join(
      __dirname,
      "/public/Assets/images/customer_conversation/"
    );
    file.mv(`${newpath}${filename}`, function (err) { });
    const data = await adminapi.insertCustomerConversation(req.body, filename);
    res.send(data);
  } else {
    const data = await adminapi.insertCustomerConversation(req.body);
    res.send(data);
  }
});

//get allcomment
app.get("/get-customercomment/:id", async function (req, res) {
  const data = await adminapi.getCustomerComment(req.params);
  res.send({
    ...data,
  });
});

//upload customer file
app.post("/upload-customerfile", async function (req, res) {
  let recordname = [];
  if (req.files != undefined) {
    const myfile = req.files.file;
    let newpath = paths.join(__dirname, "/public/Assets/images/customer_file/");

    if (req.files && myfile.length != undefined) {
      for (i = 0; i < myfile.length; i++) {
        // var currentdate = new Date();
        // var time = currentdate.getTime();
        // var name = Math.floor(Math.random() * 1000000) + "_" + time + ".jpg";
        var name = myfile[i].name;
        recordname.push(name);
        myfile[i].mv(`${newpath}${name}`, function (err) { });
      }
    } else {
      // var currentdate = new Date();
      // var time = currentdate.getTime();
      // var name = Math.floor(Math.random() * 1000000) + "_" + time + ".jpg";
      var name = myfile.name;
      recordname.push(name);
      myfile.mv(`${newpath}${name}`, function (err) { });
    }
    const data = await adminapi.uploadCustomerFile(req.body, recordname);
    res.send({
      ...data,
    });
  } else {
    const data = await adminapi.uploadCustomerFile(req.body);
    res.send({
      ...data,
    });
  }
});

//Get files
app.get("/get-allfilesbyid/:id", async function (req, res) {
  const data = await adminapi.getallfilesbyid(req.params);
  res.send({
    ...data,
  });
});

//Delete file
app.get("/delete-file/:id", async function (req, res) {
  const data = await adminapi.deleteFile(req.params);
  res.send({
    ...data,
  });
});

//get payment details
app.get("/get-paymentdetails/:id", async function (req, res) {
  const data = await adminapi.getPaymentDetails(req.params);
  res.send({
    ...data,
  });
});

//Delete Customer
app.get("/delete-customer/:id", async function (req, res) {
  const data = await adminapi.deletecustomer(req.params);
  res.send({
    ...data,
  });
});

//search payment
app.post("/search-payment", async function (req, res) {
  const data = await adminapi.searchpayment(req.body);
  res.send({
    ...data,
  });
});
//update - td-status
app.post("/update-tds", async function (req, res) {
  const data = await adminapi.updatetds(req.body);
  res.send({
    ...data,
  });
});

//get visa-customerbyid
app.get("/get-visacustomerbyid/:detail_id", async function (req, res) {
  const data = await adminapi.getvisacustomerbyid(req.params);
  res.send({
    ...data,
  });
});

//get payment details
app.get("/get-paymentdetail/:page/:perpage/:uid/:bid", async function (
  req,
  res
) {
  const data = await adminapi.getpaymentdetail(req.params);
  res.send({
    ...data,
  });
});

//insert refund payment
app.post("/insert-refundpayment", async function (req, res) {
  let date = moment().format("DD-MM-YYYY");
  const data = await adminapi.insertRefundPayment(req.body, date);
  res.send({
    ...data,
  });
});

//get payment refund
app.get("/get-paymentrefund/:u_id/:page/:perPage", async function (req, res) {
  let date = moment().format("DD-MM-YYYY");
  const data = await adminapi.getPaymentRefund(req.params, date);
  res.send({
    ...data,
  });
});

//search refund by date
app.post("/search-refunddata", async function (req, res) {
  const data = await adminapi.searchRefundData(req.body);
  res.send({
    ...data,
  });
});

//get general setting
app.get("/get-settingdatabyid/:id", async function (req, res) {
  const data = await adminapi.getEmailSetting(req.params);
  res.send({
    ...data,
  });
});

//get under process list
app.get("/get-underprocesslist/:u_id/:branch_id/:user_type", async function (
  req,
  res
) {
  const data = await adminapi.getUnderProcessList(req.params);
  res.send({
    ...data,
  });
});

//cash-flow

//search cashflow
app.post("/search-cashflow", async function (req, res) {
  const data = await adminapi.searchcashflow(req.body);
  res.send({
    ...data,
  });
});

//get branch user
app.get("/get-branchuser/:id", async function (req, res) {
  const data = await adminapi.getbranchuser(req.params);
  res.send({
    ...data,
  });
});

//get branch user
app.get("/get-cashpayment/:u_id/:b_id", async function (req, res) {
  const data = await adminapi.getcashpaymentamount(req.params);
  res.send({
    ...data,
  });
});

//insert cashflow
app.post("/insert-cashflow", async function (req, res) {
  const data = await adminapi.insertcashflow(req.body);
  res.send({
    ...data,
  });
});

//Delete cashflow
app.get("/delete-cashflow/:id", async function (req, res) {
  const data = await adminapi.deletecashflow(req.params);
  res.send({
    ...data,
  });
});

//search task data
app.post("/search-taskdata", async function (req, res) {
  const data = await adminapi.searchTaskData(req.body);
  res.send({
    ...data,
  });
});

//Invoice Module
app.get("/get-invoicedata/:id/:uid", async function (req, res) {
  const data = await adminapi.getinvoicedata(req.params);
  res.send({
    ...data,
  });
});

app.post("/update-customeraddress", async function (req, res) {
  const data = await adminapi.updatecustomeraddress(req.body);
  res.send({
    ...data,
  });
});

app.get("/fetch-pdf/:id", async function (req, res) {
  const data = req.params;
  res.sendFile(`${__dirname}/public/Assets/invoice_pdf/invoice_${data.id}.pdf`);
});

app.post("/send-invoicemail", async function (req, res) {
  const data = await adminapi.sendinvoicemail(req.body);
  res.send({
    ...data,
  });
});

app.get("/fetch-branchdatabyid/:bid", async function (req, res) {
  const data = await adminapi.fetchbranchdatabyid(req.params);
  res.send({
    ...data,
  });
});

//get apostillecustomer
app.get(
  "/get-apostillecustomer/:u_id/:branch_id/:page/:perPage",
  async function (req, res) {
    const data = await adminapi.getApostilleCustomer(req.params);
    res.send({
      ...data,
    });
  }
);

//update apostille status
app.post("/update-apostillestatus", async function (req, res) {
  let date = moment().format("DD-MM-YYYY");
  const data = await adminapi.updateApostilleStatus(req.body, date);
  res.send({
    ...data,
  });
});

//get apostille-customerbyid
app.get("/get-apostillecustomerbyid/:detail_id", async function (req, res) {
  const data = await adminapi.getapostillecustomerbyid(req.params);
  res.send({
    ...data,
  });
});

//delete  apostille customer
app.get(
  "/delete-apostillecustomer/:id/:branch_state_id/:s_c_gst/:s_s_gst/:s_i_gst",
  async function (req, res) {
    let date = moment().format("DD-MM-YYYY");
    const data = await adminapi.deleteApostilleCustomer(req.params, date);
    res.send({
      ...data,
    });
  }
);

//search excel reports
app.post("/search-excelreports", async function (req, res) {
  const data = await adminapi.excelreports(req.body);
  res.send({
    ...data,
  });
});

//update apostille customer
app.post("/update-apostillecustomer", async function (req, res) {
  const data = await adminapi.updateApostilleCustomer(req.body);
  res.send({
    ...data,
  });
});

//search apostille customer
app.post("/search-apostillecustomer", async function (req, res) {
  const data = await adminapi.searchApostilleCustomer(req.body);
  res.send({
    ...data,
  });
});

//get-tds
app.post("/get-tds", async function (req, res) {
  const data = await adminapi.gettds(req.body);
  res.send({
    ...data,
  });
});

app.get("/get-businesssummary/:page/:perpage/:u_id/:b_id", async function (
  req,
  res
) {
  const data = await adminapi.getbusinesssummery(req.params);
  res.send({
    ...data,
  });
});
//search business summery
app.post("/search-businesssummary", async function (req, res) {
  const data = await adminapi.searchbusinesssummery(req.body);
  res.send({
    ...data,
  });
});

//get refund by id
app.get("/get-refundbyid/:id/:u_id", async function (req, res) {
  const data = await adminapi.getRefundById(req.params);
  res.send({
    ...data,
  });
});

//get refund recipt
app.get("/get-refundreceipt/:id/:rec_no/:u_id", async function (req, res) {
  const data = await adminapi.getRefundReceipt(req.params);
  res.send({
    ...data,
  });
});

app.get("/fetch-refundreceipt/:id", async function (req, res) {
  const data = req.params;
  res.sendFile(
    `${__dirname}/public/Assets/refund_receipt/refund_receipt_${data.id}.pdf`
  );
});

//get-paymentdata by id
app.get("/get-paymentdata/:id/:branch_id/:u_id", async function (req, res) {
  const data = await adminapi.getPaymentData(req.params);
  res.send({
    ...data,
  });
});

//get payment receipt
app.get("/get-paymentreceipt/:id/:rec_no/:u_id/:branch_id", async function (
  req,
  res
) {
  const data = await adminapi.getPaymentReceipt(req.params);
  res.send({
    ...data,
  });
});

app.get("/fetch-paymentreceipt/:id", async function (req, res) {
  const data = req.params;
  res.sendFile(
    `${__dirname}/public/Assets/payment_receipt/payment_receipt_${data.id}.pdf`
  );
});

app.get("/fetch-graphleaddata/:id", async function (req, res) {
  const data = await adminapi.fetchgraphleaddata(req.params);
  res.send({
    ...data,
  });
});

app.post("/generate-cregistrationreport", async function (req, res) {
  const data = await adminapi.generatecregistrationreport(req.body);
  res.send({
    ...data,
  });
});

//search attestation cover later
app.post("/search-attestationcover", async function (req, res) {
  const data = await adminapi.attestationcoverletter(req.body);
  res.send({
    ...data,
  });
});

//search visa cover later
app.post("/search-visacover", async function (req, res) {
  const data = await adminapi.visacoverletter(req.body);
  res.send({
    ...data,
  });
});
//search attestation cover later
app.post("/search-apostillecover", async function (req, res) {
  const data = await adminapi.apostillecoverletter(req.body);
  res.send({
    ...data,
  });
});

app.post("/attestation-pdf", async function (req, res) {
  const data = await adminapi.attestationpdf(req.body);
  res.send({
    ...data,
  });
});

app.get("/fetch-attestation-pdf/:id", async function (req, res) {
  const data = req.params;
  res.sendFile(
    `${__dirname}/public/Assets/attestation_pdf/attestation_${data.id}.pdf`
  );
});

app.post("/apostille-pdf", async function (req, res) {
  const data = await adminapi.apostillepdf(req.body);
  res.send({
    ...data,
  });
});

app.post("/visa-pdf", async function (req, res) {
  const data = await adminapi.visapdf(req.body);
  res.send({
    ...data,
  });
});

app.get("/fetch-apostille-pdf/:id", async function (req, res) {
  const data = req.params;
  res.sendFile(
    `${__dirname}/public/Assets/apostille_pdf/apostille_${data.id}.pdf`
  );
});

app.get("/fetch-visa-pdf/:id", async function (req, res) {
  const data = req.params;
  res.sendFile(`${__dirname}/public/Assets/visa_pdf/visa_${data.id}.pdf`);
});

//Ready For Delivery Report
app.post("/generate-rdeliveryreport", async function (req, res) {
  const data = await adminapi.generaterdeliveryreport(req.body);
  res.send({
    ...data,
  });
});
//Ready For Delivery Report
app.post("/generate-allrdeliveryreport", async function (req, res) {
  const data = await adminapi.generateallrdeliveryreport(req.body);
  res.send({
    ...data,
  });
});

//Ready For Delivery Report
app.post("/generate-rdeliveryhistoryreport", async function (req, res) {
  const data = await adminapi.generatehistoryrdeliveryreport(req.body);
  res.send({
    ...data,
  });
});

//Ready For Delivery Report
app.post("/generate-allrdeliveryhistoryreport", async function (req, res) {
  const data = await adminapi.generateallhistoryrdeliveryreport(req.body);
  res.send({
    ...data,
  });
});

app.post("/get-dispatch", async function (req, res) {
  const data = await adminapi.getdispatch(req.body);
  res.send({
    ...data,
  });
});

app.post("/dispatch-pdf", async function (req, res) {
  const data = await adminapi.dispatchreportspdf(req.body);
  res.send({
    ...data,
  });
});

app.get("/fetch-dispatch-pdf/:id", async function (req, res) {
  const data = req.params;
  res.sendFile(
    `${__dirname}/public/Assets/dispatchreports_pdf/dispatchreports_${data.id}.pdf`
  );
});

app.post("/accountreport-pdf", async function (req, res) {
  const data = await adminapi.accountreportpdf(req.body);
  res.send({
    ...data,
  });
});
//get branch customer
app.get("/get-branchcustomer/:branch_id/:u_id", async function (req, res) {
  const data = await adminapi.getbranchcustomer(req.params);
  res.send({
    ...data,
  });
});

app.post("/search-accountreports", async function (req, res) {
  const data = await adminapi.accountreport(req.body);
  res.send({
    ...data,
  });
});

app.get("/fetch-accountreport-pdf/:id", async function (req, res) {
  const data = req.params;
  res.sendFile(
    `${__dirname}/public/Assets/accountreport_pdf/accountreport_${data.id}.pdf`
  );
});

app.post("/send-refundmail", async function (req, res) {
  const data = await adminapi.sendrefundmail(req.body);
  res.send({
    ...data,
  });
});

app.post("/send-paymentmail", async function (req, res) {
  const data = await adminapi.sendpaymentmail(req.body);
  res.send({
    ...data,
  });
});

app.post("/lead-report", async function (req, res) {
  const data = await adminapi.leadReport(req.body);
  res.send({
    ...data,
  });
});

app.post("/search-leadcountreport", async function (req, res) {
  const data = await adminapi.leadCountReport(req.body);
  res.send({
    ...data,
  });
});

app.post("/search-adminallocatereport", async function (req, res) {
  const data = await adminapi.adminAllocateReport(req.body);
  res.send({
    ...data,
  });
});
app.post("/search-customercountreport", async function (req, res) {
  const data = await adminapi.dirCustomerCountReport(req.body);
  res.send({
    ...data,
  });
});

//Convert Lead Into Customer
app.get("/convert-lead/:id/:u_id/:branch_id", async function (req, res) {
  date = moment().format("DD-MM-YYYY");
  const data = await adminapi.convertLead(req.params, date);
  res.send({
    ...data,
  });
});

app.post("/search-leadfollowupcountreport", async function (req, res) {
  const data = await adminapi.leadFollowUpCountReport(req.body);
  res.send({
    ...data,
  });
});

//counter leadfollowup
app.post("/get-leadfollowupcounter", async function (req, res) {
  const data = await adminapi.getLeadFollowupCounter(req.body);
  res.send({
    ...data,
  });
});

//reports of profit_cost
app.post("/profit-cost", async function (req, res) {
  const data = await adminapi.profit_cost(req.body);
  res.send({
    ...data,
  });
});

//full copy
app.get("/fullcopy/:c_id", async function (req, res) {
  const data = await adminapi.fullcopy(req.params);
  res.send({
    ...data,
  });
});

//half copy
app.get("/halfcopy/:c_id", async function (req, res) {
  const data = await adminapi.halfcopy(req.params);
  res.send({
    ...data,
  });
});

//download-allpdf
app.post("/download-allinvoicepdf", async function (req, res) {
  const data = await adminapi.downloadallinvoicepdfwithbranch(req.body);
  res.send({
    ...data,
  });
});

//insert leadcustomer
app.post("/insert-leadcustomer", async function (req, res) {
  const data = await adminapi.insertLeadCustomer(req.body);
  res.send({
    ...data,
  });
});

//Proforma Invoice Module
app.get("/get-proformainvoicedata/:id/:uid", async function (req, res) {
  const data = await adminapi.getproformainvoicedata(req.params);
  res.send({
    ...data,
  });
});

app.post("/get-proformainvoice", async function (req, res) {
  const data = await adminapi.getproformainvoice(req.body);
  res.send({
    ...data,
  });
});

app.get("/fetch-proformainvoicepdf/:id", async function (req, res) {
  const data = req.params;
  res.sendFile(
    `${__dirname}/public/Assets/proforma_invoice_pdf/invoice_${data.id}.pdf`
  );
});

app.post("/get-selectionamount", async function (req, res) {
  const data = await adminapi.getselectionamount(req.body);
  res.send({
    ...data,
  });
});

//Update Serviceprice
app.post("/update-service", async function (req, res) {
  const data = await adminapi.updateService(req.body);
  res.send({
    ...data,
  });
});

//update dispatching date
app.post("/update-dispatchdate", async function (req, res) {
  const data = await adminapi.updateDispatchDate(req.body);
  res.send({
    ...data,
  });
});

//Get AllEmailtemplate
app.get("/get-allemailtemplate", async function (req, res) {
  const data = await adminapi.getallEmailtemplate();
  res.send({
    ...data,
  });
});

//Send Lead Mail
app.post("/send-leadmail", async function (req, res) {
  if (req.files != undefined) {
    const myfile = req.files.file;
    let newpath = paths.join(
      __dirname,
      "/public/Assets/images/temlateattachfile/"
    );
    let recordname = [];
    if (req.files && myfile.length != undefined) {
      for (i = 0; i < myfile.length; i++) {
        var name = myfile[i].name;
        recordname.push(name);
        myfile[i].mv(`${newpath}${name}`, function (err) { });
      }
    } else {
      var name = myfile.name;
      recordname.push(name);
      myfile.mv(`${newpath}${name}`, function (err) { });
    }
    const data = await adminapi.sendleademail(req.body, recordname);
    res.send({
      ...data,
    });
  } else {
    const data = await adminapi.sendleademail(req.body);
    res.send({
      ...data,
    });
  }
});

//CustomerLogin
app.post("/customer-login", async function (req, res) {
  const data = await auth.customerLogin(req.body.email, req.body.password);
  res.send({
    ...data,
  });
});

//get Customer
app.get("/get-customers/:m_c_id/:page/:perpage", async function (req, res) {
  const data = await adminapi.getcustomer(req.params);
  res.send({
    ...data,
  });
});

//serachCustomer
app.post("/search-customers", async function (req, res) {
  const data = await adminapi.searchcustomers(req.body);
  res.send({
    ...data,
  });
});

//get Attestation
app.get("/get-attestations/:m_c_id/:page/:perpage", async function (req, res) {
  const data = await adminapi.getattestations(req.params);
  res.send({
    ...data,
  });
});

//search attestation
app.post("/search-attestations", async function (req, res) {
  const data = await adminapi.searchAttestations(req.body);
  res.send({
    ...data,
  });
});

//get Apostille
app.get("/get-apostilles/:m_c_id/:page/:perpage", async function (req, res) {
  const data = await adminapi.getapostilles(req.params);
  res.send({
    ...data,
  });
});

//search apostille
app.post("/search-apostilles", async function (req, res) {
  const data = await adminapi.searchapostilles(req.body);
  res.send({
    ...data,
  });
});

//get Visa
app.get("/get-visas/:m_c_id/:page/:perpage", async function (req, res) {
  const data = await adminapi.getvisas(req.params);
  res.send({
    ...data,
  });
});

//search visa
app.post("/search-visas", async function (req, res) {
  const data = await adminapi.searchvisas(req.body);
  res.send({
    ...data,
  });
});

//get payment details
app.get("/get-payments/:m_c_id/:page/:perpage", async function (req, res) {
  const data = await adminapi.getpayments(req.params);
  res.send({
    ...data,
  });
});

//search payment
app.post("/search-payments", async function (req, res) {
  const data = await adminapi.searchpayments(req.body);
  res.send({
    ...data,
  });
});

//get-tds
app.get("/get-customertdslist/:m_c_id/:page/:perpage", async function (
  req,
  res
) {
  const data = await adminapi.getcustomertdslist(req.params);
  res.send({
    ...data,
  });
});

//search tds
app.post("/search-tdsdata", async function (req, res) {
  const data = await adminapi.searchtdsdata(req.body);
  res.send({
    ...data,
  });
});

//get Applicant
app.get("/get-applicants/:c_id/:c_s_type", async function (req, res) {
  const data = await adminapi.getapplicants(req.params);
  res.send({
    ...data,
  });
});

//Insert customer conversation
app.post("/insert-feedback", async function (req, res) {
  if (req.files != undefined) {
    const file = req.files.file;
    var currentdate = new Date();
    var time = currentdate.getTime();
    var filename = time + ".jpg";
    let newpath = paths.join(
      __dirname,
      "/public/Assets/images/customer_feedback/"
    );
    file.mv(`${newpath}${filename}`, function (err) { });
    const data = await adminapi.insertfeedback(req.body, filename);
    res.send(data);
  } else {
    const data = await adminapi.insertfeedback(req.body);
    res.send(data);
  }
});

//get allcomment
app.get("/get-feedback/:m_c_id/:page/:perpage", async function (req, res) {
  const data = await adminapi.getCustomerfeedback(req.params);
  res.send({
    ...data,
  });
});

//insert-goal
app.post("/insert-goal", async function (req, res) {
  const data = await adminapi.insertGoal(req.body);
  res.send({
    ...data,
  });
});

//Get All Goal
app.get("/get-allgoal", async function (req, res) {
  const data = await adminapi.getAllGoal();
  res.send({
    ...data,
  });
});

//Update Goal
app.post("/update-goal", async function (req, res) {
  const data = await adminapi.updateGoal(req.body);
  res.send({
    ...data,
  });
});

//Delete Goal
app.get("/delete-goal/:id", async function (req, res) {
  const data = await adminapi.deleteGoal(req.params);
  res.send({
    ...data,
  });
});

//get all goal list
app.get("/get-allgoallist/:u_id", async function (req, res) {
  const data = await adminapi.getAllGoalList(req.params);
  res.send({
    ...data,
  });
});

//Get all dashboard task
app.get("/get-alldashtask/:id", async function (req, res) {
  const data = await adminapi.getallDashTask(req.params);
  res.send({
    ...data,
  });
});

//Get user-branch Admin-staff
app.get("/get-taskusers/:bid/:uid", async function (req, res) {
  const data = await adminapi.getTaskUsers(req.params);
  res.send({
    ...data,
  });
});

//transferbranch
app.post("/transfer-branch", async function (req, res) {
  const data = await adminapi.branchtransfer(req.body);
  res.send({
    ...data,
  });
});

app.get("/fetch-managerbranch/:uid", async function (req, res) {
  const data = await adminapi.fetchmanagerbranch(req.params);
  res.send({
    ...data,
  });
});

app.get("/fetch-branchuserdata/:bid", async function (req, res) {
  const data = await adminapi.fetchbranchuserdata(req.params);
  res.send({
    ...data,
  });
});

app.post("/get-revenuedata", async function (req, res) {
  const data = await adminapi.getrevenuedata(req.body);
  res.send({
    ...data,
  });
});

app.get("/get-activitylog/:detail_id", async function (req, res) {
  const data = await adminapi.getactivitylog(req.params);
  res.send({
    ...data,
  });
});

app.post("/search-login_logout_report", async function (req, res) {
  const data = await adminapi.searchlogin_logout_report(req.body);
  res.send({
    ...data,
  });
});

app.post("/add-logouttime", async function (req, res) {
  const data = await adminapi.addlogouttime(req.body);
  res.send({
    ...data,
  });
});

app.get("/login_logout_report/:page/:perpage", async function (req, res) {
  const data = await adminapi.login_logout_report(req.params);
  res.send({
    ...data,
  });
});

//Hold status application in dashboard
app.get("/get-allholdapplication/:u_id/:branch_id", async function (req, res) {
  const data = await adminapi.getAllHoldApplication(req.params);
  res.send({
    ...data,
  });
});

app.post("/insert-nextholdcomment", async function (req, res) {
  const data = await adminapi.insertnextholdcomment(req.body);
  res.send({
    ...data,
  });
});

//get translationcustomer
app.get(
  "/get-translationcustomer/:u_id/:branch_id/:page/:perPage",
  async function (req, res) {
    const data = await adminapi.getTranslationCustomer(req.params);
    res.send({
      ...data,
    });
  }
);

//update translation customer
app.post("/update-translationcustomer", async function (req, res) {
  const data = await adminapi.updateTranslationCustomer(req.body);
  res.send({
    ...data,
  });
});

//search translation customer
app.post("/search-translationcustomer", async function (req, res) {
  const data = await adminapi.searchTranslationCustomer(req.body);
  res.send({
    ...data,
  });
});

//delete  translation customer
app.get(
  "/delete-translationcustomer/:id/:branch_state_id/:s_c_gst/:s_s_gst/:s_i_gst",
  async function (req, res) {
    let date = moment().format("DD-MM-YYYY");
    const data = await adminapi.deleteTranslationCustomer(req.params, date);
    res.send({
      ...data,
    });
  }
);

//get translation-customerbyid
app.get("/get-translationcustomerbyid/:detail_id", async function (req, res) {
  const data = await adminapi.gettranslationcustomerbyid(req.params);
  res.send({
    ...data,
  });
});

//update translation status
app.post("/update-translationstatus", async function (req, res) {
  let date = moment().format("DD-MM-YYYY");
  const data = await adminapi.updateTranslationStatus(req.body, date);
  res.send({
    ...data,
  });
});

app.post("/translation-pdf", async function (req, res) {
  const data = await adminapi.translationpdf(req.body);
  res.send({
    ...data,
  });
});

app.get("/fetch-translation-pdf/:id", async function (req, res) {
  const data = req.params;
  res.sendFile(
    `${__dirname}/public/Assets/translation_pdf/translation_${data.id}.pdf`
  );
});

//search  translation cover later
app.post("/search-translationcover", async function (req, res) {
  const data = await adminapi.translationcoverletter(req.body);
  res.send({
    ...data,
  });
});

//send translationcover letter mail
app.post("/send-translationmail", async function (req, res) {
  const data = await adminapi.sendtranslationmail(req.body);
  res.send({
    ...data,
  });
});

//get translation
app.get("/get-translations/:m_c_id/:page/:perpage", async function (req, res) {
  const data = await adminapi.gettranslations(req.params);
  res.send({
    ...data,
  });
});

//Get today task notification
app.post("/get-newtasknotification", async function (req, res) {
  const data = await adminapi.newtasknotification(req.body);
  res.send({
    ...data,
  });
});

//Get new task notification
app.get("/readtasknotification/:t_id", async function (req, res) {
  const data = await adminapi.readtasknotification(req.params);
  res.send({
    ...data,
  });
});

//Get task by id
app.get("/get-taskbyid/:t_id", async function (req, res) {
  const data = await adminapi.gettaskbyid(req.params);
  res.send({
    ...data,
  });
});

//Login OTP
app.post("/emailotp", async function (req, res) {
  const data = await adminapi.sendloginotp(req.body);
  res.send({
    ...data,
  });
});

//Send mail with pdf in lead proforma invoice
app.post("/send-leadinvoicemail", async function (req, res) {
  const data = await adminapi.sendleadinvoicemail(req.body);
  res.send({
    ...data,
  });
});

//Send mail without pdf in lead proforma invoice
app.post("/send-leademail", async function (req, res) {
  const data = await adminapi.sendleadwithoutinvoiceemail(req.body);
  res.send({
    ...data,
  });
});

//block customer
app.post("/block-customer", async function (req, res) {
  const data = await adminapi.blockCustomer(req.body);
  res.send({
    ...data,
  });
});

// app.get("/feedbackmailsend", async function (req, res) {
//   const data = await adminapi.feedbackmailsend();
//   res.send({
//     ...data,
//   });
// });

// JIL
// Jil Customer Password change

app.post("/changecustomerpassword", async function (req, res) {
  const data = await adminapi.changeCustomerPassword(req.body);
  res.send({
    ...data,
  });
});
// changeCustomerPassword

app.get("/get-templatelistbycate/:cid/:scid", async function (req, res) {
  const data = await adminapi.gettemplatelistbycate(req.params);
  res.send({
    ...data,
  });
});

app.get("/get-templatedata/:etid", async function (req, res) {
  const data = await adminapi.gettemplatedata(req.params);
  res.send({
    ...data,
  });
});

app.post("/get-courierchargereport", async function (req, res) {
  const data = await adminapi.getcourierchargereport(req.body);
  res.send({
    ...data,
  });
});

app.post("/send-tempmail", async function (req, res) {
  const data = await adminapi.sendtempmail(req.body);
  res.send({
    ...data,
  });
});

//Get user by id For Form Link
app.get("/get-userbyid/:u_id", async function (req, res) {
  const data = await adminapi.getuserbyid(req.params);
  res.send({
    ...data,
  });
});

// FAQ

app.post("/insertfaqcategory", async function (req, res) {
  const data = await adminapi.insertFaqCategory(req.body);
  res.send({
    ...data,
  });
});

app.get("/getfaqcategory", async function (req, res) {
  const data = await adminapi.getfaqcategoryList();
  res.send({
    ...data,
  });
});

app.post("/updatefaqcategory", async function (req, res) {
  const data = await adminapi.updateFaqCategory(req.body);
  res.send({
    ...data,
  });
});

app.post("/insertfaq", async function (req, res) {
  if (req.files != undefined) {
    const myfile = req.files.file;
    let newpath = paths.join(__dirname, "/public/Assets/images/faq_doc/");
    var name = myfile.name;
    myfile.mv(`${newpath}${name}`, function (err) { });
    const data = await adminapi.insertFaq(req.body, name);
    res.send({
      ...data,
    });
  } else {
    const data = await adminapi.insertFaq(req.body);
    res.send({
      ...data,
    });
  }
});

app.get("/getfaq", async function (req, res) {
  const data = await adminapi.getfaqList();
  res.send({
    ...data,
  });
});

app.post("/updatefaq", async function (req, res) {
  if (req.files != undefined) {
    const myfile = req.files.file;
    let newpath = paths.join(__dirname, "/public/Assets/images/faq_doc/");
    var name = myfile.name;
    myfile.mv(`${newpath}${name}`, function (err) { });
    const data = await adminapi.updateFaq(req.body, name);
    res.send({
      ...data,
    });
  } else {
    const data = await adminapi.updateFaq(req.body);
    res.send({
      ...data,
    });
  }
});

//Delete FAQ
app.get("/deletefaq/:id", async function (req, res) {
  const data = await adminapi.deleteFAQ(req.params);
  res.send({
    ...data,
  });
});

app.get("/deletefaqcategory/:id", async function (req, res) {
  const data = await adminapi.deletefaqcategory(req.params);
  res.send({
    ...data,
  });
});

//get attestation process date
app.get("/get-ProcessLimitDate/:a_type", async function (req, res) {
  const data = await adminapi.getProcessLimitDate(req.params);
  res.send({
    ...data,
  });
});

//insert target user wise
app.post("/inserttarget", async function (req, res) {
  const data = await adminapi.insertTarget(req.body);
  res.send({
    ...data,
  });
});

//get target of user
app.get("/gettarget", async function (req, res) {
  const data = await adminapi.getTarget();
  res.send({
    ...data,
  });
});

//update target of user
app.post("/updatetarget", async function (req, res) {
  const data = await adminapi.updateTarget(req.body);
  res.send({
    ...data,
  });
});

app.get("/usertargetreport/:id", async function (req, res) {
  const data = await adminapi.userTargetReport(req.params);
  res.send({
    ...data,
  });
});

app.post("/get-totalinvoice", async function (req, res) {
  const data = await adminapi.gettotalinvoice(req.body);
  res.send({
    ...data,
  });
});

//approve payment
app.post("/approved-payment", async function (req, res) {
  const data = await adminapi.approvedpayment(req.body);
  res.send({
    ...data,
  });
});

//get draft receipt details
app.get("/get-draftreceipt/:page/:perpage/:uid/:bid/:pmode", async function (
  req,
  res
) {
  const data = await adminapi.getdraftreceipt(req.params);
  res.send({
    ...data,
  });
});

//get-draftpaymentdata by id
app.get("/get-draftpaymentdata/:id/:branch_id/:u_id", async function (
  req,
  res
) {
  const data = await adminapi.getDraftPaymentData(req.params);
  res.send({
    ...data,
  });
});

//get payment receipt
app.get(
  "/get-draftpaymentreceipt/:id/:rec_no/:u_id/:branch_id",
  async function (req, res) {
    const data = await adminapi.getDraftPaymentReceipt(req.params);
    res.send({
      ...data,
    });
  }
);

app.get("/fetch-draftpaymentreceipt/:id", async function (req, res) {
  const data = req.params;
  res.sendFile(
    `${__dirname}/public/Assets/draft_payment_receipt/draft_payment_receipt_${data.id}.pdf`
  );
});

//search draft payment
app.post("/search-draftpayment", async function (req, res) {
  const data = await adminapi.searchdraftpayment(req.body);
  res.send({
    ...data,
  });
});

//search Account Summery
app.post("/search-accountsummary", async function (req, res) {
  const data = await adminapi.searchAccountSummery(req.body);
  res.send({
    ...data,
  });
});

app.post("/send-mailfortranslation", async function (req, res) {
  const data = await adminapi.sendmailfortranslation(req.body);
  res.send({
    ...data,
  });
});

//insert suggestion
app.post("/insert-suggestion", async function (req, res) {
  if (req.files != undefined) {
    const myfile = req.files.file;
    let newpath = paths.join(
      __dirname,
      "/public/Assets/images/suggestion_doc/"
    );
    var name = myfile.name;
    myfile.mv(`${newpath}${name}`, function (err) { });
    const data = await adminapi.insertSuggestion(req.body, name);
    res.send({
      ...data,
    });
  } else {
    const data = await adminapi.insertSuggestion(req.body);
    res.send({
      ...data,
    });
  }
});

//Get Suggestion by id
app.get("/get-suggestion/:u_id/:u_type/:branch_id", async function (req, res) {
  const data = await adminapi.getSuggestion(req.params);
  res.send({
    ...data,
  });
});

//update suggestion
app.post("/update-suggestion", async function (req, res) {
  if (req.files != undefined) {
    const myfile = req.files.file;
    let newpath = paths.join(
      __dirname,
      "/public/Assets/images/suggestion_doc/"
    );
    var name = myfile.name;
    myfile.mv(`${newpath}${name}`, function (err) { });
    const data = await adminapi.updateSuggestion(req.body, name);
    res.send({
      ...data,
    });
  } else {
    const data = await adminapi.updateSuggestion(req.body);
    res.send({
      ...data,
    });
  }
});

//Delete Suggestion by id
app.get("/delete-suggestion/:sg_id", async function (req, res) {
  const data = await adminapi.deleteSuggestion(req.params);
  res.send({
    ...data,
  });
});

//Monthwise target report
app.get("/usermonthtargetreport/:id", async function (req, res) {
  const data = await adminapi.userMonthTargetReport(req.params);
  res.send({
    ...data,
  });
});

//Delete Suggestion by id
app.get("/delete-usertarget/:t_id", async function (req, res) {
  const data = await adminapi.deleteUserTarget(req.params);
  res.send({
    ...data,
  });
});

//Get Main Customer
app.get("/get-maincustomer/:id/:page/:perpage", async function (req, res) {
  const data = await adminapi.getMainCustomer(req.params);
  res.send({
    ...data,
  });
});

//update main customer details
app.post("/updatemaincustomerdetails", async function (req, res) {
  const data = await adminapi.updateMainCustomerDetails(req.body);
  res.send({
    ...data,
  });
});

//Send Login Mail
app.post("/send-loginmail", async function (req, res) {
  const data = await adminapi.sendloginemail(req.body);
  res.send({
    ...data,
  });
});

//Search main customer
app.post("/search-maincustomer", async function (req, res) {
  const data = await adminapi.searchMainCustomer(req.body);
  res.send({
    ...data,
  });
});

//Insert Embassyfees
app.post("/insert-embassyfee", async function (req, res) {
  const data = await adminapi.insertembassyfee(req.body);
  res.send({
    ...data,
  });
});

//get embassyfees data
app.get("/get-embassyfees/:page/:perpage", async function (req, res) {
  const data = await adminapi.getembassyfees(req.params);
  res.send({
    ...data,
  });
});

//Update Embassyfees
app.post("/update-embassyfees", async function (req, res) {
  const data = await adminapi.updateembassyfees(req.body);
  res.send({
    ...data,
  });
});
//search charge report
app.post("/search-chargereport", async function (req, res) {
  const data = await adminapi.searchChargeReport(req.body);
  res.send({
    ...data,
  });
});

app.post("/get-embassy-amount", async function (req, res) {
  const data = await adminapi.getembassyamount(req.body);
  res.send({
    ...data,
  });
});

app.post("/get-courierreport", async function (req, res) {
  const data = await adminapi.getcourierreport(req.body);
  res.send({
    ...data,
  });
});
app.post("/get-allcourierreport", async function (req, res) {
  const data = await adminapi.getallcourierreport(req.body);
  res.send({
    ...data,
  });
});

//Get Marketing Lead
app.get("/get-allnewlead/:id", async function (req, res) {
  const data = await adminapi.getAllNewLead(req.params);
  res.send({
    ...data,
  });
});

app.post("/search-allcover", async function (req, res) {
  const data = await adminapi.searchallcover(req.body);
  res.send({
    ...data,
  });
});

app.post("/all-coverpdf", async function (req, res) {
  const data = await adminapi.allcoverpdf(req.body);
  res.send({
    ...data,
  });
});

app.get("/fetch-allcover-pdf", async function (req, res) {
  res.sendFile(`${__dirname}/public/Assets/allcover.pdf`);
});

app.post("/search-statuswiseleadreport", async function (req, res) {
  const data = await adminapi.searchstatuswiseleadreport(req.body);
  res.send({
    ...data,
  });
});

//Collected Report
app.post("/generate-collectedreport", async function (req, res) {
  const data = await adminapi.generatecollectedreport(req.body);
  res.send({
    ...data,
  });
});

//Dispatched Report
app.post("/generate-dispatchreport", async function (req, res) {
  const data = await adminapi.generatedispatchreport(req.body);
  res.send({
    ...data,
  });
});

app.get("/get-allprocessoverdue/:uid/:branch_id/:user_type", async function (
  req,
  res
) {
  const data = await adminapi.getallprocessoverdue(req.params);
  res.send({
    ...data,
  });
});

app.post("/set-nextprocessfinishdate", async function (req, res) {
  const data = await adminapi.setnextprocessfinishdate(req.body);
  res.send({
    ...data,
  });
});

//search embassyfees reports
app.post("/search-embassyfeesreport", async function (req, res) {
  const data = await adminapi.searchEmbassyFeesReports(req.body);
  res.send({
    ...data,
  });
});

app.get("/send-mailofprocesslimittousers", async function (req, res) {
  const data = await adminapi.sendmailofprocesslimittousers(req.params);
  res.send({
    ...data,
  });
});

//Get today transfferd branch notification
app.get("/get-newCustomerofAnotherBranch/:u_id/:branch_id", async function (
  req,
  res
) {
  const data = await adminapi.newCustomerofAnotherBranch(req.params);
  res.send({
    ...data,
  });
});
app.post("/search-translations", async function (req, res) {
  const data = await adminapi.searchtranslations(req.body);
  res.send({
    ...data,
  });
});

app.get("/get-faqcatepermission/:id", async function (req, res) {
  const data = await adminapi.getfaqcatepermission(req.params);
  res.send({
    ...data,
  });
});

app.get("/get-alldraftreceipt/:uid/:bid", async function (req, res) {
  const data = await adminapi.getAlldraftreceipt(req.params);
  res.send({
    ...data,
  });
});

//get all applicants
app.get("/get-allapplicants/:m_c_id", async function (req, res) {
  const data = await adminapi.getallapplicants(req.params);
  res.send({
    ...data,
  });
});

app.post("/get-TotalMonthlyInvoice", async function (req, res) {
  const data = await adminapi.getTotalMonthlyInvoice(req.body);
  res.send({
    ...data,
  });
});

app.get("/get-allpickupusers/:user_type/:branch_id", async function (req, res) {
  const data = await adminapi.getallpickupusers(req.params);
  res.send({
    ...data,
  });
});

app.get("/get-allinpickuplist/:id", async function (req, res) {
  const data = await adminapi.getAllinpickuplist(req.params);
  res.send({
    ...data,
  });
});

app.post("/insert-pickupnote", async function (req, res) {
  if (req.files != undefined) {
    const file = req.files.file;
    var filename = file.name;
    let newpath = paths.join(__dirname, "/public/Assets/images/pickupin/");
    file.mv(`${newpath}${filename}`, function (err) { });
    const data = await adminapi.insertpickupnote(req.body, filename);
    res.send(data);
  } else {
    const data = await adminapi.insertpickupnote(req.body);
    res.send({
      ...data,
    });
  }
});

app.get("/get-alloutpickuplist/:id", async function (req, res) {
  const data = await adminapi.getAlloutpickuplist(req.params);
  res.send({
    ...data,
  });
});

//1403
app.post("/pickup-done", async function (req, res) {
  if (req.files != undefined) {
    // change
    const file = req.files.p_o_attachment;
    var filename = file.name;
    let newpath = paths.join(__dirname, "/public/Assets/images/pickupin/");
    file.mv(`${newpath}${filename}`, function (err) { });
    const data = await adminapi.pickupdone(req.body, filename);
    res.send(data);
  } else {
    const data = await adminapi.pickupdone(req.body);
    res.send({
      ...data,
    });
  }
});

app.get("/get-allpickupdonelist/:id", async function (req, res) {
  const data = await adminapi.getAllpickupdonelist(req.params);
  res.send({
    ...data,
  });
});

app.get("/get-allpickupdoneleadlist/:id", async function (req, res) {
  const data = await adminapi.getAllpickupdoneleadlist(req.params);
  res.send({
    ...data,
  });
});

app.post("/insert-question", async function (req, res) {
  const data = await adminapi.insertquestion(req.body);
  res.send({
    ...data,
  });
});

app.get("/get-allquestion/:uid", async function (req, res) {
  const data = await adminapi.getallquestion(req.params);
  res.send({
    ...data,
  });
});

app.get("/delete-question/:qid", async function (req, res) {
  const data = await adminapi.deletequestion(req.params);
  res.send({
    ...data,
  });
});

app.post("/update-question", async function (req, res) {
  const data = await adminapi.updatequestion(req.body);
  res.send({
    ...data,
  });
});

app.get("/get-dailyquestions/:u_id/:t_type", async function (req, res) {
  const data = await adminapi.getDailyQuestions(req.params);
  res.send({
    ...data,
  });
});

app.post("/insert-dailyqueans", async function (req, res) {
  const data = await adminapi.insertDailyQueAns(req.body);
  res.send({
    ...data,
  });
});

//get users list for chat
app.get(
  "/get-userschat/:u_id/:branch_id/:u_type/:is_marketing/:marketing_parent_id",
  async function (req, res) {
    const data = await adminapi.getUsersChat(req.params);
    res.send({
      ...data,
    });
  }
);

//getchat by id
app.get(
  "/get-chatbyid/:login_id/:s_c_id/:c_type",
  async function (req, res) {
    const data = await adminapi.getChatByID(req.params);
    res.send({
      ...data,
    });
  }
);

app.post("/insert-usermessage", async function (req, res) {
  const data = await adminapi.insertUserMessage(req.body);
  res.send({
    ...data,
  });
});

app.post("/search-maincustomerchat", async function (req, res) {
  const data = await adminapi.searchMainCustomerChat(req.body);
  res.send({
    ...data,
  });
});

app.get("/get-allchatcustomer/:uid/:chat_user_type", async function (req, res) {
  const data = await adminapi.getChatCustomerListSocket(req.params);
  res.send({
    ...data,
  });
});

//Get user by id For Form Link
app.get("/get-customeruser/:sender_id/:receiver_id", async function (req, res) {
  const data = await adminapi.getCustomerUser(req.params);
  res.send({
    ...data,
  });
});

app.get("/get-templatebody/:etid/:uid", async function (req, res) {
  const data = await adminapi.gettemplatebody(req.params);
  res.send({
    ...data,
  });
});

//get email history lead
app.get("/get-emailhistory/:id/:type", async function (req, res) {
  const data = await adminapi.getEmailHistory(req.params);
  res.send({
    ...data,
  });
});

//get draft receipt counter
app.get("/get-draftreceiptcounter/:uid/:bid/:pmode", async function (req, res) {
  const data = await adminapi.getdraftreceiptCounter(req.params);
  res.send({
    ...data,
  });
});

app.post("/get-taskreport", async function (req, res) {
  const data = await adminapi.gettaskreport(req.body);
  res.send({
    ...data,
  });
});
//get tds report
app.post("/search-tdsreport", async function (req, res) {
  const data = await adminapi.searchtdsReport(req.body);
  res.send({
    ...data,
  });
});

app.post("/update-draftpayment", async function (req, res) {
  const data = await adminapi.updateDraftPayment(req.body);
  res.send({
    ...data,
  });
});
app.post("/delete-draftpayment", async function (req, res) {
  const data = await adminapi.deleteDraftPayment(req.body);
  res.send({
    ...data,
  });
});

app.get("/get-attributebyid/:id", async function (req, res) {
  const data = await adminapi.getAttributebyid(req.params);
  res.send({
    ...data,
  });
});

app.post("/update-paymentmode", async function (req, res) {
  const data = await adminapi.updatePaymentMode(req.body);
  res.send({
    ...data,
  });
});

app.get("/get-servicevalue/:country/:type/:stype", async function (req, res) {
  const data = await adminapi.getservicevalue(req.params);
  res.send({
    ...data,
  });
});

//insert customer
app.post("/insert-dircustomer", async function (req, res) {
  const data = await adminapi.insertDirCustomer(req.body);
  res.send({
    ...data,
  });
});

app.post("/insert-bankdetails", async function (req, res) {
  const data = await adminapi.insertbankdetails(req.body);
  res.send({
    ...data,
  });
});

app.get("/get-bankdetails/:utype/:branchid", async function (req, res) {
  const data = await adminapi.getbankdetails(req.params);
  res.send({
    ...data,
  });
});

app.get("/delete-bankdetails/:branchid", async function (req, res) {
  const data = await adminapi.deletebankdetails(req.params);
  res.send({
    ...data,
  });
});

app.post("/draftreceipt-read", async function (req, res) {
  const data = await adminapi.draftReceiptRead(req.body);
  res.send({
    ...data,
  });
});

app.post("/branchcustomer-read", async function (req, res) {
  const data = await adminapi.branchCustomerRead(req.body);
  res.send({
    ...data,
  });
});

app.post("/newlead-read", async function (req, res) {
  const data = await adminapi.newLeadRead(req.body);
  res.send({
    ...data,
  });
});

app.get("/get-servicevaluetype/:id/:country/:stype", async function (req, res) {
  const data = await adminapi.getservicevaluetype(req.params);
  res.send({
    ...data,
  });
});

app.get("/newpickdone-read/:id", async function (req, res) {
  const data = await adminapi.newPickDoneRead(req.params);
  res.send({
    ...data,
  });
});

app.post("/leadfollow-read", async function (req, res) {
  const data = await adminapi.LeadFollowRead(req.body);
  res.send({
    ...data,
  });
});

//search service price
app.post("/search-serviceprice", async function (req, res) {
  const data = await adminapi.searchServicePrice(req.body);
  res.send({
    ...data,
  });
});

app.get("/get-referralcustomer/:mcid/:page/:perpage", async function (
  req,
  res
) {
  const data = await adminapi.getreferralcustomer(req.params);
  res.send({
    ...data,
  });
});

app.post("/get-maincustomerbyid", async function (req, res) {
  const data = await adminapi.getMaincustomerByid(req.body);
  res.send({
    ...data,
  });
});

app.post("/get-commisiondata", async function (req, res) {
  const data = await adminapi.getcommisiondata(req.body);
  res.send({
    ...data,
  });
});

app.post("/update-commsionpayment", async function (req, res) {
  const data = await adminapi.updatecommsionpayment(req.body);
  res.send({
    ...data,
  });
});

app.post("/get-commissionreportdata", async function (req, res) {
  const data = await adminapi.getcommisionreportdata(req.body);
  res.send({
    ...data,
  });
});

app.post("/delete-commision", async function (req, res) {
  const data = await adminapi.deletecommision(req.body);
  res.send({
    ...data,
  });
});

app.get("/check-commissiondatabyid/:id", async function (req, res) {
  const data = await adminapi.checkcommissiondataById(req.params);
  res.send({
    ...data,
  });
});

//search embassyfees
app.post("/search-embassyfees", async function (req, res) {
  const data = await adminapi.searchEmbassyFees(req.body);
  res.send({
    ...data,
  });
});

//search feedback
app.post("/search-feedback", async function (req, res) {
  const data = await adminapi.searchFeedback(req.body);
  res.send({
    ...data,
  });
});

//Update draft payment detail with approval and send payment receipt in mail
app.post("/update-paymentwithapproval", async function (req, res) {
  const data = await adminapi.updatPaymentWithApproval(req.body);
  res.send({
    ...data,
  });
});

//get attestationcustomer by customer id
app.get("/get-attestationlistbycid/:c_id/:page/:perPage", async function (
  req,
  res
) {
  const data = await adminapi.getAttestationListBycid(req.params);
  res.send({
    ...data,
  });
});

//search cashinhand
app.post("/search-cashinhand", async function (req, res) {
  const data = await adminapi.searchcashinhand(req.body);
  res.send({
    ...data,
  });
});

app.post("/search-embassyfeesreportall", async function (req, res) {
  const data = await adminapi.searchEmbassyFeesReportsbyall(req.body);
  res.send({
    ...data,
  });
});

//get allleadfollowup
app.get("/get-leadfollowup/:l_id/:c_id", async function (req, res) {
  const data = await adminapi.getLeadFollowup(req.params);
  res.send({
    ...data,
  });
});

//Get user-branch Admin-staff
app.get("/get-userlist/:bid/:uid", async function (req, res) {
  const data = await adminapi.getuserlist(req.params);
  res.send({
    ...data,
  });
});

//Get chat notification
app.get("/get-allchatnotification/:u_id", async function (req, res) {
  const data = await adminapi.chatnotification(req.params);
  res.send({
    ...data,
  });
});

app.get("/user-check/:id", async function (req, res) {
  const data = await adminapi.usercheck(req.params);
  res.send({
    ...data,
  });
});

//Get today customer followup
app.get("/gettodaycustomerfollowup/:id", async function (req, res) {
  const data = await adminapi.getTodayCFollowup(req.params);
  res.send({
    ...data,
  });
});

app.post("/customerfollow-read", async function (req, res) {
  const data = await adminapi.CustomerFollowRead(req.body);
  res.send({
    ...data,
  });
});

//counter leadfollowup
app.post("/get-customerfollowupcounter", async function (req, res) {
  const data = await adminapi.getCustomerFollowupCounter(req.body);
  res.send({
    ...data,
  });
});

//Search main customer
app.post("/search-attribute", async function (req, res) {
  const data = await adminapi.searchAttribute(req.body);
  res.send({
    ...data,
  });
});

//get apostillecustomer by customer id
app.get("/get-apostillelistbycid/:c_id/:page/:perPage", async function (
  req,
  res
) {
  const data = await adminapi.getApostilleListBycid(req.params);
  res.send({
    ...data,
  });
});

//get translationcustomer by customer id
app.get("/get-translationbycid/:c_id/:page/:perPage", async function (
  req,
  res
) {
  const data = await adminapi.getTranslationListBycid(req.params);
  res.send({
    ...data,
  });
});

//get visacustomer by customer id
app.get("/get-visabycid/:c_id/:page/:perPage", async function (req, res) {
  const data = await adminapi.getVisaListBycid(req.params);
  res.send({
    ...data,
  });
});

//update under process date
app.post("/update-underprocessdate", async function (req, res) {
  const data = await adminapi.updateUnderProcessDate(req.body);
  res.send({
    ...data,
  });
});

app.post("/send-policymail", async function (req, res) {
  const data = await adminapi.sendpolicymail(req.body);
  res.send({
    ...data,
  });
});

app.post("/send-codemail", async function (req, res) {
  const data = await adminapi.sendCodeMail(req.body);
  res.send({
    ...data,
  });
});

app.post("/get-detailid", async function (req, res) {
  const data = await adminapi.getDetailId(req.body);
  res.send({
    ...data,
  });
});

app.get("/get-allcashflow", async function (req, res) {
  const data = await adminapi.getallcashflow();
  res.send({
    ...data,
  });
});

app.get("/read-cashflow/:cashflow_id", async function (req, res) {
  const data = await adminapi.readCashflowNotification(req.params);
  res.send({
    ...data,
  });
});

app.get("/get-alldispatchingapplications/:u_id/:branch_id", async function (
  req,
  res
) {
  const data = await adminapi.getallDispatchingApplication(req.params);
  res.send({
    ...data,
  });
});

app.post("/update-paymentWithTdsAmount", async function (req, res) {
  const data = await adminapi.updatePaymentwithTDSAmount(req.body);
  res.send({
    ...data,
  });
});

app.post("/delete-paymentWithTdsAmount", async function (req, res) {
  const data = await adminapi.deletePaymentwithTDSAmount(req.body);
  res.send({
    ...data,
  });
});

app.post("/search-pickupdonecourierreport", async function (req, res) {
  const data = await adminapi.searchPickupDoneCourierReport(req.body);
  res.send({
    ...data,
  });
});

app.post("/get-multiinvoicesinglecustomer", async function (req, res) {
  const data = await adminapi.multiInvoiceSingleCustomer(req.body);
  res.send({
    ...data,
  });
});
//Search Lead allpickupdoneleadlist
app.post("/search-allpickupdoneleadlist", async function (req, res) {
  const data = await adminapi.searchAllpickupdoneleadlist(req.body);
  res.send({
    ...data,
  });
});

//Generate cashflow report
app.post("/get-cashflowdetailspdf", async function (req, res) {
  const data = await adminapi.getCashflowDetailsPdf(req.body);
  res.send({
    ...data,
  });
});

app.get("/fetch-cashflowdetails-pdf/:id", async function (req, res) {
  const data = req.params;
  res.sendFile(`${__dirname}/public/Assets/cashflowreports_pdf/cashflow_${data.id}.pdf`);
});


//get-commissiondetails
app.get("/get-commissiondetails/:c_r_id", async function (req, res) {
  const data = await adminapi.getcommissionDataById(req.params);
  res.send({
    ...data,
  });
});

//Generate commission report
app.post("/get-commissiondetailspdf", async function (req, res) {
  const data = await adminapi.getCommissionDetailsPdf(req.body);
  res.send({
    ...data,
  });
});

app.get("/fetch-commissiondetails-pdf/:id", async function (req, res) {
  const data = req.params;
  res.sendFile(`${__dirname}/public/Assets/commissionreports_pdf/commission_${data.id}.pdf`);
});

//Insert Leave 
app.post("/insertleave", async function (req, res) {
  const data = await adminapi.InsertLeaveService(req.body);
  res.send({
    ...data,
  });
});

//Get Leave Data
app.post("/getleavedata", async function (req, res) {
  const data = await adminapi.getLeaveData(req.body);
  res.send({
    ...data,
  });
});

//Update Leave 
app.post("/updateleave", async function (req, res) {
  const data = await adminapi.UpdateLeaveService(req.body);
  res.send({
    ...data,
  });
});

//Update Leave Status
app.post("/updateleavestatus", async function (req, res) {
  const data = await adminapi.UpdateLeaveStatusService(req.body);
  res.send({
    ...data,
  });
});




//get lead customer by id
app.get("/get-leadcustomer/:id", async function (req, res) {
  const data = await adminapi.getLeadCustomerById(req.params);
  res.send({
    ...data,
  });
});


//Delete Lead Customer
app.get("/delete-leadcustomer/:id", async function (req, res) {
  const data = await adminapi.deleteProformaCustomer(req.params);
  res.send({
    ...data,
  });
});

//update Lead customer
app.post("/update-proformacustomer", async function (req, res) {
  const data = await adminapi.updateProformaCustomer(req.body);
  res.send({
    ...data,
  });
});


//Get Attribute Name by id
app.get("/get-attributenamebyid/:id", async function (req, res) {
  const data = await adminapi.getAttributeNamebyid(req.params);
  res.send({
    ...data,
  });
});
