const con = require("./database");
const moment = require("moment");

async function login(email, pass, ip, otp) {
  try {
    let current_time = moment().format("HH:mm:ss");
    var date = moment().format("DD-MM-YYYY");
    sql = `SELECT *,(SELECT b_name FROM branch where branch.branch_id=users.branch_id) as branch_name  FROM users WHERE (u_email = '${email}' AND password = md5('${pass}') AND loginotp = ${otp}) OR (u_name='${email}' AND password = md5('${pass}') AND loginotp = ${otp}) and deleted=0`;

    let response = await new Promise((resolve, reject) => {
      con.query(sql, function (err, result) {
        if (err) {
          return err.message;
        }
        if (result.length == 0) {
          test = {
            message: "Invalid email id and password or Otp ",
            status: 0,
          };
          resolve(test);
        }
        if (result && result.length > 0) {
          sql1 = `SELECT * FROM user_permission,features WHERE features.f_id=user_permission.f_id and u_id=${result[0].u_id} and features.deleted=0`;
          con.query(sql1, function (err, res) {
            sq12 = `UPDATE users SET check_in_status = '1' WHERE users.u_id = ${result[0].u_id}`;

            con.query(sq12, function (err, res) {
              if (err) {
                return err.message;
              }
              if (res.affectedRows > 0) {
                resolve({ status: 1 });
              }
            });
            // sq11 = `INSERT INTO login_activity_log(login_time,date,u_id)VALUES('${mysql_real_escape_string(
            //   current_time
            // )}','${mysql_real_escape_string(date)}',${result[0].u_id})`;

            // con.query(sq11, function (err, res) {
            //   if (err) {
            //     return err.message;
            //   }
            //   if (res.affectedRows > 0) {
            //     resolve({ status: 1 });
            //   }
            // });
            test = {
              message: "Login Successfully",
              status: 1,
              data: result[0],
              permission: res,
              uid: result[0].u_id,
              user_type: result[0].user_type,
              branch_id: result[0].branch_id,
              is_ip: result[0].is_ip,
            };
            resolve(test);
          });
        }
      });
    });
    if (response.status == 0) {
      return response;
    } else {
      let bcheckresponse = await new Promise((resolve, reject) => {
        if (response.user_type == 1 || response.user_type == 3) {
          if (response.is_ip == 1) {
            bchecksql = `SELECT * FROM branch,users WHERE users.branch_id=branch.branch_id and branch.branch_id=${response.branch_id} AND FIND_IN_SET('${ip}',branch.ip_address) and users.is_ip=1 AND branch.deleted=0;`;
            con.query(bchecksql, function (err, res) {
              if (err) {
                resolve({ status: 0, message: "Something went to wrong" });
              }
              if (res.length > 0) {
                resolve({ status: 1 });
              } else {
                resolve({ status: 0 });
              }
            });
          } else if (response.is_ip == 0) {
            resolve({ status: 1 });
          }
        } else {
          resolve({ status: 1 });
        }
      });

      sq12 = `SELECT *,(SELECT b_name FROM branch where branch.branch_id=users.branch_id) as branch_name  FROM users WHERE u_email = '${email}' and deleted=0`;
      console.log("sq12", sq12);
      let ress = await new Promise((resolve, reject) => {
        con.query(sq12, async function (err, res) {
          console.log("df", res);
          if (err) {
            return err.message;
          }
          if (res.length > 0) {
            console.log("res[0]", res);
            resolve({
              status: 1,
              data: res[0],
            });
          }
        });
      });

      if (bcheckresponse.status == 0) {
        let errresponse = await new Promise((resolve, reject) => {
          test = {
            message: "Invalid email id and password and IP Address",
            status: 0,
          };
          resolve(test);
        });
        return errresponse;
      } else {
        esql = `SELECT * FROM email_access_permission,attributes WHERE attributes.attribute_id=email_access_permission.attribute_id and u_id=${response.uid} and attributes.status=0`;
        let response1 = await new Promise((resolve, reject) => {
          con.query(esql, function (err, eres) {
            if (err) {
              resolve({ status: 0, message: "Something went to wrong" });
            }
            if (eres.length > 0) {
              sq11 = `INSERT INTO login_activity_log(login_time,date,u_id)VALUES('${mysql_real_escape_string(
                current_time
              )}','${mysql_real_escape_string(date)}',${response.uid})`;

              con.query(sq11, function (err, res) {
                if (err) {
                  return err.message;
                }
                if (res.affectedRows > 0) {
                  resolve({ status: 1 });
                }
              });
              test = {
                message: "Login Successfully",
                status: 1,
                data: ress.data,
                permission: response.permission,
                edata: eres,
              };
              resolve(test);
            } else {
              sq11 = `INSERT INTO login_activity_log(login_time,date,u_id)VALUES('${mysql_real_escape_string(
                current_time
              )}','${mysql_real_escape_string(date)}',${response.uid})`;

              con.query(sq11, function (err, res) {
                if (err) {
                  return err.message;
                }
                if (res.affectedRows > 0) {
                  resolve({ status: 1 });
                }
              });
              test = {
                message: "Login Successfully",
                status: 1,
                data: ress.data,
                permission: response.permission,
              };
              resolve(test);
            }
          });
        });
        return response1;
      }
    }
  } catch (error) {
    console.error(error);
  }
}

// async function customerLogin(email, pass) {
//   try {
//     sql = `SELECT * FROM main_customer WHERE (m_c_email = '${email}' AND password = '${pass}' AND deleted = 0 ) OR (m_c_name='${email}' AND password = '${pass}' AND deleted = 0 )`;
//     return new Promise((resolve, reject) => {

//       con.query(sql, function (err, result) {
//         if (err) {
//           return err.message;
//         }
//         if (result.length == 0) {
//           test = {
//             message: "Invalid email id and password ",
//             status: 0,
//           };
//           resolve(test);
//         }
//         if (result && result.length>0) {
//           test = {
//             message: "Login Successfully",
//               status: 1,
//             data: result[0],
//           };
//           resolve(test);
//         }
//       });
//     });
//   } catch (error) {
//     console.error(error);
//   }
// }

async function customerLogin(email, pass) {
  try {
    sql = `SELECT * FROM main_customer WHERE (m_c_email = '${email}' AND password = '${pass}' AND deleted = 0 ) OR (m_c_name='${email}' AND password = '${pass}' AND deleted = 0 )`;
    return new Promise((resolve, reject) => {
      con.query(sql, function (err, result) {
        if (err) {
          return err.message;
        }
        if (result.length == 0) {
          test = {
            message: "Invalid email id and password ",
            status: 0,
          };
          resolve(test);
        }
        if (result && result.length > 0) {
          sql1 = `Select is_block from customer where m_c_id = ${result[0].m_c_id}`;
          con.query(sql1, function (err1, result1) {
            if (err1) {
              return err1.message;
            }
            if (result1.length > 0) {
              let block = 1;
              for (let i = 0; i < result1.length; i++) {
                if (result1[i].is_block == 0) {
                  block = 0;
                }
              }
              if (block == 0) {
                test = {
                  message: "Customer is Deactivated",
                  status: 0,
                  data: [],
                };
                resolve(test);
              } else {
                test = {
                  message: "Login Successfully",
                  status: 1,
                  data: result[0],
                };
                resolve(test);
              }
            }
          });
        }
      });
    });
  } catch (error) {
    console.error(error);
  }
}

function mysql_real_escape_string(str) {
  return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
    switch (char) {
      case "\0":
        return "\\0";
      case "\x08":
        return "\\b";
      case "\x09":
        return "\\t";
      case "\x1a":
        return "\\z";
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case '"':
      case "'":
      case "\\":
      case "%":
        return "\\" + char;
    }
  });
}

module.exports = { login, customerLogin };
