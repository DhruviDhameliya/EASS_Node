var converter = require("number-to-words");
const paths = require("path");

module.exports = (
  { settingdata, customerdata, paymentres, list },
  userdata,
  b_state_id,
  generalsetting,
  convertdata,
  imageAsBase64,
  signatureAsBase64
) => {
  console.log(
    { settingdata, customerdata, paymentres, list },
    userdata,
    b_state_id,
    generalsetting,
    convertdata,
    "************************"
  );
  const convertamt = (amount) => {
    if (convertdata.amount != undefined) {
      const amt = isNaN(amount / convertdata.amount)
        ? amount
        : amount / convertdata.amount;
      return +Number(amt).toFixed(2);
    } else {
      return +Number(amount).toFixed(2);
    }
  };
  const today = new Date();
  const getrow = () => {
    let rows = "";
    if (customerdata.c_s_type == 10) {
      list &&
        list.map((adata, index) => {
          let cerficates = "";
          adata.cerficates != null &&
            adata.cerficates.split(",").map((a) => {
              cerficates = cerficates + `${a}<br />`;
            });
          rows =
            rows +
            `<tr class="heading-row">
          <td class="tdmargin">${index + 1}</td>
          <td class="tdmargin">
            <b>
            ${adata.a_prefix} ${adata.a_name} (${adata.country_name != null ? adata.country_name : ""
            })
            </b>
            <br/>
            <div>${cerficates}</div>
          </td>
          <td class="tdmargin">${adata.attestation_type}</td>
          <td class="tdmargin">${settingdata.hsn_code}</td>
          <td class="tdmarginalign">${adata.a_certificate.split(",").length
            }</td>
          <td class="tdmarginalign">${convertamt(adata.amount)}</td>
        
          <td class="tdmarginalign">${convertamt(adata.amount) * adata.a_certificate.split(",").length
            }</td>
        </tr>`;
        });
    } else if (customerdata.c_s_type == 8) {
      list &&
        list.map((vdata, index) => {
          let cerficates = "";
          vdata.v_supporting_doc != null &&
            vdata.v_supporting_doc.split(",").map((a) => {
              cerficates = cerficates + `${a}<br />`;
            });
          rows =
            rows +
            `<tr class="heading-row">
               <td class="tdmargin">${index + 1}</td>
               <td class="tdmargin">
               <b>${vdata.v_prefix} ${vdata.v_name} 
               (${vdata.v_passport != null ? vdata.v_passport : ""})
               </b>
               <br/>
               <div>${cerficates}</div>
               </td>
               <td class="tdmargin">${vdata.v_country != null ? vdata.v_country : ""
            } / ${vdata.visa_type}</td>
               <td class="tdmargin">${settingdata.hsn_code}</td>
               <td class="tdmarginalign">1</td>
               <td class="tdmarginalign">${convertamt(vdata.amount)}</td>
               
               <td class="tdmarginalign">${convertamt(vdata.amount)}</td>
             </tr>`;
        });
    } else if (customerdata.c_s_type == 17) {
      list &&
        list.map((adata, index) => {
          let cerficates = "";
          adata.cerficates != null &&
            adata.cerficates.split(",").map((a) => {
              cerficates = cerficates + `${a}<br />`;
            });
          rows =
            rows +
            `<tr class="heading-row">
          <td class="tdmargin">${index + 1}</td>
          <td class="tdmargin"><b>${adata.a_prefix} ${adata.a_name} (${adata.country_name != null ? adata.country_name : ""
            })</b><br/>
            ${cerficates}</td>
          <td class="tdmargin">${adata.apostille_type}</td>
          <td class="tdmargin">${settingdata.hsn_code}</td>
          <td class="tdmarginalign">${adata.a_certificate.split(",").length
            }</td>
          <td class="tdmarginalign">${convertamt(adata.amount)}</td>
         
          <td class="tdmarginalign">${convertamt(adata.amount) * adata.a_certificate.split(",").length
            }</td>
        </tr>`;
        });
    } else if (customerdata.c_s_type == 20) {
      list &&
        list.map((adata, index) => {
          let cerficates = "";
          adata.cerficates != null &&
            adata.cerficates.split(",").map((a) => {
              cerficates = cerficates + `${a}<br />`;
            });
          rows =
            rows +
            `<tr class="heading-row">
          <td class="tdmargin">${index + 1}</td>
          <td class="tdmargin"><b>${adata.a_prefix} ${adata.a_name} (${adata.country_name != null ? adata.country_name : ""
            })</b><br/>${cerficates}</td>
          <td class="tdmargin">${adata.translation_type}</td>
          <td class="tdmargin">${settingdata.hsn_code}</td>
          <td class="tdmarginalign">${adata.a_certificate.split(",").length
            }</td>
          <td class="tdmarginalign">${convertamt(adata.amount)}</td>
         
          <td class="tdmarginalign">${convertamt(adata.amount) * adata.a_certificate.split(",").length
            }</td>
        </tr>`;
        });
    }
    return rows;
  };

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
            align-items: center;
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
  <table class="details_table" border="1" style="border-collapse: collapse;margin-bottom:0px !important">
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
                  <label class="fsize">Branch :</label> ${customerdata.bname}
                </div>
              </div>
              <div style="word-break: break-word;" class="fsize">
                  ${settingdata.address != null ? settingdata.address : ""}
              </div>
              ${customerdata.c_tax && customerdata.c_tax == 1
      ? `<div class="fsize">
                    <label class="fsize">GST No : </label>
                    ${settingdata.c_gstno}
                  </div>`
      : ``
    }
              ${customerdata.c_tax && customerdata.c_tax == 1
      ? `<div class="fsize">
                  <label class="fsize">State Name : </label> ${settingdata.state_name ? settingdata.state_name : " "
      }, 
                  <label class="fsize">Code : </label> ${settingdata.TIN_number ? settingdata.TIN_number : ""
      }
                  </div>`
      : ``
    }
              ${userdata.mobile != null
      ? `<div class="fsize">
                    <label class="fsize">Contact No : </label>
                    ${userdata.mobile}
                  </div>`
      : ``
    }
              ${userdata.u_email != null
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

    <tr>
      <th colspan="8" align="center">
        <h5 class="bold" style="margin-bottom:2;margin-top:2;">${customerdata.c_tax == 1 ? "ORIGINAL TAX INVOICE" : "INVOICE"
    }</h5>
      </th>
    </tr>
      
    <tr style="lineHeight: 23px ">
      <td class="text-left" style="width:50% ; padding:6px ;wordBreak:break-word; vertical-align: top;" >
        <div class="block">
          <label><b>Invoice Date : </b></label> 
          ${customerdata.c_date}
        </div>
        <div class="block">
          <label><b>Invoice No. : </b></label> 
          ${paymentres.invoice_no}
        </div>
        
       
      </td>
      <td class="text-right" style="padding: 6px;width:50%; wordBreak:break-word ;vertical-align: top;">
        <div class="block">
          <label><b>Track Id : </b></label>
          ${customerdata.tracking_id}
        </div>
        <div class="block">
          <label><b>Apply For : </b></lable> 
          ${(() => {
      if (customerdata.c_s_type == 10) {
        return `Attestation`;
      } else if (customerdata.c_s_type == 8) {
        return `Visa`;
      } else if (customerdata.c_s_type == 20) {
        return `Translation`;
      } else {
        return `Apostille`;
      }
    })()}
        </div>
      </td>
    </tr>

    <tr>
      <td class="right" style="padding:6px ;width:50%;wordBreak:break-word; vertical-align: top;">
        <div style= "marginBottom: 3px">
          <b>Bill To</b>
        </div>
        ${customerdata.c_gst == 0
      ? `${customerdata.f_z_type == 1
        ? `<lable>Free Zone :</lable>`
        : `<lable>ARN No :</lable>`
      } ${customerdata.f_z_type == 1
        ? "Special Economic Zone"
        : customerdata.arn_no
      }`
      : ""
    }
        <div class="block">
          <label>Name :</lable> ${customerdata.c_prefix} ${customerdata.c_name}
        </div>
        ${customerdata.c_tax == 1 && customerdata.f_z_type != 2
      ? `<div class="block">
            <label>GST No : </label>${customerdata.c_gst_no}
          </div>`
      : `<div class="block">
            <label>Mobile No : </label>${customerdata.c_mo_no}
          </div>`
    }
        ${customerdata.c_tax == 1 && customerdata.f_z_type != 2
      ? `<div class="block">
            <label>State Name : </label>${customerdata.state ? customerdata.state : " "
      }, 
            <label>Code : </label>${customerdata.TIN_number ? customerdata.TIN_number : ""
      }
          </div>`
      : `<div class="block">
            <label>Email : </label>${customerdata.c_email}
          </div>`
    }
        <div class="block">
            <label>Address :</lable> <span style="word-break: break-word;
            white-space: pre-wrap;">${customerdata.c_address}</span></div>
      </td>
      <td class="right" style="padding:6px;width:50%;wordBreak:break-word; vertical-align: top;">
        <div style= "marginBottom: 3px">
          <b>Ship To</b>
        </div>
        <div class="block">
        <label>Name :</lable> ${customerdata.c_prefix} ${customerdata.c_name}
      </div>
      <div class="block">
      <label>Mobile No : </label>${customerdata.c_mo_no}
    </div>
    <div class="block">
    <label>Email : </label>${customerdata.c_email}
  </div>
  <div class="block">
  <label>Address :</lable><span style="word-break: break-word;
  white-space: pre-wrap;"> ${customerdata.d_address}</span></div>
      </td>
    </tr>
  </table>

<table class="details_table" border="1" style="border-collapse: collapse;  margin-top:0px !important">
    <tr class="blue-row">
      <th>
        <strong>#</strong>
      </th>
      <th>
        <strong>Name & Documents</strong>
      </th>
      ${(() => {
      if (customerdata.c_s_type == 10) {
        return `<th><strong>Type Of Attestation</strong></th>`;
      } else if (customerdata.c_s_type == 8) {
        return `<th><strong>Country / Visa Type</strong></th>`;
      } else if (customerdata.c_s_type == 20) {
        return `<th><strong>Type Of Translation</strong></th>`;
      } else {
        return `<th><strong>Type Of Apostille</strong></th>`;
      }
    })()}
      <th>
        <strong>HSN/SAC</strong>
      </th>
      <th class="tdmarginalign">
        <strong>Qty</strong>
      </th>
      <th class="tdmarginalign">
        <strong>Rate</strong>
      </th>
      <th class="tdmarginalign">
        <strong>Amount</strong>
      </th>
    </tr>
    ${getrow()}
    <tr>
      <td colspan="4" class="text-left" style="vertical-align: top;">
        <div>
          <b style= "text-transform: capitalize">
            Total In Words : ${converter.toWords(
      convertamt(paymentres.net_amt)
    )}
          </b>
          <br />
          <br />${(() => {
      if (customerdata.c_tax == 1) {
        return `<b>Bank Details :</b>
              ${settingdata.bank_details != null ? settingdata.bank_details : ""
          }`;
      } else {
        return "";
      }
    })()}
        </div>
      </td>
      <td colspan="4"  style="vertical-align: top;">
        <div class="block total_class" >
          <label>
            <b>SubTotal</b>
          </label>
          <span class="float_right" style="wordBreak:keep-all;">
            ${convertamt(paymentres.total_amount)}
          </span>
        </div>
        ${paymentres.exp_charge != 0
      ? `<div class="block total_class">
              <label ><b>Extra Charges</b></label>
              <span class="float_right" style="wordBreak:keep-all;">${convertamt(
        paymentres.exp_charge
      )}</span>
            </div>`
      : ""
    }
          ${paymentres.courier != 0
      ? `<div class="block total_class">
                <label ><b>Courier Charge</b></label>
                <span class="float_right" style="wordBreak:keep-all;">${convertamt(
        paymentres.courier
      )}</span>
              </div>`
      : ""
    }
          ${paymentres.dis_amt != 0
      ? `<div class="block total_class">
                <label ><b>Discount(-)</b></label>
                <span class="float_right" style="wordBreak:keep-all;">${convertamt(
        paymentres.dis_amt
      )}</span>
              </div>`
      : ""
    }
          ${paymentres.coupon_amt != 0
      ? `<div class="block total_class">
                <label ><b>Coupon Discount(-)</b></label>
                <span class="float_right" style="wordBreak:keep-all;">${convertamt(
        paymentres.coupon_amt
      )}</span>
              </div>`
      : ""
    }

          <div class="block total_class">
            <label>
              <b> Net Amount Before Tax</b>
            </label>
            <span class="float_right" style="wordBreak:keep-all;">
              ${convertamt(
      parseFloat(paymentres.total_amount) +
      parseFloat(paymentres.courier) +
      parseFloat(paymentres.exp_charge) -
      parseFloat(paymentres.dis_amt) -
      parseFloat(paymentres.coupon_amt)
    )}
            </span>
          </div>
          
          ${customerdata.c_tax == 1
      ? `
                ${b_state_id == paymentres.c_state
        ? `<div class="block total_class">
                    <label >
                    <b>CGST(${generalsetting.c_gst_pre})%(+)</b>
                    </label>
                    <span class="float_right" style="wordBreak:keep-all;">${+Number(
          convertamt(
            ((parseFloat(paymentres.total_amount) +
              parseFloat(paymentres.courier) +
              parseFloat(paymentres.exp_charge) -
              parseFloat(paymentres.dis_amt) -
              parseFloat(paymentres.coupon_amt)) *
              parseInt(generalsetting.c_gst_pre)) /
            100
          )
        ).toFixed(2)}</span>
                  </div>
                  <div class="block total_class">
                    <label >
                    <b>SGST(${generalsetting.s_gst_pre})%(+)</b>
                    </label>
                    <span class="float_right" style="wordBreak:keep-all;">${+Number(
          convertamt(
            ((parseFloat(paymentres.total_amount) +
              parseFloat(paymentres.courier) +
              parseFloat(paymentres.exp_charge) -
              parseFloat(paymentres.dis_amt) -
              parseFloat(paymentres.coupon_amt)) *
              parseInt(generalsetting.s_gst_pre)) /
            100
          )
        ).toFixed(2)}</span>
                  </div>`
        : `<div class="block total_class">
                    <label >
                    <b>IGST(${parseInt(generalsetting.c_gst_pre) +
        parseInt(generalsetting.s_gst_pre)
        })%(+)</b>
                    </label>
                    <span class="float_right" style="wordBreak:keep-all;">${+Number(
          convertamt(
            ((parseFloat(paymentres.total_amount) +
              parseFloat(paymentres.courier) +
              parseFloat(paymentres.exp_charge) -
              parseFloat(paymentres.dis_amt) -
              parseFloat(paymentres.coupon_amt)) *
              (parseInt(generalsetting.c_gst_pre) +
                parseInt(generalsetting.s_gst_pre))) /
            100
          )
        ).toFixed(2)}</span>
                  </div>
                  `
      }
          `
      : ""
    }
          ${customerdata.c_gst == 0 && customerdata.f_z_type != 0
      ? `<div class="block total_class">
              <label>
                <b>${customerdata.f_z_type == 1
        ? "SEZ - Foregone GST (-)"
        : `Overseas Payment - <br/>Foregone GST (-)`
      }</b>
              </label>
              <span class="float_right" style="wordBreak:keep-all;">
                ${convertamt(
        ((parseFloat(paymentres.total_amount) +
          parseFloat(paymentres.courier) +
          parseFloat(paymentres.exp_charge) -
          parseFloat(paymentres.dis_amt) -
          parseFloat(paymentres.coupon_amt)) *
          (parseInt(generalsetting.c_gst_pre) +
            parseInt(generalsetting.s_gst_pre))) /
        100
      )}
              </span>
            </div>
          `
      : ``
    }
          ${paymentres.embassy_fees != 0
      ? `<div class="block total_class">
          <label><b>Embassy Fees</b></label>
          <span class="float_right"  style="wordBreak:keep-all;">${convertamt(
        paymentres.embassy_fees
      )}</span>
        </div>
    `
      : ""
    }
            <div class="block total_class">
            <label>
              <b>
                Net Amount In ${convertdata.convert_type == 0
      ? "USD"
      : convertdata.convert_type == 1
        ? "PSD"
        : convertdata.convert_type == 2
          ? "Euro"
          : "INR"
    }
              </b>
            </label>
            <span class="float_right" style="wordBreak:keep-all;">${convertamt(
      paymentres.net_amt
    )}</span>
          </div>
        </td>
      </tr>
      <tr>
      <td class="right" colspan="4" style="width:65%; wordBreak:break-word;vertical-align: top;">
        <div>
          <h5 class="bold">Terms & Conditions :-</h5>
          <p class="fsize">${settingdata.c_term_condition != null
      ? settingdata.c_term_condition
      : ""
    }
            </p>
        </div>
      </td>
      <td colspan="4" style="vertical-align: top;">
        <div class="sig">
          <p class="signarureclass">For ${settingdata.c_name},</p>
         <!---<p class="signarurestaffclass">For ${customerdata.cname}</p> ---!>
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
