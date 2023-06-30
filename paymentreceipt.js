var converter = require("number-to-words");
const paths = require("path");

module.exports = (
  { data, settingdata, userdata, user },
  imageAsBase64,
  signatureAsBase64
) => {
  const today = new Date();

  return `
   <html>
    <head>
      <style>
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
      .fsize{
        font-size:11px !important;
      }
      .details_table{
        width:  100%;
        border: 1px solid #d8dbe0;
        border-collapse: collapse;
        padding:10px;
      }
          h2{
            float: right;
          }
          table.desc-table {
            width: 100%;
          }
          th,td{
            padding: 3px;
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
          .tbl{
            width:  100%;
          }
          .bold{
            font-weight: 600;
          }
          .sig{
            height: 120px;
          }
          
          
          .details_table,td{
            border: 1px solid #000;
            padding: 6px;
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
          .img_center{
            margin: auto;
            display: block;
          }
      </style>
   </head>
   </html>
   <div class="card">
   <table class="details_table" border="1" style="border-collapse: collapse;margin-bottom:0px !important">
            <tr class="border">
            <td colspan="8" align="center">
            <h4 style="margin:10px 0"><b>PAYMENT RECEIPT</b></h4>
            </td>
            </tr>
            <tr style="width:100% ;" >
      <td colspan="8" style="padding:20px;">
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
                  <label class="fsize">Branch :</label> ${data.cbname}
                </div>
              </div>
              <div style="word-break: break-word;" class="fsize">
                  ${settingdata.address != null ? settingdata.address : ""}
              </div>
              ${
                data.c_tax &&
                data.c_tax == 1 &&
                data.f_z_type &&
                data.f_z_type != 2
                  ? `<div class="fsize">
                    <label class="fsize">GST No : </label>
                    ${settingdata.c_gstno}
                  </div>`
                  : ``
              }
              ${
                data.c_tax &&
                data.c_tax == 1 &&
                data.f_z_type &&
                data.f_z_type != 2
                  ? `<div class="fsize">
                  <label class="fsize">State Name : </label> ${settingdata.state_name}, 
                  <label class="fsize">Code : </label> ${settingdata.TIN_number}
                  </div>`
                  : ``
              }
              ${
                userdata.mobile != null
                  ? `<div class="fsize">
                    <label class="fsize">Contact No : </label>
                    ${userdata.mobile}
                  </div>`
                  : ``
              }
              ${
                userdata.u_email != null
                  ? `<div class="fsize">
                    <label class="fsize">Email : </label>
                    ${userdata.u_email} 
                    <label class="fsize">Website : </label>
                    <a href='${settingdata.website_url}'>${settingdata.website_url}</a>
                  </div>`
                  : ``
              }
            </div>
        </div>
      </td>
    </tr>
            <tr class="border heading-row">
            <td style="padding:15px">
                <b>Invoice No. :</b> ${data.invoice_no}<br />
                <b>Receipt No. :</b> ${data.p_receipt_no}<br />
                
                ${
                  data.mode_id != 160
                    ? `
                    <b>Bank Name :</b> ${
                      data.bank_name != "null" && data.bank_name != null
                        ? data.bank_name
                        : ""
                    }<br />
                    <b>${
                      data.mode_id == 162
                        ? "Credit Card No."
                        : data.mode_id == 163
                        ? "Cheque No."
                        : data.mode_id == 164
                        ? "DD No."
                        : data.mode_id == 165
                        ? "Online Transfer No."
                        : data.mode_id == 166
                        ? "Paypal No."
                        : data.mode_id == 167
                        ? "TDS No."
                        : data.mode_id == 168
                        ? "Transfer By ATM No."
                        : data.mode_id == 169
                        ? "Western Union No."
                        : data.mode_id == 170
                        ? "Paytm No."
                        : data.mode_id == 171
                        ? "Cash Deposit In Branch No."
                        : data.mode_id == 175
                        ? "Additional Qualification Certificate No."
                        : data.mode_id == 176
                        ? "Address Proof No."
                        : "Transaction Id"
                    } :</b> ${
                        data.chk_dd_no != "null" && data.chk_dd_no != null
                          ? data.chk_dd_no
                          : ""
                      }<br />
                      <b>${
                        data.mode_id == 162
                          ? "Credit Card"
                          : data.mode_id == 163
                          ? "Cheque"
                          : data.mode_id == 164
                          ? "DD"
                          : data.mode_id == 165
                          ? "Online Transfer"
                          : data.mode_id == 166
                          ? "Paypal"
                          : data.mode_id == 167
                          ? "TDS"
                          : data.mode_id == 168
                          ? "Transfer By ATM"
                          : data.mode_id == 169
                          ? "Western Union"
                          : data.mode_id == 170
                          ? "Paytm"
                          : data.mode_id == 171
                          ? "Cash Deposit In Branch"
                          : data.mode_id == 175
                          ? "Additional Qualification Certificate"
                          : data.mode_id == 176
                          ? "Address Proof"
                          : "Transaction Id"
                      } Date :</b> ${
                        data.chk_dd_date != "null" && data.chk_dd_date != null
                          ? data.chk_dd_date
                          : ""
                      }
                `
                    : ""
                }
            </td>
            <td class="right" style="padding:15px">
            <b>Name :</b> ${data.c_prefix}${data.c_name}<br />
            ${
              data.c_tax &&
              data.c_tax == 1 &&
              data.f_z_type &&
              data.f_z_type != 2
                ? `<b>GST No :</b> ${data.c_gst_no}<br />`
                : ""
            }
            ${
              data.c_tax &&
              data.c_tax == 1 &&
              data.f_z_type &&
              data.f_z_type != 2
                ? `<b>State Name : </b> ${data.state}, <b>Code : </b> ${data.TIN_number}<br />`
                : ""
            }
            <b>Mobile No :</b> ${data.c_mo_no}<br />
            <b>Email :</b> ${data.c_email}<br/>
           <b>Payment Date :</b> ${data.payment_date}<br />
           
        </td>
            </tr>
            <tr class="border heading-row">
            <td class="right" style="padding:15px">
                <b>Amount</b>
            </td>
            <td style="padding:15px">
                ${data.receive_amt}
            </td>
            </tr>
            <tr class="border heading-row">
                <td class="right" style="padding:15px">
                    <b>Payment Mode</b>
                </td>
                <td style="padding:15px">
                    ${data.payment_mode}
                </td>
            </tr>
            <tr class="border">
              <td class="right" style=" width:50%; wordBreak:break-word;padding:15px">
              <div>
              <b>Terms & Conditions :-</b><br />
              ${
                settingdata.c_term_condition != null
                  ? settingdata.c_term_condition
                  : ""
              }
              </div>
             
              </td>
              <td>
                <div class="sig">
                  <p class="signarureclass">For ${settingdata.c_name},</p>
                  <!---<p class="signarureclass">For ${data.cname}</p>---!>
                  <img
                  src=${`data:image/jpg;base64,${signatureAsBase64}`}
                    alt="img"
                    width="150"
                    class="img_center"
                  />
                  </div>
                  <p class="signarureclass">Authorized Signature</p>
                </td>
            </tr>
        </table> 
    </div>`;
};
