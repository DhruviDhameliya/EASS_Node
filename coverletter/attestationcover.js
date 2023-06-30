let moment = require("moment");
module.exports = (
  { settingdata, user_data, country, ulist },
  imageAsBase64,
  data
) => {
  let total = 0;
  const getcertificate = (a, type) => {
    let certificate = "";
    {
      a.split(",").map((k, index) => {
        if (type == 0) {
          total = total + 1;
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

  let totals = 0;
  const getcertificates = (a, type) => {
    let certificate = "";
    {
      a.split(",").map((k, index) => {
        if (type == 0) {
          totals = totals + 1;
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

  const getrow = () => {
    let rows = "";
    {
      country &&
        country.map((country) => {
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
            country.attestation_user &&
              country.attestation_user.map((user) => {
                // let cerficates = getcertificate(user.a_certificate_name);
                rows =
                  rows +
                  `<tr>
                  <td style="padding:10px;">
                    <div
                      class="block "
                      style="margin-bottom: 5px !important;"
                    >
                      <b>
                        <label>Name :</label>${user.a_prefix} ${user.a_name}
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
                          <br />
                              ${getcertificate(user.a_certificate_name, "0")}
                              </div>
                              <div
                                class="block"
                                style="margin-bottom: 5px !important;"
                              >
                                <b>
                                  <label>Supporting Document:</label>
                                </b>
                                <br />
                              ${getsupporting(user.supporting_doc_name)}
                              </div>
                              </td>
                              <td class="" align="center">
                          ${getcertificate(user.a_certificate_name, "1")}
                          </td>
                          <td class="" align="center">
                          ${getcertificate(user.a_certificate_name, "2")}
                          </td>
                          <td class="" align="center">
                          ${getcertificate(user.a_certificate_name, "2")}
                          </td>
                        </tr>`;
              });
          }
        });
    }

    return rows;
  };

  const getrows = () => {
    let rows = "";
    {
      ulist &&
        ulist.map((country) => {
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
            country.attestation_users &&
              country.attestation_users.map((user) => {
                // let cerficates = getcertificate(user.a_certificate_name);
                rows =
                  rows +
                  `<tr>
                  <td style="padding:10px;">
                    <div
                      class="block "
                      style="margin-bottom: 5px !important;"
                    >
                      <b>
                        <label>Name :</label>
                          ${user.a_prefix} ${user.a_name}
                           </b>
                           </div>
                          
                           <div
                             class="block"
                             style="margin-bottom: 5px !important;"
                           >
                             <b>
                               <label>Certificates:</label>
                             </b>
                             <br />
                              ${getcertificates(user.a_certificate_name, "0")}
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
                          ${getcertificates(user.a_certificate_name, "1")}
                          </td>
                          <td class="" align="center">
                          ${getcertificates(user.a_certificate_name, "2")}
                          </td>
                          <td class="" align="center">
                          ${getcertificates(user.a_certificate_name, "2")}
                          </td>
                        </tr>`;
              });
          }
        });
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
     <div style=" padding: 5px 10px; font-size: 10px">${moment().format(
       "DD-MM-YYYY HH:mm:ss"
     )}</div>
     <table
     class="details_table"
     border="1"
     style="border-collapse: collapse;margin-bottom:0px !important"
   >
      <tr>
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
                    ${settingdata.c_name}
                    </h3>
                  </div>
                  <div class="fsize">
                    <label class="fsize">Date :</label> ${data.c_date} ${
    data.a_code_name
  }
                  </div>
                </div>
                <div style="word-break: break-word;" class="fsize">
                ${settingdata.address != null ? settingdata.address : ""}
                </div>
                ${
                  user_data.mobile != null
                    ? `<div class="fsize">
                      <label class="fsize">Contact No : </label>
                      ${user_data.mobile}
                    </div>`
                    : ``
                }
              </div>
          </div>
        </td>
      </tr>
      <tr class="">
      <td colspan="8" align="center">
        <h5 style="margin-bottom : 0px;">
          <b>Attestation Cover Letter</b>
        </h5>
      </td>
    </tr>
      ${
        country && country.length > 0
          ? `
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
                </tr> `
          : ""
      }
      ${
        ulist && ulist.length > 0
          ? `
          <tr class="">
          <td colspan="8" align="center">
            <h5 style="margin-bottom : 0px;">
              <b>Under Correction</b>
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
      }`;
};

// module.exports = ({ settingdata, user_data, country }) => {
//   let total = 0;
//   const getcertificate = (a) => {
//     let count=0;
//     let certificate = "";
//     {
//       a.split(",").map((k, index) => {
//         count=count+1;
//         total=total+1;
//         certificate =
//         certificate +
//         ` <div> ${index + 1}. ${k}</div>`;
//       });
//     }
//     return {certificate,count};
//   };

//   const getsupporting = (a) => {
//     let supporting = "";
//     {
//       a ? a.split(",").map((k, index) => {
//         supporting =
//         supporting +
//         ` <div> ${index + 1}. ${k}</div>`;
//       }):'';
//     }
//     return supporting;
//   };

//   const getrow = () => {
//     let rows = "";
//     {country &&country.map((country) => {
//         rows =rows +
//             `<tr>
//                 <td class="p-2" colspan="4"><b> <h3>
//                     ${country.country_name}
//                     </h3></b>
//                 </td>
//             </tr>`;
//           {
//             country.attestation_user &&
//               country.attestation_user.map((user) => {

//                 let cerficates=getcertificate(user.a_certificate_name)
//                 rows = rows +
//                 `<tr>
//                     <td class="p-2">
//                         <div class="block my-2">
//                             <b>
//                                 <label className="label">
//                                   Name :
//                                 </label>
//                                  ${user.a_prefix} ${user.a_name}</b>
//                             </div>
//                             <div class="block my-2">
//                               <b>
//                                 <label className="label">
//                                   Attestation Type :
//                                 </label>
//                               </b>
//                                ${user.attestation_type}
//                             </div>
//                             <div class="block my-2">
//                               <b>
//                                 <label className="label">
//                                   Certificates:
//                                 </label>
//                               </b>
//                               <br />
//                               ${cerficates.certificate}
//                 </div>
//                             <div class="block my-2">
//                               <b>
//                                 <label className="label">
//                                   Supporting Document:
//                                 </label>
//                               </b>
//                               <br />
//                               ${getsupporting (user.supporting_doc_name)}
//                  </div>
//                           </td>
//                           <td class="" align="center">
//                             ${cerficates.count}
//                           </td>
//                           <td class="" align="center"><input type="checkbox" id="verifybyexcellent" name="verifybyexcellent"/></td>
//                           <td class="" align="center"><input type="checkbox" id="verifybyyou" name="verifybyyou"/></td>
//                         </tr>`;
//               });
//           }
//         });
//     }

//     return rows;
//   };

//   return `
//      <html>
//      <head>
//         <style>
//         html {
//           zoom: 0.70;
//         }
//            .card{
//               background: #fff;
//                 // box-shadow: 0 0 2px black;
//                 // border-color: #c0c0c0;
//                 /* box-shadow: 0 0; */
//             }
//             /* h2{
//              float: right;
//              }*/
//             table.desc-table {
//               width: 100%;
//             }
//             th,td{
//               padding: 3px;
//             }
//             table.desc-table tbody {
//               vertical-align: top !important;
//             }
//             tr.billtorow {
//               background: #8080803b;
//             }
//             tr.heading-row {
//               background: #dfdfdf;
//             }
//             .footer{
//               padding-top:10px ;
//               width: 70%;
//               display: inline-block;
//             }
//             .footer p{
//               font-weight: 600;
//             }
//             .flex{

//               display: flex;
//             }
//             .tbl{
//               width:  100%;
//             }
//             .bold{
//               font-weight: 600;
//             }
//             .sig{
//               height: 120px;
//             }
//             .details_table{
//               width:  100%;
//             }

//             .details_table,td{
//               border: 1px solid #ddd;
//               padding: 6px;
//             }
//             .desc-table b{
//                 margin-left: 70px;
//             }
//             .block_supply{
//               top: 150px;
//               position: absolute;
//             }
//             .block_supply2{
//               top: 170px;
//               position: absolute;
//             }
//             .total_class{
//               display: flex;
//               padding: 0 10px;
//               justify-content: space-between;
//             }
//             .tdmargin{
//               padding-left: 4px;
//             }
//             .tdmarginalign{
//               padding-right: 4px;
//               text-align: end;
//             }
//             .signarureclass{
//               text-align: center;
//               margin-bottom: 0;
//               font-weight: bold;
//             }
//             .label {
//               display: inline-block;
//               width: 110px;
//             }
//             .float_right
//             {
//               float:right;
//             }
//         </style>
//      </head>
//      </html>
//      <div class="card">
//         <table class="details_table">
//             <tr class="">
//                 <td colspan="8" align="center"><b>Attestation Cover Letter</b></td>
//             </tr>
//             <tr>
//                 <td >
//                     <h2>${settingdata.c_name}</h2>
//                     <span>
//                     ${settingdata.address != null ? settingdata.address : ""}
//                     ${user_data.mobile != null? `<b>Contact No :</b>${user_data.mobile}`: `` }  <br />
//                     ${user_data.mobile != null? `<b>Email :</b>${user_data.u_email}`: `` }
//                     <br />
//                 </td>
//                 <td >
//                 <div style="text-align:right;"><img width="200px" src="https://www.online.measervices.in:8443/images/${(user_data.u_id==1?'adminlogo':'branchlogo')}/${settingdata.logo}" alt="fed"></div>
//                 </td>

//             </tr>

//             <tr style="padding: 0px;">
//                 <td colspan= "2" style="padding: 0px;">
//                     <table class="" align="center" style="width:100%">
//                         <tr  class="heading-row">
//                             <th class=""> Content</th>
//                             <th class="" width="10%" align="center"> No of Document</th>
//                             <th class="" width="10%" align="center"> Verified By Excellent</th>
//                             <th class="" width="10%" align="center"> Verified By You</th>
//                         </tr>
//                         ${getrow()}
//                         <tr>
//                             <td class="" align="right">
//                                 <div class="block  m-2">Total Document</div>
//                             </td>

//                             <td class="" align="center">
//                                  ${total}
//                             </td>
//                             <td class="border" align="center" ></td>
//                             <td class="border" align="center"></td>
//                        </tr>
//                 </table>
//             </td>
//         </tr>
//     </table>
// </div>`;
// };
