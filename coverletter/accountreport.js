module.exports = (
  { settingdata, user_data, receive, refund },
  imageAsBase64
) => {
  let receiveTotal = 0;
  let refundTotal = 0;
  const getrow = () => {
    let rows = "";

    if (receive.length > refund.length) {
      receive.map((receive, index) => {
        (receiveTotal = receiveTotal + parseInt(receive.receive_amt)),
          (refundTotal =
            refundTotal +
            parseInt(
              refund.length > 0 && refund[index].payment_refund
                ? refund[index].payment_refund
                : 0
            ));
        rows =
          rows +
          `<tr>
                  <td class="">
                      ${receive.payment_date}
                  </td>
                  <td class="p-2">
                      <div>
                          ${receive.c_prefix} ${receive.c_name}
                          <b>(${receive.invoice_no})</b>
                      </div>
                  </td>
                  <td class="" align="center">
                      ${receive.receive_amt}
                  </td>
                  <td class="">
                  ${refund[index] ? refund[index].payment_date : ""}
              </td>
              <td class="p-2">
              ${
                refund[index]
                  ? `<div>
                      ${refund && refund[index].c_prefix} ${
                      refund && refund[index].c_name
                    }
                      <b>(${refund && refund[index].p_receipt_no})</b>
                  </div>`
                  : ""
              }
              </td>
              <td class="" align="center">
                  ${refund[index] ? refund[index].payment_refund : ""}
              </td>       
          </tr>`;
      });
    } else {
      refund.map((refund, index) => {
        (receiveTotal =
          receiveTotal +
          parseInt(
            receive[index].receive_amt ? receive[index].receive_amt : 0
          )),
          (refundTotal = refundTotal + parseInt(refund.payment_refund));
        rows =
          rows +
          `<tr>
                      <td class="">
                         ${receive[index] ? receive[index].payment_date : ""}
                      </td>
                      <td class="p-2">
                      ${
                        receive[index]
                          ? `<div>
                          ${receive[index] ? receive[index].c_prefix : ""} ${
                              receive[index] ? receive[index].c_name : ""
                            }
                                          <b>(${
                                            receive[index]
                                              ? receive[index].invoice_no
                                              : ""
                                          })</b>
                             
                          </div>`
                          : ""
                      }
                      </td>
                      <td class="" align="center">
                           ${receive[index] ? receive[index].receive_amt : ""}
                      </td>
                      <td class="">
                      ${refund.payment_date}
                  </td>
                  <td class="p-2">
                      <div>
                      ${refund.c_prefix} ${refund.c_name}
                      <b>(${refund.p_receipt_no})</b>
                      </div>
                  </td>
                  <td class="" align="center">
                      ${refund.payment_refund}
                  </td>       
              </tr> `;
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
            /* h2{
             float: right;
             }*/
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
              background: #dfdfdf;
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
            
              display: flex;
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
            .details_table{
              width:  100%;
            }
            
            .details_table,td{
              border: 1px solid #ddd;
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
        </style>
     </head>
     </html>
     <div class="card">
        <table class="details_table">
          
            <tr>
                <td >
                    <h2>${settingdata.c_name}</h2>
                    <span>
                    ${settingdata.address != null ? settingdata.address : ""}
                    ${
                      user_data.mobile != null
                        ? `<b>Contact No :</b>${user_data.mobile}`
                        : ``
                    }  <br />
                    ${
                      user_data.mobile != null
                        ? `<b>Email :</b>${user_data.u_email}`
                        : ``
                    }
                    <br />
                </td>
                <td >
                <div style="text-align:right;"><img width="200px" src=${`data:image/jpg;base64,${imageAsBase64}`} alt="fed"></div>
                </td>
               
                   
              
            </tr>
      
            <tr class="">
            <td colspan="8" align="center"><b>Client Account Report</b></td>
        </tr>
            <tr style="padding: 0px;">
                <td colspan= "2" style="padding: 0px;">
                    <table class="" align="center" style="width:100%">
                        <tr  class="heading-row">
                            <th class="" width="15%" align="center"> Date </th>
                            <th class="" > Particulars </th>
                            <th class="" width="10%" align="center"> Credit</th>
                            <th class="" width="15%" align="center"> Date</th>
                            <th class=""> Particulars </th>
                            <th class="" width="10%" align="center"> Debit</th>
                        </tr>
                        ${getrow()}
                        <tr>
                          <td class=""></td>
                          <td class="" align="right">
                            Total
                          </td>
                          <td class="" align="center">
                            ${receiveTotal}
                          </td>
                          <td class=""></td>
                          <td class="" align="right">
                            Total
                          </td>
                          <td class="" align="center">
                           ${refundTotal}
                          </td>
                        </tr>
                       
                </table>
            </td>
        </tr>
    </table> 
</div>`;
};
