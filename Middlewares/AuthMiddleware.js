const con = require("../database");

var authTokenMiddleware = async (req, res, next) => {
    try {
        let authentication = req.headers.authorization;
        if (authentication != undefined && authentication != null && authentication != "") {
            authentication = req.headers.authorization.replace("Bearer ", "");

            if (req.headers.type == 0) {
                let sql = `SELECT * FROM users WHERE auth_token = '${authentication}'`;

                let response = await new Promise((resolve, reject) => {
                    con.query(sql, async function (err, result) {
                        if (err) {
                            console.log(err);
                            res.status(403).json({
                                status: 0,
                                description: "Unauthorized User",
                            });
                        } else {
                            if (result.length > 0 && result != undefined) {
                                req.headers.u_id = result[0].u_id;
                                req.headers.userType = result[0].user_type;
                                req.headers.userData = result[0];
                                req.headers.type = 0;
                                next();
                            } else {
                                res.status(403).json({
                                    status: 0,
                                    description: "Unauthorized User",
                                });
                            }
                        }
                    });
                });
            } else {
                let sql = `SELECT * FROM main_customer WHERE auth_token = '${authentication}'`;
                let response = await new Promise((resolve, reject) => {
                    con.query(sql, async function (err, result) {
                        console.log(err, result);
                        if (err) {
                            console.log(err);
                            res.status(403).json({
                                status: 0,
                                description: "Unauthorized User",
                            });
                        } else {
                            if (result.length > 0 && result != undefined) {
                                req.headers.c_id = result[0].c_id;
                                req.headers.customerData = result[0];
                                req.headers.type = 1;
                                next();
                            } else {
                                res.status(403).json({
                                    status: 0,
                                    description: "Unauthorized User",
                                });
                            }
                        }
                    });
                });
            }
        } else {
            res.status(403).json({
                status: 0,
                description: "Unauthorized User",
            });
        }
    } catch (error) {
        console.error(error);
    }
};
module.exports = {
    authTokenMiddleware,
};
