var converter = require("number-to-words");
const paths = require("path");

module.exports = ({ commission_data, data }) => {
  const getRows = () => {
    let rows = "";
    {
      commission_data
        ? commission_data.map((commission, index) => {
          rows =
            rows +
            `
        <tbody>
        <tr class="border heading-row">
                  <td class="right" align="center" style="padding: 15px">
                    ${parseInt(index + 1)}
                  </td>
                  <td class="right" align="center" style="padding: 15px">
                    ${commission.c_prefix} ${commission.c_name}
                  </td>
                  <td class="right" align="center" style="padding: 15px">
                    ${commission.tracking_id}
                  </td>
                  <td class="right" align="center" style="padding: 15px">
                    ${commission.commision_date}
                  </td>
                  <td class="right" align="center" style="padding: 15px">
                    ${commission.c_amount}
                  </td>
                </tr> 
                </tbody>`;
        })
        : "";
    }

    return rows;
  };

  return `
  <html>
  <head>
    <style>
      @import url("../fonts/Poppins-ExtraLight.ttf");
      * {
        font-size: 14px;
        font-family: "Poppins", sans-serif;
      }
      html {
        zoom: 0.6;
      }
      .card {
        background: #fff;
        margin: 50px;
      }
      h3,
      .h3 {
        font-size: 1.75rem;
      }
      h5,
      .h5 {
        font-size: 1.25rem;
      }
      .flex {
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
      .space-between {
        -webkit-box-pack: justify;
        -ms-flex-pack: justify;
        justify-content: space-between;
      }
      .flex-start {
        -webkit-box-pack: start;
        -ms-flex-pack: start;
        justify-content: flex-start;
      }
      .fsize {
        font-size: 11px !important;
      }
      .details_table {
        width: 100%;
        border: 1px solid #d8dbe0;
        border-collapse: collapse;
        padding: 10px;
      }
      h2 {
        float: right;
      }
      table.desc-table {
        width: 100%;
      }
      th,
      td {
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
      .footer {
        padding-top: 10px;
        width: 70%;
        display: inline-block;
      }
      .footer p {
        font-weight: 600;
      }
      .tbl {
        width: 100%;
      }
      .bold {
        font-weight: 600;
      }
      .sig {
        height: 120px;
      }

      .details_table,
      td {
        border: 1px solid #000;
        padding: 6px;
      }
      .desc-table b {
        margin-left: 70px;
      }
      .block_supply {
        top: 150px;
        position: absolute;
      }
      .block_supply2 {
        top: 170px;
        position: absolute;
      }
      .total_class {
        display: flex;
        padding: 0 10px;
        justify-content: space-between;
      }
      .tdmargin {
        padding-left: 4px;
      }
      .tdmarginalign {
        padding-right: 4px;
        text-align: end;
      }
      .signarureclass {
        text-align: center;
        margin-bottom: 0;
        font-weight: bold;
      }
      .label {
        display: inline-block;
        width: 110px;
      }
      .float_right {
        float: right;
      }
      .img_center {
        margin: auto;
        display: block;
      }
    </style>
  </head>
  <body>
    <div class="card">
        <table
        class="details_table"
        style="border-collapse: collapse; margin-bottom: 0px !important"
        >
        <tr class="border">
                <td colspan="6" align="center">
                <h4 style="margin: 10px 0"><b>Commission Details of ${data.name
    }</b></h4>
                </td>
            </tr>
            <tr class="border">
                <td colspan="3" style="padding: 15px">
                <b>Total : ${data.c_amount}</b> <br />
                <b>Payment By : ${data.name}</b> <br />
                </td>
                <td colspan="3" class="right" style="padding: 15px">
                <b>Payout Date : ${data.payment_date}</b> <br />
                <b>Particulars : ${data.payment_desc}</b><br />
                </td>
            </tr>
            <tr class="border heading-row">
                <td class="right" align="center" style="padding: 15px">No.</td>
                <td class="right" align="center" style="padding: 15px">Customer Name</td>
                <td class="right" align="center" style="padding: 15px">Tracking Id</td>
                <td class="right" align="center" style="padding: 15px">Payment date</td>
                <td class="right" align="center" style="padding: 15px">Amount</td>
            </tr>
            ${getRows()}
            
        </table> 
    </div>
    </body>
    </html>`;
};
