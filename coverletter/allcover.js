let moment = require("moment");
module.exports = (
  { attestation_data, apostille_data, translation_data, visa_data },
  data,
  imageAsBase64
) => {
  let total = 0;
  let vtotal = 0;
  let aptotal = 0;
  let trtotal = 0;
  let all_total = 0;
  let totals = 0;
  let vtotals = 0;
  let aptotals = 0;
  let trtotals = 0;
  let all_totals = 0;
  const getcertificate = (a, stype, type) => {
    let count = 0;
    let certificate = "";
    {
      a.split(",").map((k, index) => {
        if (type == 0) {
          count = count + 1;
          all_total = all_total + 1;
          stype == 17 ? (aptotal = aptotal + 1) : 0;
          stype == 10 ? (total = total + 1) : 0;
          stype == 20 ? (trtotal = trtotal + 1) : 0;
          stype == 8 ? (vtotal = vtotal + 1) : 0;
          certificate = certificate + ` <div> ${index + 1}. ${k}</div>`;
        }
        if (type == 1) {
          certificate =
            certificate +
            ` <div style= ${
              index === 0 ? "margin-top:35px;" : "margin-top:2px;"
            }> 1 </div>`;
        }
        if (type == 2) {
          certificate =
            certificate +
            `<div style= ${
              index === 0 ? "margin-top:35px;" : "margin-top:4px;"
            }> <input type="checkbox" id="verifyby" name="verifyby"/> </div>`;
        }
      });
    }
    return certificate;
  };

  const getcertificates = (a, stype, type) => {
    let count = 0;
    let certificate = "";
    {
      a.split(",").map((k, index) => {
        if (type == 0) {
          count = count + 1;
          all_totals = all_totals + 1;
          stype == 17 ? (aptotals = aptotals + 1) : 0;
          stype == 10 ? (totals = totals + 1) : 0;
          stype == 20 ? (trtotals = trtotals + 1) : 0;
          stype == 8 ? (vtotals = vtotals + 1) : 0;
          certificate = certificate + ` <div> ${index + 1}. ${k}</div>`;
        }
        if (type == 1) {
          certificate =
            certificate +
            ` <div style= ${
              index === 0 ? "margin-top:35px;" : "margin-top:2px;"
            }> 1 </div>`;
        }
        if (type == 2) {
          certificate =
            certificate +
            `<div style= ${
              index === 0 ? "margin-top:35px;" : "margin-top:4px;"
            }> <input type="checkbox" id="verifyby" name="verifyby"/> </div>`;
        }
      });
    }
    return certificate;
  };

  const getsupporting = (a) => {
    let supporting = "";
    {
      a
        ? a.split(",").map((k, index) => {
            supporting = supporting + ` <div> ${index + 1}. ${k}</div>`;
          })
        : "";
    }
    return supporting;
  };
  const getvisarow = () => {
    let rows = "";
    {
      visa_data.country &&
        visa_data.country.map((country) => {
          rows =
            rows +
            `<tr>
              <td style="padding:10px;" colspan="4">
                <b>
                  <h4 style="margin:0px;">${country.country_name}</h4>
                </b>
              </td>
            </tr>`;
          {
            country.visa_user &&
              country.visa_user.map((user) => {
                all_total = all_total + 1;
                vtotal = vtotal + 1;
                // let supporting = getsupporting(user.supporting_doc_name);
                rows =
                  rows +
                  `<tr>
                  <td style="padding:10px;">
                    <div class="block " style="margin-bottom: 5px !important;">
                      <b>
                        <label>Name :</label>${user.v_prefix} ${user.v_name}
                      </b>
                    </div>
                    <div class="block" style="margin-bottom: 5px !important;">
                      <b>
                        <label>Process :</label>
                      </b>
                      ${user.visa_type}
                    </div>
    
                    <div class="block" style="margin-bottom: 5px !important;">
                      <b>
                        <label>Supporting Document:</label>
                      </b>
                      <br />${getsupporting(user.supporting_doc_name)}
                    </div>
                  </td>
                  <td class="" align="center">
                    1
                  </td>
                  <td class="" align="center">
                    <input
                      type="checkbox"
                      id="verifybyexcellent"
                      name="verifybyexcellent"
                    />
                  </td>
                  <td class="" align="center">
                    <input type="checkbox" id="verifybyyou" name="verifybyyou" />
                  </td>
                </tr>`;
              });
          }
        });
    }

    return rows;
  };

  const getvisarows = () => {
    let rows = "";
    {
      visa_data.ulist &&
        visa_data.ulist.map((country) => {
          rows =
            rows +
            `<tr>
              <td style="padding:10px;" colspan="4">
                <b>
                  <h4 style="margin:0px;">${country.country_name}</h4>
                </b>
              </td>
            </tr>`;
          {
            country.visa_users &&
              country.visa_users.map((user) => {
                all_totals = all_totals + 1;
                vtotals = vtotals + 1;
                // let supporting = getsupporting(user.supporting_doc_name);
                rows =
                  rows +
                  `<tr>
                  <td style="padding:10px;">
                    <div class="block " style="margin-bottom: 5px !important;">
                      <b>
                        <label>Name :</label>${user.v_prefix} ${user.v_name}
                      </b>
                    </div>
                    <div class="block" style="margin-bottom: 5px !important;">
                      <b>
                        <label>Supporting Document:</label>
                      </b>
                      <br />${getsupporting(user.supporting_doc_name)}
                    </div>
                    <div class="block" style="margin-bottom: 5px !important;">
                      <b>
                        <label>Reason :</label>
                      </b>
                      <br />${user.reason}
                    </div>
                  </td>
                  <td class="" align="center">
                    1
                  </td>
                  <td class="" align="center">
                    <input
                      type="checkbox"
                      id="verifybyexcellent"
                      name="verifybyexcellent"
                    />
                  </td>
                  <td class="" align="center">
                    <input type="checkbox" id="verifybyyou" name="verifybyyou" />
                  </td>
                </tr>`;
              });
          }
        });
    }

    return rows;
  };

  const getrow = () => {
    let rows = "";
    {
      if (typeof attestation_data.status != "undefined") {
        attestation_data.country &&
          attestation_data.country.map((country) => {
            rows =
              rows +
              `<tr>
                <td style="padding:10px;" colspan="4">
                  <b>
                    <h4 style=" margin:0px;">${country.country_name}</h4>
                  </b>
                </td>
              </tr>`;
            {
              country.attestation_user &&
                country.attestation_user.map((user) => {
                  // let cerficates = getcertificate(user.a_certificate_name, 10);
                  rows =
                    rows +
                    ` <tr>
                        <td style="padding:10px;">
                          <div
                            class="block "
                            style="margin-bottom: 5px !important;"
                          >
                            <b>
                              <label>Name :</label>${user.a_prefix} ${
                      user.a_name
                    }
                            </b>
                          </div>
                          <div
                            class="block"
                            style="margin-bottom: 5px !important;"
                          >
                            <b>
                              <label>Process :</label>
                            </b>
                            ${user.attestation_type}
                          </div>
                          <div
                            class="block"
                            style="margin-bottom: 5px !important;"
                          >
                            <b>
                              <label>Certificates:</label>
                            </b>
                            <br />${getcertificate(
                              user.a_certificate_name,
                              10,
                              "0"
                            )}
                          </div>
                          <div
                            class="block"
                            style="margin-bottom: 5px !important;"
                          >
                            <b>
                              <label>Supporting Document:</label>
                            </b>
                            <br />${getsupporting(user.supporting_doc_name)}
                          </div>
                        </td>
                        <td class="" align="center">
                          ${getcertificate(user.a_certificate_name, 10, "1")}
                        </td>
                        <td class="" align="center">
                          ${getcertificate(user.a_certificate_name, 10, "2")}
                        </td>
                        <td class="" align="center">
                          ${getcertificate(user.a_certificate_name, 10, "2")}
                        </td>
                      </tr>`;
                });
            }
          });
      }
    }
    return rows;
  };

  const getrows = () => {
    let rows = "";
    {
      if (typeof attestation_data.status != "undefined") {
        attestation_data.ulist &&
          attestation_data.ulist.map((ulist) => {
            rows =
              rows +
              `<tr>
                <td style="padding:10px;" colspan="4">
                  <b>
                    <h4 style=" margin:0px;">${ulist.country_name}</h4>
                  </b>
                </td>
              </tr>`;
            {
              ulist.attestation_users &&
                ulist.attestation_users.map((user) => {
                  // let cerficates = getcertificate(user.a_certificate_name, 10);
                  rows =
                    rows +
                    `<tr>
                        <td style="padding:10px;">
                          <div
                            class="block "
                            style="margin-bottom: 5px !important;"
                          >
                            <b>
                              <label>Name :</label>${user.a_prefix} ${
                      user.a_name
                    }
                            </b>
                          </div>
                         
                          <div
                            class="block"
                            style="margin-bottom: 5px !important;"
                          >
                            <b>
                              <label>Certificates:</label>
                            </b>
                            <br />${getcertificates(
                              user.a_certificate_name,
                              10,
                              "0"
                            )}
                          </div>
                          <div
                            class="block"
                            style="margin-bottom: 5px !important;"
                          >
                            <b>
                              <label>Reason :</label>
                            </b>
                            <br />${user.reason}
                          </div>
                        </td>
                        <td class="" align="center">
                          ${getcertificates(user.a_certificate_name, 10, "1")}
                        </td>
                        <td class="" align="center">
                          ${getcertificates(user.a_certificate_name, 10, "2")}
                        </td>
                        <td class="" align="center">
                          ${getcertificates(user.a_certificate_name, 10, "2")}
                        </td>
                      </tr>`;
                });
            }
          });
      }
    }
    return rows;
  };

  const getaprow = () => {
    let rows = "";
    {
      if (typeof apostille_data.status != "undefined") {
        apostille_data.country &&
          apostille_data.country.map((country) => {
            rows =
              rows +
              `<tr>
                <td style="padding:10px;" colspan="4">
                  <b>
                    <h4 style=" margin:0px;">${country.country_name}</h4>
                  </b>
                </td>
              </tr>`;
            {
              country.apostille_user &&
                country.apostille_user.map((user) => {
                  // let cerficates = getcertificate(user.a_certificate_name, 17);
                  rows =
                    rows +
                    `
                    <tr>
                      <td style="padding:10px;">
                        <div class="block " style="margin-bottom: 5px !important;">
                          <b>
                            <label>Name :</label>${user.a_prefix} ${user.a_name}
                          </b>
                        </div>
                        <div class="block" style="margin-bottom: 5px !important;">
                          <b>
                            <label>Process :</label>
                          </b>
                          ${user.apostille_type}
                        </div>
                        <div class="block" style="margin-bottom: 5px !important;">
                          <b>
                            <label>Certificates:</label>
                          </b>
                          <br />${getcertificate(
                            user.a_certificate_name,
                            17,
                            "0"
                          )}
                        </div>
                        <div class="block" style="margin-bottom: 5px !important;">
                          <b>
                            <label>Supporting Document:</label>
                          </b>
                          <br />${getsupporting(user.supporting_doc_name)}
                        </div>
                      </td>
                      <td class="" align="center">
                        ${getcertificate(user.a_certificate_name, 17, "1")}
                      </td>
                      <td class="" align="center">
                        ${getcertificate(user.a_certificate_name, 17, "2")}
                      </td>
                      <td class="" align="center">
                        ${getcertificate(user.a_certificate_name, 17, "2")}
                      </td>
                    </tr>`;
                });
            }
          });
      }
    }
    return rows;
  };

  const getaprows = () => {
    let rows = "";
    {
      if (typeof apostille_data.status != "undefined") {
        apostille_data.ulist &&
          apostille_data.ulist.map((country) => {
            rows =
              rows +
              `<tr>
                <td style="padding:10px;" colspan="4">
                  <b>
                    <h4 style=" margin:0px;">${country.country_name}</h4>
                  </b>
                </td>
              </tr>`;
            {
              country.apostille_users &&
                country.apostille_users.map((user) => {
                  // let cerficates = getcertificate(user.a_certificate_name, 17);
                  rows =
                    rows +
                    `
                    <tr>
                      <td style="padding:10px;">
                        <div class="block " style="margin-bottom: 5px !important;">
                          <b>
                            <label>Name :</label>${user.a_prefix} ${user.a_name}
                          </b>
                        </div>
                        <div class="block" style="margin-bottom: 5px !important;">
                          <b>
                            <label>Certificates:</label>
                          </b>
                          <br />${getcertificates(
                            user.a_certificate_name,
                            17,
                            "0"
                          )}
                        </div>
                        <div class="block" style="margin-bottom: 5px !important;">
                          <b>
                            <label>Reason:</label>
                          </b>
                          <br />${user.reason}
                        </div>
                      </td>
                      <td class="" align="center">
                        ${getcertificates(user.a_certificate_name, 17, "1")}
                      </td>
                      <td class="" align="center">
                        ${getcertificates(user.a_certificate_name, 17, "2")}
                      </td>
                      <td class="" align="center">
                        ${getcertificates(user.a_certificate_name, 17, "2")}
                      </td>
                    </tr>`;
                });
            }
          });
      }
    }
    return rows;
  };

  const gettrrow = () => {
    let rows = "";
    {
      if (typeof translation_data.status != "undefined") {
        translation_data.country &&
          translation_data.country.map((country) => {
            rows =
              rows +
              `<tr>
                <td style="padding:10px;" colspan="4">
                  <b>
                    <h4 style=" margin:0px;">${country.country_name}</h4>
                  </b>
                </td>
              </tr>`;
            {
              country.translation_user &&
                country.translation_user.map((user) => {
                  // let cerficates = getcertificate(user.a_certificate_name, 20);
                  rows =
                    rows +
                    `<tr>
                      <td style="padding:10px;">
                        <div class="block " style="margin-bottom: 5px !important;">
                          <b>
                            <label>Name :</label>${user.a_prefix} ${user.a_name}
                          </b>
                        </div>
                        <div class="block" style="margin-bottom: 5px !important;">
                          <b>
                            <label>Process :</label>
                          </b>
                          ${user.translation_type}
                        </div>
                        <div class="block" style="margin-bottom: 5px !important;">
                          <b>
                            <label>Certificates:</label>
                          </b>
                          <br />${getcertificate(
                            user.a_certificate_name,
                            20,
                            "0"
                          )}
                        </div>
                        <div class="block" style="margin-bottom: 5px !important;">
                          <b>
                            <label>Supporting Document:</label>
                          </b>
                          <br />${getsupporting(user.supporting_doc_name)}
                        </div>
                      </td>
                      <td class="" align="center">
                        ${getcertificate(user.a_certificate_name, 20, "1")}
                      </td>
                      <td class="" align="center">
                        ${getcertificate(user.a_certificate_name, 20, "2")}
                      </td>
                      <td class="" align="center">
                        ${getcertificate(user.a_certificate_name, 20, "2")}
                      </td>
                    </tr>`;
                });
            }
          });
      }
    }
    return rows;
  };

  const gettrrows = () => {
    let rows = "";
    {
      if (typeof translation_data.status != "undefined") {
        translation_data.ulist &&
          translation_data.ulist.map((country) => {
            rows =
              rows +
              `<tr>
                <td style="padding:10px;" colspan="4">
                  <b>
                    <h4 style=" margin:0px;">${country.country_name}</h4>
                  </b>
                </td>
              </tr>`;
            {
              country.translation_users &&
                country.translation_users.map((user) => {
                  // let cerficates = getcertificate(user.a_certificate_name, 20);
                  rows =
                    rows +
                    `<tr>
                      <td style="padding:10px;">
                        <div class="block " style="margin-bottom: 5px !important;">
                          <b>
                            <label>Name :</label>${user.a_prefix} ${user.a_name}
                          </b>
                        </div>
                        
                        <div class="block" style="margin-bottom: 5px !important;">
                          <b>
                            <label>Certificates:</label>
                          </b>
                          <br />${getcertificates(
                            user.a_certificate_name,
                            20,
                            "0"
                          )}
                        </div>
                        <div class="block" style="margin-bottom: 5px !important;">
                          <b>
                            <label>Reason :</label>
                          </b>
                          <br />${user.reason}
                        </div>
                      </td>
                      <td class="" align="center">
                        ${getcertificates(user.a_certificate_name, 20, "1")}
                      </td>
                      <td class="" align="center">
                        ${getcertificates(user.a_certificate_name, 20, "2")}
                      </td>
                      <td class="" align="center">
                        ${getcertificates(user.a_certificate_name, 20, "2")}
                      </td>
                    </tr>`;
                });
            }
          });
      }
    }
    return rows;
  };

  const getheaderdata = () => {
    let rows = "";
    {
      if (typeof attestation_data.status != "undefined") {
        rows += `
        <td colspan="8" style="padding:0">
        <div class="flex"> 
            <div>
              <img style="
                display: block;" 
                width="100px" src=${`data:image/jpg;base64,${imageAsBase64}`} alt="fed">
            </div>
            <div class="mx-2" style="width:80%"> 
              <div class="flex space-between" style="width:100%">
                <div>
                  <h3 class="bold">
                  ${attestation_data.settingdata.c_name}
                  </h3>
                </div>
                <div class="fsize">
                  <label class="fsize">Date :</label> ${data.c_date} ${
          data.a_code_name
        }
                </div>
              </div>
              <div style="word-break: break-word;" class="fsize">
              ${
                attestation_data.settingdata.address != null
                  ? attestation_data.settingdata.address
                  : ""
              }
              </div>
              ${
                attestation_data.user_data.mobile != null
                  ? `<div class="fsize">
                    <label class="fsize">Contact No : </label>
                    ${attestation_data.user_data.mobile}
                  </div>`
                  : ``
              }
            </div>
        </div>
    </td>`;
      } else if (typeof visa_data.status != "undefined") {
        rows += ` <td colspan="8" style="padding:0">
        <div class="flex"> 
            <div>
              <img style="
                display: block;" 
                width="100px" src=${`data:image/jpg;base64,${imageAsBase64}`} alt="fed">
            </div>
            <div class="mx-2" style="width:80%"> 
              <div class="flex space-between" style="width:100%">
                <div>
                  <h3 class="bold">
                  ${visa_data.settingdata.c_name}
                  </h3>
                </div>
                <div class="fsize">
                  <label class="fsize">Date :</label> ${data.c_date} ${
          data.a_code_name
        }
                </div>
              </div>
              <div style="word-break: break-word;" class="fsize">
              ${
                visa_data.settingdata.address != null
                  ? visa_data.settingdata.address
                  : ""
              }
              </div>
              ${
                visa_data.user_data.mobile != null
                  ? `<div class="fsize">
                    <label class="fsize">Contact No : </label>
                    ${visa_data.user_data.mobile}
                  </div>`
                  : ``
              }
            </div>
        </div>
    </td>`;
      } else if (typeof apostille_data.status != "undefined") {
        rows += `  <td colspan="8" style="padding:0">
        <div class="flex"> 
            <div>
              <img style="
                display: block;" 
                width="100px" src=${`data:image/jpg;base64,${imageAsBase64}`} alt="fed">
            </div>
            <div class="mx-2" style="width:80%"> 
              <div class="flex space-between" style="width:100%">
                <div>
                  <h3 class="bold">
                  ${apostille_data.settingdata.c_name}
                  </h3>
                </div>
                <div class="fsize">
                  <label class="fsize">Date :</label> ${data.c_date} ${
          data.a_code_name
        }
                </div>
              </div>
              <div style="word-break: break-word;" class="fsize">
              ${
                apostille_data.settingdata.address != null
                  ? apostille_data.settingdata.address
                  : ""
              }
              </div>
              ${
                apostille_data.user_data.mobile != null
                  ? `<div class="fsize">
                    <label class="fsize">Contact No : </label>
                    ${apostille_data.user_data.mobile}
                  </div>`
                  : ``
              }
            </div>
        </div>
    </td>`;
      } else if (typeof translation_data.status != "undefined") {
        rows += `  <td colspan="8" style="padding:0">
        <div class="flex"> 
            <div>
              <img style="
                display: block;" 
                width="100px" src=${`data:image/jpg;base64,${imageAsBase64}`} alt="fed">
            </div>
            <div class="mx-2" style="width:80%"> 
              <div class="flex space-between" style="width:100%">
                <div>
                  <h3 class="bold">
                  ${translation_data.settingdata.c_name}
                  </h3>
                </div>
                <div class="fsize">
                  <label class="fsize">Date :</label> ${data.c_date} ${
          data.a_code_name
        }
                </div>
              </div>
              <div style="word-break: break-word;" class="fsize">
              ${
                translation_data.settingdata.address != null
                  ? translation_data.settingdata.address
                  : ""
              }
              </div>
              ${
                translation_data.user_data.mobile != null
                  ? `<div class="fsize">
                    <label class="fsize">Contact No : </label>
                    ${translation_data.user_data.mobile}
                  </div>`
                  : ``
              }
            </div>
        </div>
    </td>`;
      }
    }
    return rows;
  };

  return `
       <html>
       <head>
          <style>
          @import url('../../fonts/Poppins-ExtraLight.ttf');
          *{
            font-size: 14px;
            font-family: "Poppins", sans-serif;
          }
              html {
                zoom: 0.60;
              }
             .card{
                background: #fff;
                margin:50px;
              }
              h3, .h3 {
                font-size: 1.75rem;
            }
            h5, .h5 {
              font-size: 1.25rem;
          }
              table.desc-table {
                width: 100%;
              }
              th,td{
                padding: 4px;
              }
              table.desc-table tbody {
                vertical-align: top !important;
              }
              tr.billtorow {
                background: #8080803b;
              }
              tr.heading-row {
                background: #f0f0f0;
              }
              tr.blue-row {
                background: #99d2f2;
              }
              .footer{
                padding-top:10px ;  
                width: 70%;
                display: inline-block;
              }
              .footer p{
                font-weight: 600;
              }
              .flex{
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                    -webkit-box-orient: horizontal;
                    -webkit-box-direction: normal;
                        -ms-flex-direction: row;
                            flex-direction: row;
                    -webkit-box-align: center;
                        -ms-flex-align: center;
                            align-items: center;         
              }
              .space-between{
                -webkit-box-pack: justify;
                -ms-flex-pack: justify;
                    justify-content: space-between;
              }
              .flex-start{
                -webkit-box-pack: start;
                -ms-flex-pack: start;
                    justify-content: flex-start;
              }
              .mx-2{
                margin-right: 0.5rem !important;
                margin-left: 0.5rem !important;
              }
              .tbl{
                width:  100%;
              }
              .bold{
                font-weight: bolder;
              }
              .sig{
                height: 70px;
              }
              .details_table{
                width:  100%;
              }
              .desc-table b{
                  margin-left: 70px;
              }
              .block_supply{
                top: 150px;
                position: absolute;
              }
              .block_supply2{
                top: 170px;
                position: absolute;
              }
              .total_class{
                display: flex;
                padding: 0 10px;
                justify-content: space-between;
              }
              .tdmargin{
                padding-left: 4px;
              }
              .tdmarginalign{
                padding-right: 4px;
                text-align: end;
              }
              .signarureclass{
                text-align: center;
                margin-bottom: 0;
                font-weight: bold;
              }   
              .label {
                display: inline-block;
                width: 110px;
              }
              .float_right
              {
                float:right;
              }
              .fsize{
                font-size:11px !important;
              }
              .img_center{
                margin: auto;
                display: block;
              }
              .signarurestaffclass{
                text-align: center;
                margin-top: 0;
                font-weight: bold;
              }
          </style>
       </head>
       </html>
       <div class="card">
       <div style=" padding: 5px 10px; font-size: 10px">
         ${moment().format("DD-MM-YYYY HH:mm:ss")}
       </div>
       <table
         class="details_table"
         border="1"
         style="border-collapse: collapse;margin-bottom:0px !important"
       >
         <tr>${getheaderdata()}</tr>
         ${
           attestation_data &&
           typeof attestation_data.status != "undefined" &&
           attestation_data.status != 0 &&
           attestation_data.country &&
           attestation_data.country.length > 0
             ? `
             <tr class="">
               <td colspan="8" align="center">
                 <h5 style="margin-bottom : 0px;">
                   <b>Attestation Cover Letter</b>
                 </h5>
               </td>
             </tr>
             <tr style="padding: 0px;">
               <td colspan="2" style="padding: 0px;">
                 <table
                   border="1"
                   class=""
                   align="center"
                   style="width:100%;border-collapse: collapse;"
                 >
                   <tr class="heading-row">
                     <th class=""> Content</th>
                     <th class="" width="6%" align="center">
                       No of Docs
                     </th>
                     <th class="" width="6%" align="center">
                       Verified By Excellent
                     </th>
                     <th class="" width="6%" align="center">
                       Verified By You
                     </th>
                   </tr>
                   ${getrow()}
                   <tr>
                     <td class="" align="right">
                       <div class="block  m-2">Total Document</div>
                     </td>
     
                     <td class="" align="center">
                       ${total}
                     </td>
                     <td align="center"></td>
                     <td align="center"></td>
                   </tr>
                 </table>
               </td>
             </tr>
           `
             : ""
         }
         ${
           visa_data &&
           typeof visa_data.status != "undefined" &&
           visa_data.status != 0 &&
           visa_data.country &&
           visa_data.country.length > 0
             ? `
             <tr>
               <td colspan="8" align="center">
                 <h5 style="margin-bottom : 0px;">
                   <b>Visa Cover Letter</b>
                 </h5>
               </td>
             </tr>
             <tr style="padding: 0px;">
               <td colspan="2" style="padding: 0px;">
                 <table
                   border="1"
                   class=""
                   align="center"
                   style="width:100%;border-collapse: collapse;"
                 >
                   <tr class="heading-row">
                     <th class=""> Content</th>
                     <th class="" width="6%" align="center">
                       No of Docs
                     </th>
                     <th class="" width="6%" align="center">
                       Verified By Excellent
                     </th>
                     <th class="" width="6%" align="center">
                       Verified By You
                     </th>
                   </tr>
                   ${getvisarow()}
                   <tr>
                     <td class="" align="right">
                       <div class="block  m-2">Total Document</div>
                     </td>
     
                     <td class="" align="center">
                       ${vtotal}
                     </td>
                     <td align="center"></td>
                     <td align="center"></td>
                   </tr>
                 </table>
               </td>
             </tr>
           `
             : ""
         }
         ${
           apostille_data &&
           typeof apostille_data.status != "undefined" &&
           apostille_data.status != 0 &&
           apostille_data.country &&
           apostille_data.country.length > 0
             ? `
             <tr>
               <td colspan="8" align="center">
                 <h5 style="margin-bottom : 0px;">
                   <b>Apostille Cover Letter</b>
                 </h5>
               </td>
             </tr>
             <tr style="padding: 0px;">
               <td colspan="2" style="padding: 0px;">
                 <table
                   border="1"
                   class=""
                   align="center"
                   style="width:100%;border-collapse: collapse;"
                 >
                   <tr class="heading-row">
                     <th class=""> Content</th>
                     <th class="" width="6%" align="center">
                       No of Docs
                     </th>
                     <th class="" width="6%" align="center">
                       Verified By Excellent
                     </th>
                     <th class="" width="6%" align="center">
                       Verified By You
                     </th>
                   </tr>
                   ${getaprow()}
                   <tr>
                     <td class="" align="right">
                       <div class="block  m-2">Total Document</div>
                     </td>
     
                     <td class="" align="center">
                       ${aptotal}
                     </td>
                     <td align="center"></td>
                     <td align="center"></td>
                   </tr>
                 </table>
               </td>
             </tr>
           `
             : ""
         }
         ${
           translation_data &&
           typeof translation_data.status != "undefined" &&
           translation_data.status != 0 &&
           translation_data.country &&
           translation_data.country.length > 0
             ? `
             <tr class="">
               <td colspan="8" align="center">
                 <h5 style="margin-bottom : 0px;">
                   <b>Translation Cover Letter</b>
                 </h5>
               </td>
             </tr>
             <tr style="padding: 0px;">
               <td colspan="2" style="padding: 0px;">
                 <table
                   border="1"
                   class=""
                   align="center"
                   style="width:100%;border-collapse: collapse;"
                 >
                   <tr class="heading-row">
                     <th class=""> Content</th>
                     <th class="" width="6%" align="center">
                       No of Docs
                     </th>
                     <th class="" width="6%" align="center">
                       Verified By Excellent
                     </th>
                     <th class="" width="6%" align="center">
                       Verified By You
                     </th>
                   </tr>
                   ${gettrrow()}
                   <tr>
                     <td class="" align="right">
                       <div class="block  m-2">Total Document</div>
                     </td>
                     <td class="" align="center">
                       ${trtotal}
                     </td>
                     <td align="center"></td>
                     <td align="center"></td>
                   </tr>
                 </table>
               </td>
             </tr>
           `
             : ""
         }
         ${
           (attestation_data &&
             attestation_data.country &&
             attestation_data.country.length > 0) ||
           (visa_data && visa_data.country && visa_data.country.length > 0) ||
           (apostille_data &&
             apostille_data.country &&
             apostille_data.country.length > 0) ||
           (translation_data &&
             translation_data.country &&
             translation_data.country.length > 0)
             ? `<tr>
               <td class="" align="right">
                 <div class="block  m-2">
                   <b>All Total Document</b>
                 </div>
               </td>

               <td class="" align="center" width="18.1%">
                 ${all_total}
               </td>
             </tr>`
             : ""
         }
         ${
           (attestation_data &&
             attestation_data.ulist &&
             attestation_data.ulist.length > 0) ||
           (visa_data && visa_data.ulist && visa_data.ulist.length > 0) ||
           (apostille_data &&
             apostille_data.ulist &&
             apostille_data.ulist.length > 0) ||
           (translation_data &&
             translation_data.ulist &&
             translation_data.ulist.length > 0)
             ? `<tr class="">
               <td colspan="8" align="center">
                 <h5 style="margin-bottom : 0px;">
                   <b>Under Correction</b>
                 </h5>
               </td>
             </tr>`
             : ""
         }
         ${
           attestation_data &&
           attestation_data.ulist &&
           attestation_data.ulist.length > 0
             ? `
            <tr class="">
              <td colspan="8" align="center">
                <h5 style="margin-bottom : 0px;">
                  <b>Attestation Cover Letter</b>
                </h5>
              </td>
            </tr>
            <tr style="padding: 0px;">
              <td colspan="2" style="padding: 0px;">
                <table
                  border="1"
                  class=""
                  align="center"
                  style="width:100%;border-collapse: collapse;"
                >
                  <tr class="heading-row">
                    <th class=""> Content</th>
                    <th class="" width="6%" align="center">
                      No of Docs
                    </th>
                    <th class="" width="6%" align="center">
                      Verified By Excellent
                    </th>
                    <th class="" width="6%" align="center">
                      Verified By You
                    </th>
                  </tr>
                  ${getrows()}
                  <tr>
                    <td class="" align="right">
                      <div class="block  m-2">Total Document</div>
                    </td>
    
                    <td class="" align="center">
                      ${totals}
                    </td>
                    <td align="center"></td>
                    <td align="center"></td>
                  </tr>
                </table>
              </td>
            </tr>
          `
             : ""
         }
         ${
           visa_data && visa_data.ulist && visa_data.ulist.length > 0
             ? `
           <tr class="">
             <td colspan="8" align="center">
               <h5 style="margin-bottom : 0px;">
                 <b>Visa Cover Letter</b>
               </h5>
             </td>
           </tr>
           <tr style="padding: 0px;">
             <td colspan="2" style="padding: 0px;">
               <table
                 border="1"
                 class=""
                 align="center"
                 style="width:100%;border-collapse: collapse;"
               >
                 <tr class="heading-row">
                   <th class=""> Content</th>
                   <th class="" width="6%" align="center">
                     No of Docs
                   </th>
                   <th class="" width="6%" align="center">
                     Verified By Excellent
                   </th>
                   <th class="" width="6%" align="center">
                     Verified By You
                   </th>
                 </tr>
                 ${getvisarows()}
                 <tr>
                   <td class="" align="right">
                     <div class="block  m-2">Total Document</div>
                   </td>
   
                   <td class="" align="center">
                     ${vtotals}
                   </td>
                   <td align="center"></td>
                   <td align="center"></td>
                 </tr>
               </table>
             </td>
           </tr>
         `
             : ""
         }
         ${
           apostille_data &&
           apostille_data.ulist &&
           apostille_data.ulist.length > 0
             ? `
           <tr class="">
             <td colspan="8" align="center">
               <h5 style="margin-bottom : 0px;">
                 <b>Apostille Cover Letter</b>
               </h5>
             </td>
           </tr>
           <tr style="padding: 0px;">
             <td colspan="2" style="padding: 0px;">
               <table
                 border="1"
                 class=""
                 align="center"
                 style="width:100%;border-collapse: collapse;"
               >
                 <tr class="heading-row">
                   <th class=""> Content</th>
                   <th class="" width="6%" align="center">
                     No of Docs
                   </th>
                   <th class="" width="6%" align="center">
                     Verified By Excellent
                   </th>
                   <th class="" width="6%" align="center">
                     Verified By You
                   </th>
                 </tr>
                 ${getaprows()}
                 <tr>
                   <td class="" align="right">
                     <div class="block  m-2">Total Document</div>
                   </td>
   
                   <td class="" align="center">
                     ${aptotals}
                   </td>
                   <td align="center"></td>
                   <td align="center"></td>
                 </tr>
               </table>
             </td>
           </tr>
         `
             : ""
         }
         ${
           translation_data &&
           translation_data.ulist &&
           translation_data.ulist.length > 0
             ? `
          <tr class="">
            <td colspan="8" align="center">
              <h5 style="margin-bottom : 0px;">
                <b>Translation Cover Letter</b>
              </h5>
            </td>
          </tr>
          <tr style="padding: 0px;">
            <td colspan="2" style="padding: 0px;">
              <table
                border="1"
                class=""
                align="center"
                style="width:100%;border-collapse: collapse;"
              >
                <tr class="heading-row">
                  <th class=""> Content</th>
                  <th class="" width="6%" align="center">
                    No of Docs
                  </th>
                  <th class="" width="6%" align="center">
                    Verified By Excellent
                  </th>
                  <th class="" width="6%" align="center">
                    Verified By You
                  </th>
                </tr>
                ${gettrrows()}
                <tr>
                  <td class="" align="right">
                    <div class="block  m-2">Total Document</div>
                  </td>
  
                  <td class="" align="center">
                    ${trtotals}
                  </td>
                  <td align="center"></td>
                  <td align="center"></td>
                </tr>
              </table>
            </td>
          </tr>
        `
             : ""
         }
         ${
           (attestation_data &&
             attestation_data.ulist &&
             attestation_data.ulist.length > 0) ||
           (visa_data && visa_data.ulist && visa_data.ulist.length > 0) ||
           (apostille_data &&
             apostille_data.ulist &&
             apostille_data.ulist.length > 0) ||
           (translation_data &&
             translation_data.ulist &&
             translation_data.ulist.length > 0)
             ? `<tr>
          <td class="" align="right">
            <div class="block  m-2">
              <b>All Total Document</b>
            </div>
          </td>
    
          <td class="" align="center" width="18.1%">
            ${all_totals}
          </td>
        </tr>`
             : ""
         }
       </table>
     </div>`;
};
