const { PDFDocument } = require("pdf-lib");
const pdfData = require("./pdf.model");
const templateConfig = require("./template.json");

const fs = require("fs");
const path = require("path");
const file = "pdfeditable.pdf";

const createPDF = async () => {
  const filePath = path.normalize(path.join(__dirname, file));
  const formPdfBytes = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(formPdfBytes);
  const form = pdfDoc.getForm();

  let [detailData, headerData] = await Promise.all([pdfData.getDetail(5), pdfData.getHeader(5)]);

  const receiverId = headerData.idreceptor;
  const senderId = headerData.idemisor;

  let receiverData,
    senderData = null;
  if (receiverId && senderId) {
    [receiverData, senderData] = await Promise.all([
      pdfData.getReceiver(receiverId),
      pdfData.getSender(senderId),
    ]);
  }
  const fields = getAcroForm(form);

  setData(templateConfig.estructura.datos.encabezado, form, headerData, fields);
  setData(templateConfig.estructura.datos.emisor, form, senderData, fields);
  setData(templateConfig.estructura.datos.receptor, form, receiverData, fields);
  setData(templateConfig.estructura.datos.resumen, form, headerData, fields);
  // setDetail(templateConfig.estructura.datos.detalle, form, detailData, pdfDoc.getPages());

  flatAcroForm(fields);
  const pdfBytes = await pdfDoc.save();
  writeFile(pdfBytes, headerData.consecutivo);

  return pdfBytes;
};

const flatAcroForm = (fields) => {
  fields.forEach((field) => {
    field.enableReadOnly();
  });
};

const writeFile = (pdfBytes, name) => {
  const newFileName = `${name}_${new Date().getMilliseconds()}.pdf`;

  fs.writeFileSync(`./${newFileName}`, pdfBytes);
};

const getAcroForm = (form) => {
  const validTypes = ["PDFTextField"];
  const fields = form.getFields();
  const detailFields = [];
  let fieldList = [];
  fields.forEach((field) => {
    if (field && validTypes.includes(field.constructor.name)) {
      if (field.getName().toString().startsWith("l1")) {
        detailFields.push(field);
      } else {
        fieldList.push(field);
      }
    }
    console.log(field.getName());
  });
  return fieldList;
};

const setData = (struct, form, data, fields) => {
  for (const key in struct) {
    if (struct.hasOwnProperty(key)) {
      const element = struct[key];
      let field = form.getTextField(element);
      let value = data[element] || "";
      field.setText(value.toString());
    }
  }
};

const setDetail = (struct, form, data, pages) => {
  let x = 28;
  let y = 470;
  for (const value of data) {
    console.log(value);
    pages[0].drawText(value.codigo.toString(), { x: x + 20, y: y, size: 9 });
    // pages[0].drawText(value.cantidad.toString(), { x : x+100, y: y, size: 9 });
    // pages[0].drawText(value.detalle.toString(), { x: x, y: y+450, size: 9 });
    // pages[0].drawText(value.precio_unitario.toString(), { x: x+1500, y: y, size: 9 });
    // // pages[0].drawText("descuento", { x: x, y: y, size: 9 });
    // pages[0].drawText(value.sub_total.toString(), { x: x, y: y, size: 9 });
    // // pages[0].drawText("impuesto", { x: x, y: y, size: 9 });
    // pages[0].drawText(value.sub_total.toString(), { x: x, y: y, size: 9 });
  }
  // for (const key in struct) {
  //   if (struct.hasOwnProperty(key)) {
  //     const element = struct[key];
  //     let field = form.getTextField(element);
  //     let value = data[element] || "";
  //     field.setText(value.toString());
  //   }
  // }
  // pages[0].drawText("You can modify PDFs too!");
  // const field = form.getTextField("cod_p1");
  // const widgets = field.acroField.getWidgets();
  // widgets.forEach((w) => {
  //   const rect = w.getRectangle();
  //   console.log(rect);
  // });
};

exports.createPDF = createPDF;
