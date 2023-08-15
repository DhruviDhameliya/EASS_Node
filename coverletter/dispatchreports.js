let moment = require("moment");
module.exports = ({ settingdata, user_data, result, data }, imageAsBase64) => {
  console.log(data, result, "datatatatat");
  const get = (a) => {
    let certificate = "";
    {
      a
        ? a.split(",").map((k, index) => {
            certificate = certificate + ` <div> ${index + 1}. ${k}</div>`;
          })
        : "";
    }
    return certificate;
  };

  const getApplicants = (a, p) => {
    let name = "";
    let prefix = p ? p.split(",") : [];
    {
      a
        ? a.split(",").map((k, index) => {
            name = name + `<p>${index + 1}. ${prefix[index]} ${k}</p>`;
          })
        : "";
    }
    return name;
  };

  const getsupporting = (a) => {
    let supporting = "";
    {
      a.split(",").map((k, index) => {
        supporting = supporting + ` <div> ${index + 1}. ${k}</div>`;
      });
    }
    return supporting;
  };

  const getrow = () => {
    let rows = "";
    {
      result &&
        result.map((result, u) => {
          rows =
            rows +
            `<tr >
            <td class="p-2"> ${u + 1}.</td>
                    <td class="p-2">
                        <div class="block my-2" style='font-size:18px'>
                                    ${` ${result.c_prefix} ${result.c_name}`}
                                 
                                &emsp; &emsp;
                                <span style='font-size:9px'>
                                ${result.tracking_id}
                                </span>
                                </div>
                                <div class="block my-2" style='font-size:18px'> <label className="label">
                                Address:
                              </label>
                              
                              ${` ${result.d_address ? result.d_address : ""}`}
                               </div>
                                <div class="block my-2" style='font-size:18px'>
                                  
                                    <label className="label">
                                      Mobile no:
                                    </label>
                                
                                  ${` ${result.c_mo_no}`}
            
                 </div>   
                          </td>
                          <td class="" align="center">
                          ${get(result.a_certificate_name)}
                          </td>
                          <td  align="center"> 
                          <div class="sFont" >${get(result.supporting_doc_name)}
                          </div>
                          </td>
                          <td  align="center">
                          <div class="sFont">
                          ${get(
                            result.c_s_type == 8 ? "" : result.extra_doc_name
                          )}
                          </div>
                            </td>
                        </tr>`;
        });
    }

    return rows;
  };

  return `
     <html>
     <head>
        <style>
        // @import url('../../fonts/Poppins-ExtraLight.ttf');
        // *{
        //   font-size: 14px;
        //   font-family: "Poppins", sans-serif;
        // }
        //     html {
        //       zoom: 0.60;
        //     }
        //    .card{
        //       background: #fff;
        //       margin:50px;
        //     }
        //     /* h2{
        //      float: right;
        //      }*/
        //     table.desc-table {
        //       width: 100%;
        //     }
        //     th,td{
        //       padding: 3px;
        //     }
        //     table.desc-table tbody {
        //       vertical-align: top !important;
        //     }
        //     tr.billtorow {
        //       background: #8080803b;
        //     }
        //     tr.heading-row {
        //       background: #dfdfdf;
        //     }
        //     .footer{
        //       padding-top:10px ;  
        //       width: 70%;
        //       display: inline-block;
        //     }
        //     .footer p{
        //       font-weight: 600;
        //     }
        //     .flex{
            
        //       display: flex;
        //     }
        //     .tbl{
        //       width:  100%;
        //     }
        //     .bold{
        //       font-weight: 600;
        //     }
        //     .sig{
        //       height: 120px;
        //     }
        //     .details_table{
        //       width:  100%;
        //     }
            
        //     .details_table,td{
        //       border: 1px solid #ddd;
        //       padding: 6px;
        //     }
        //     .desc-table b{
        //         margin-left: 70px;
        //     }
        //     .block_supply{
        //       top: 150px;
        //       position: absolute;
        //     }
        //     .block_supply2{
        //       top: 170px;
        //       position: absolute;
        //     }
        //     .total_class{
        //       display: flex;
        //       padding: 0 10px;
        //       justify-content: space-between;
        //     }
        //     .tdmargin{
        //       padding-left: 4px;
        //     }
        //     .tdmarginalign{
        //       padding-right: 4px;
        //       text-align: end;
        //     }
        //     .signarureclass{
        //       text-align: center;
        //       margin-bottom: 0;
        //       font-weight: bold;
        //     }   
        //     .label {
        //       display: inline-block;
        //       width: 110px;
        //     }
        //     .float_right
        //     {
        //       float:right;
        //     }
        @import url('../fonts/Poppins-ExtraLight.ttf');
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
            .sFont{
              font-size:4px !important;
            }
        </style>
     </head>
     </html>
     <div class="card">
     <div style=" padding: 5px 10px; font-size: 10px">${moment().format(
       "DD-MM-YYYY HH:mm:ss"
     )}</div>
     <table class="details_table" border="1" style="border-collapse: collapse;margin-bottom:0px !important">
     <tr >
     <td colspan="8" style="padding:5px">
     <div class="flex"> 
         <div class="mx-2" style="width:80%"> 
           <div class="flex space-between" style="width:100%">
             <div>
               <h3 class="bold">
              ${settingdata.c_name}
              </h3>
            </div>
          </div>
         
        </div>
    </div>
      </td>
    </tr>
          <tr >
          <td style=" border-right: 0;">
              <h3 className="m-3" style="margin-bottom : 0px;">
                    <b>${
                      data.c_s_type == 8
                        ? "Visa "
                        : data.c_s_type == 10
                        ? "Attestation "
                        : data.c_s_type == 17
                        ? "Apostille "
                        : data.c_s_type == 20
                        ? "Translation "
                        : "All "
                    }  ${
    data.status === 24 ? "Dispatched" : "Dispatching"
  } Letter</b>
              </h3>
</td>
<td style=" border-left: 0;" align="right">
              <div>
                      Date : <span>${data.c_date}</span>
              </div>
          </td>
          </tr>
            <tr style="padding: 0px;">
                <td colspan= "2" style="padding: 0px;">
                <table border="1" class="" align="center" style="width:100%;border-collapse: collapse;">
                <tr  class="heading-row">
                    <td style=" border-right: 0;">#</td>
                    <th class=""> Address for Dispatch</th>
                    <th class="" width="10%" align="center"> Docs / country</th>
                    <th class="" width="10%" align="center"> Support Docs</th>
                    <th class="" width="10%" align="center"> Extra Docs </th>
                </tr>
                        ${getrow()}
                </table>
            </td>
        </tr>
    </table> 
</div>`;
};
