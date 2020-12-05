const { PDFDocument } = require("pdf-lib");
const pdfData = require("./pdf.model");
const templateConfig = require("./template.json");

const fs = require("fs");
const path = require("path");
const file = templateConfig.nombre_archivo;

const createPDF = async (id) => {
  const filePath = path.normalize(path.join(__dirname, file));
  const formPdfBytes = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(formPdfBytes);
  const form = pdfDoc.getForm();

  let [detailData, headerData] = await Promise.all([pdfData.getDetail(id), pdfData.getHeader(id)]);

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

  setData(templateConfig.estructura.datos.encabezado, form, headerData);
  setData(templateConfig.estructura.datos.emisor, form, senderData);
  setData(templateConfig.estructura.datos.receptor, form, receiverData);
  setData(templateConfig.estructura.datos.resumen, form, headerData);
  setDetail(templateConfig.estructura.datos.detalle, form, detailData);

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
  let fieldList = [];
  fields.forEach((field) => {
    if (field && validTypes.includes(field.constructor.name)) {
      fieldList.push(field);
    }
  });
  return fieldList;
};

const setData = (struct, form, data) => {
  for (const key in struct) {
    if (struct.hasOwnProperty(key)) {
      const element = struct[key];
      let field = form.getTextField(element);
      let value = data[element] || "";
      field.setText(value.toString());
    }
  }
};

const setDetail = (struct, form, data) => {
  for (let rowNumber = 0; rowNumber < data.length; rowNumber++) {
    const element = struct[rowNumber];
    for (const key in element) {
      if (element.hasOwnProperty(key)) {
        const propertyName = element[key];
        const field = form.getTextField(key);
        const row = data[rowNumber];
        const value = row[propertyName] || "";
        field.setText(value.toString().trim());
      }
    }
  }
};

exports.createPDF = createPDF;
