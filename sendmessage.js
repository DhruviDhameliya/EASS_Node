const con = require("./database");
const nodeMailer = require("nodemailer");
const moment = require("moment");
const { response } = require("express");
const { resolve } = require("path");
const { Console } = require("console");
const { attachment } = require("express/lib/response");
const { getMaxListeners } = require("process");

// Get Email Setting for Sending Mails From admin Mail Or Branch Email Address

async function getEmailSetting(id) {
  let find_mailer_detail = "";
  let getemailsettingsql = ``;
  let memberbranch = null;
  try {
    userresponse = await new Promise((resolve, reject) => {
      userquery = `select * from users where deleted=0 and u_id=${id}`;
      con.query(userquery, function (err, userres) {
        if (err) {
          resolve({ status: 0, message: "Something went to wrong" });
        } else {
          if (userres.length > 0) {
            resolve({ ...userres[0] });
          }
        }
      });
    });

    if (userresponse.user_type == 0) {
      // allocated to admin so get admin header footer
      find_mailer_detail = 0; // if 0 so get admin detail
      memberbranch = await new Promise((resolve, reject) => {
        getemailsettingsql = `SELECT *,e_username as reply_mail,(SELECT gst_bankdetails FROM branch WHERE branch_id=(SELECT branch_id FROM users WHERE u_id=1)) as gst_bankdetails,(SELECT ngst_bankdetails FROM branch WHERE branch_id=(SELECT branch_id FROM users WHERE u_id=1)) as ngst_bankdetails,(SELECT general_bankdetails FROM branch WHERE branch_id=(SELECT branch_id FROM users WHERE u_id=1)) as general_bankdetails FROM gsetting WHERE gsetting.s_id = 1`;

        con.query(getemailsettingsql, function (esettingerr, esettingres) {
          if (esettingerr) {
            // console.log("esettingerr");
            // console.log(esettingerr);
            resolve({ status: 0, message: "Something went to wrong" });
          }
          if (esettingres.length > 0) {
            resolve({ ...esettingres[0] });
          } else {
            resolve({ status: 0, message: "Something went to wrong" });
          }
        });
      });

      return memberbranch;
    } else if (userresponse.user_type == 1) {
      getmemberbranchsql = `SELECT branch_id FROM users WHERE u_id = ${id}`;
      memberbranch = await new Promise((resolve, reject) => {
        con.query(
          getmemberbranchsql,
          function (memberbrancherr, memberbrancherrresult) {
            if (memberbrancherr) {
              resolve({ status: 0, message: "Something went to wrong" });
            }
            if (memberbrancherrresult) {
              getemailsettingsql = `SELECT branch.*,b_e_host as e_host, b_e_port as e_port , b_e_username as e_username , b_e_username as reply_mail,b_e_password as e_password , b_email_template_header as email_template_header , b_email_template_footer as email_template_footer , b_email_signature as email_signature,gst_bankdetails,ngst_bankdetails,general_bankdetails FROM branch WHERE branch_id = ${memberbrancherrresult[0].branch_id}`;
              con.query(
                getemailsettingsql,
                function (esettingerr, esettingres) {
                  if (esettingerr) {
                    resolve({ status: 0, message: "Something went to wrong" });
                  }
                  if (esettingres.length > 0) {
                    resolve({ ...esettingres[0] });
                  } else {
                    resolve({ status: 0, message: "Something went to wrong" });
                  }
                }
              );
            }
          }
        );
      });
      return memberbranch;
    } else if (userresponse.user_type == 3) {
      getmemberbranchsql = `SELECT branch_id FROM users WHERE u_id = ${id}`;
      memberbranch = await new Promise((resolve, reject) => {
        con.query(
          getmemberbranchsql,
          function (memberbrancherr, memberbrancherrresult) {
            if (memberbrancherr) {
              resolve({ status: 0, message: "Something went to wrong" });
            }
            if (memberbrancherrresult) {
              getemailsettingsql = `SELECT branch.*,b_e_host as e_host, b_e_port as e_port , b_e_username as e_username ,users.u_email as reply_mail, b_e_password as e_password , b_email_template_header as email_template_header , users.u_footer as email_template_footer , users.s_email_signature as email_signature,gst_bankdetails,ngst_bankdetails,general_bankdetails FROM branch,users WHERE branch.branch_id=users.branch_id and branch.branch_id = ${memberbrancherrresult[0].branch_id} AND users.u_id=${id}`;
              // console.log("getemailsettingsql", getemailsettingsql);
              con.query(
                getemailsettingsql,
                function (esettingerr, esettingres) {
                  if (esettingerr) {
                    resolve({ status: 0, message: "Something went to wrong" });
                  }
                  if (esettingres.length > 0) {
                    resolve({ ...esettingres[0] });
                  } else {
                    resolve({ status: 0, message: "Something went to wrong" });
                  }
                }
              );
            }
          }
        );
      });
      return memberbranch;
    }
  } catch (error) {
    return { status: 0, message: "Invalid Call Try Again" };
  }
}

async function getTemplate(id) {
  try {
    sql = `SELECT * FROM email_template WHERE e_t_id = ${id} and deleted=0 and status=1`;
    let response = await new Promise((resolve, reject) => {
      con.query(sql, function (err, result) {
        if (err) {
          resolve({ status: 0, message: "Something went to wrong" });
        }
        if (result.length > 0) {
          attachmentsql = `SELECT * FROM e_attachment WHERE e_id  = ${id}`;
          con.query(attachmentsql, function (atterr, attres) {
            if (atterr) {
              resolve({ status: 0, message: "Something went to wrong" });
            }
            if (attres.length > 0) {
              resolve({ ...result[0], attachment: attres });
            } else {
              resolve({ ...result[0], attachment: [] });
            }
          });
        } else {
          resolve({ status: 0, message: "No Template" });
        }
      });
    });
    return response;
  } catch (error) {
    return { status: 0, message: "Invalid Call Try Again" };
  }
}

async function messagesend(
  senderMailSetting,
  recivermail,
  msg,
  subject,
  attachment,
  // ccmail,
  replymail,
  type,
  pathname,
  time = null
) {
  try {
    //type  1 => Send Mail & type 2 => Send SMS
    att = [];
    if (type == 1) {
      attachment.map((e) => {
        att.push({
          filename: e.url,
          path: pathname + "/" + e.url,
        });
      });

      let response = await new Promise((resolve, reject) => {
        let transporter = nodeMailer.createTransport({
          host: senderMailSetting.e_host,
          port: senderMailSetting.e_port,
          secureConnection: false,
          auth: {
            user: senderMailSetting.e_username,
            pass: senderMailSetting.e_password,
          },
        });

        let mailOptions = {
          from:
            '"Excellent Apostille Services" <' +
            senderMailSetting.e_username +
            ">", // sender address
          // to:"vatsalmarkana22@gmail.com", // list of receivers
          // cc: ccmail,
          // cc: "drashtialagiya.tls@gmail.com,tlskashyap26@gmail.com",
          to: recivermail,
          replyTo: replymail, //senderMailSetting.reply_mail,
          subject: `${subject}    || Dt : ${moment().format(
            "DD-MM-YYYY HH:mm:ss"
          )}`, // Subject line
          html: msg, // html body
          attachments: [...att],
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            // return console.log(err.message);
          }

          console.log("Message %s sent: %s", info.messageId, info.response, moment().format(
            "DD-MM-YYYY HH:mm:ss"
          ));
          resolve({
            status: 1,
            message: "Mail Send Successfully",
          });
        });
      });
      return response;
    }
  } catch (error) {
    // console.log(error);
    return { status: 0, message: "Invalid Call Try Again Email Error" };
  }
}

async function customermessagesend(
  senderMailSetting,
  recivermail,
  msg,
  subject,
  ccmail,
  replymail,
  type,
  bccmail
) {
  try {
    //type  1 => Send Mail & type 2 => Send SMS
    att = [];
    if (type == 1) {
      let response = await new Promise((resolve, reject) => {
        let transporter = nodeMailer.createTransport({
          pool: true,
          host: senderMailSetting.e_host,
          port: senderMailSetting.e_port,
          secureConnection: false,
          auth: {
            user: senderMailSetting.e_username,
            pass: senderMailSetting.e_password,
          },
        });

        let mailOptions = {
          from:
            '"Excellent Apostille Services" <' +
            senderMailSetting.e_username +
            ">", // sender address
          // to:"vatsalmarkana22@gmail.com", // list of receivers
          // cc: ccmail,
          to: recivermail,
          replyTo: replymail, //senderMailSetting.reply_mail,
          subject: `${subject}    || Dt : ${moment().format(
            "DD-MM-YYYY HH:mm:ss"
          )}`, // Subject line
          html: msg, // html body
          // attachments: [...att],
        };
        if (ccmail != "") {
          mailOptions["cc"] = ccmail;
        }
        if (bccmail != "") {
          mailOptions["bcc"] = bccmail;
        }

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            // return console.log(err.message);
          }

          console.log("Message %s sent: %s", info.messageId, info.response, moment().format(
            "DD-MM-YYYY HH:mm:ss"
          ));
          resolve({
            status: 1,
            message: "Mail Send Successfully",
          });
        });
      });
      return response;
    }
  } catch (error) {
    // console.log(error);
    return { status: 0, message: "Invalid Call Try Again Email Error" };
  }
}

async function paymentrefundsend(
  senderMailSetting,
  recivermail,
  msg,
  subject,
  attachment,
  // ccmail,
  replymail,
  type,
  pathname
) {
  try {
    //type  1 => Send Mail & type 2 => Send SMS
    att = [];
    if (type == 1) {
      attachment.map((e) => {
        att.push({
          filename: e.url,
          path: pathname + "/" + e.url,
        });
      });

      let response = await new Promise((resolve, reject) => {
        let transporter = nodeMailer.createTransport({
          pool: true,
          host: senderMailSetting.e_host,
          port: senderMailSetting.e_port,
          secureConnection: false,
          auth: {
            user: senderMailSetting.e_username,
            pass: senderMailSetting.e_password,
          },
        });

        let mailOptions = {
          from:
            '"Excellent Apostille Services" <' +
            senderMailSetting.e_username +
            ">", // sender address
          // to:"vatsalmarkana22@gmail.com", // list of receivers
          // cc: ccmail,
          to: recivermail,
          replyTo: replymail, //senderMailSetting.reply_mail,
          subject: `${subject}    || Dt : ${moment().format(
            "DD-MM-YYYY HH:mm:ss"
          )}`, // Subject line
          html: msg, // html body
          attachments: [...att],
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            // return console.log(err.message);
          }

          console.log("Message %s sent: %s", info.messageId, info.response, moment().format(
            "DD-MM-YYYY HH:mm:ss"
          ));
          resolve({
            status: 1,
            message: "Mail Send Successfully",
          });
        });
      });
      return response;
    }
  } catch (error) {
    // console.log(error);
    return { status: 0, message: "Invalid Call Try Again Email Error" };
  }
}

async function sendmailoftranslation(
  senderMailSetting,
  recivermail,
  msg,
  subject,
  ccmail,
  replymail
) {
  try {
    let response = await new Promise((resolve, reject) => {
      let transporter = nodeMailer.createTransport({
        pool: true,
        host: senderMailSetting.e_host,
        port: senderMailSetting.e_port,
        secureConnection: false,
        auth: {
          user: senderMailSetting.e_username,
          pass: senderMailSetting.e_password,
        },
      });

      let mailOptions = {
        from:
          '"Excellent Apostille Services" <' +
          senderMailSetting.e_username +
          ">", // sender address
        // to:"vatsalmarkana22@gmail.com", // list of receivers
        cc: ccmail,
        to: recivermail,
        replyTo: replymail, //senderMailSetting.reply_mail,
        subject: `${subject}    || Dt : ${moment().format(
          "DD-MM-YYYY HH:mm:ss"
        )}`, // Subject line
        html: msg,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          // return console.log(err.message);
        }

        console.log("Message %s sent: %s", info.messageId, info.response, moment().format(
          "DD-MM-YYYY HH:mm:ss"
        ));
        resolve({
          status: 1,
          message: "Mail Send Successfully",
        });
      });
    });
    return response;
  } catch (error) {
    // console.log(error);
    return { status: 0, message: "Invalid Call Try Again Email Error" };
  }
}

async function custommailsend(
  senderMailSetting,
  recivermail,
  msg,
  subject,
  attachment,
  ccmail,
  replymail,
  type,
  pathname
) {
  try {
    //type  1 => Send Mail & type 2 => Send SMS
    att = [];
    if (type == 1) {
      {
        attachment != undefined &&
          attachment.map((e) => {
            att.push({
              filename: e,
              path: pathname + "/" + e,
            });
          });
      }
      let response = await new Promise((resolve, reject) => {
        let transporter = nodeMailer.createTransport({
          pool: true,
          host: senderMailSetting.e_host,
          port: senderMailSetting.e_port,
          secureConnection: false,
          auth: {
            user: senderMailSetting.e_username,
            pass: senderMailSetting.e_password,
          },
        });

        let mailOptions = {
          from:
            '"Excellent Apostille Services" <' +
            senderMailSetting.e_username +
            ">", // sender address
          // to:"vatsalmarkana22@gmail.com", // list of receivers
          cc: ccmail,
          to: recivermail,
          replyTo: replymail,
          subject: `${subject}    || Dt : ${moment().format(
            "DD-MM-YYYY HH:mm:ss"
          )}`, // Subject line
          html: msg, // html body
          attachments: [...att],
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            // return console.log(err.message);
          }

          console.log("Message %s sent: %s", info.messageId, info.response, moment().format(
            "DD-MM-YYYY HH:mm:ss"
          ));
          resolve({
            status: 1,
            message: "Mail Send Successfully",
          });
        });
      });
      return response;
    }
  } catch (error) {
    // console.log(error);
    return { status: 0, message: "Invalid Call Try Again Email Error" };
  }
}

async function onlycustomermessagesend(
  senderMailSetting,
  recivermail,
  msg,
  subject,
  // ccmail,
  replymail,
  type
) {
  try {
    //type  1 => Send Mail & type 2 => Send SMS
    att = [];
    if (type == 1) {
      let response = await new Promise((resolve, reject) => {
        let transporter = nodeMailer.createTransport({
          pool: true,
          host: senderMailSetting.e_host,
          port: senderMailSetting.e_port,
          secureConnection: false,
          auth: {
            user: senderMailSetting.e_username,
            pass: senderMailSetting.e_password,
          },
        });

        let mailOptions = {
          from:
            '"Excellent Apostille Services" <' +
            senderMailSetting.e_username +
            ">", // sender address
          // to:"vatsalmarkana22@gmail.com", // list of receivers
          // cc: ccmail,
          to: recivermail,
          replyTo: replymail, //senderMailSetting.reply_mail,
          subject: `${subject}    || Dt : ${moment().format(
            "DD-MM-YYYY HH:mm:ss"
          )}`, // Subject line
          html: msg, // html body
          // attachments: [...att],
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            // return console.log(err.message);
          }
          console.log("Message %s sent: %s", info.messageId, info.response, moment().format(
            "DD-MM-YYYY HH:mm:ss"
          ));
          resolve({
            status: 1,
            message: "Mail Send Successfully",
          });
        });
      });
      return response;
    }
  } catch (error) {
    // console.log(error);
    return { status: 0, message: "Invalid Call Try Again Email Error" };
  }
}

async function pickupmailsend(
  senderMailSetting,
  recivermail,
  msg,
  subject,
  attachment,
  ccmail,
  replymail,
  type,
  pathname
) {
  try {
    //type  1 => Send Mail & type 2 => Send SMS
    att = [];
    if (type == 1) {
      // attachment.map((e) => {
      {
        attachment != undefined &&
          att.push({
            filename: attachment,
            path: pathname + "/" + attachment,
          });
      }
      // });

      let response = await new Promise((resolve, reject) => {
        let transporter = nodeMailer.createTransport({
          pool: true,
          host: senderMailSetting.e_host,
          port: senderMailSetting.e_port,
          secureConnection: false,
          auth: {
            user: senderMailSetting.e_username,
            pass: senderMailSetting.e_password,
          },
        });
        //1103
        let mailOptions = {
          from:
            '"Excellent Apostille Services" <' +
            senderMailSetting.e_username +
            ">", // sender address
          // to:"vatsalmarkana22@gmail.com", // list of receivers
          cc: ccmail,
          to: recivermail,
          replyTo: replymail, //senderMailSetting.reply_mail,
          subject: subject, // Subject line
          html: msg, // html body
          attachments: [...att],
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            // return console.log(err.message);
          }

          console.log("Message %s sent: %s", info.messageId, info.response, moment().format(
            "DD-MM-YYYY HH:mm:ss"
          ));
          resolve({
            status: 1,
            message: "Mail Send Successfully",
          });
        });
      });
      return response;
    }
  } catch (error) {
    // console.log(error);
    return { status: 0, message: "Invalid Call Try Again Email Error" };
  }
}
async function codeMailSend(
  senderMailSetting,
  recivermail,
  msg,
  subject,
  replymail,
  type
) {
  try {
    if (type == 1) {
      // attachment.map((e) => {

      let response = await new Promise((resolve, reject) => {
        let transporter = nodeMailer.createTransport({
          pool: true,
          host: senderMailSetting.e_host,
          port: senderMailSetting.e_port,
          secureConnection: false,
          auth: {
            user: senderMailSetting.e_username,
            pass: senderMailSetting.e_password,
          },
        });
        //1103
        let mailOptions = {
          from:
            '"Excellent Apostille Services" <' +
            senderMailSetting.e_username +
            ">", // sender address
          // to:"vatsalmarkana22@gmail.com", // list of receivers
          to: recivermail,
          replyTo: replymail, //senderMailSetting.reply_mail,
          subject: subject, // Subject line
          html: msg, // html body
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            // return console.log(err.message);
          }

          console.log("Message %s sent: %s", info.messageId, info.response, moment().format(
            "DD-MM-YYYY HH:mm:ss"
          ));
          resolve({
            status: 1,
            message: "Mail Send Successfully",
          });
        });
      });
      return response;
    }
  } catch (error) {
    // console.log(error);
    return { status: 0, message: "Invalid Call Try Again Email Error" };
  }
}

module.exports = {
  getEmailSetting,
  getTemplate,
  messagesend,
  customermessagesend,
  paymentrefundsend,
  sendmailoftranslation,
  custommailsend,
  onlycustomermessagesend,
  pickupmailsend,
  codeMailSend,
};
