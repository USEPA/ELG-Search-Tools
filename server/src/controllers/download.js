const utilities = require('./utilities');

const Crypto = require("crypto");
const Excel = require('exceljs');

function addHeaderRow(worksheet, rowNum, headerRow) {
  let row = worksheet.addRow([]);
  worksheet.getCell(rowNum, 1).value = {
    richText: [
      {font: {bold: true}, text: headerRow.label + ': '},
      {text: headerRow.value}
    ]
  };
  worksheet.mergeCells(rowNum, 1, rowNum, worksheet.columns.length);
  row.commit();
}

function setColumns(dataColumns) {
  return dataColumns.map(function (column) {
    return {
      key: column.key,
      width: (column.width ? column.width : 20)
    }
  })
}

function setColumnAlignment(worksheet, column) {
  if (column.wrapText) {
    worksheet.getColumn(column.key).alignment = { wrapText: true };
  }
}

function getCellValue(dataRow, column) {
  let cellValue = dataRow[column.key];
  if (typeof (cellValue) === 'string') {
    cellValue = cellValue.replace(/<strong><u>and<\/u><\/strong>/ig, 'AND');
    if (cellValue.length > 32000) {
      cellValue = 'Please use interface to view ' + column.label + '.';
    }
  }
  return cellValue;
}

function initializeWorkbook(res, worksheetName, headerRows, dataColumns, fileName) {
  const fileId = Crypto.randomBytes(16).toString("hex");

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=' + fileName + '-' + fileId + '.xlsx');

  const workbook = new Excel.stream.xlsx.WorkbookWriter({stream: res, useStyles: true});

  let worksheet = workbook.addWorksheet(worksheetName);
  worksheet.state = 'visible';

  worksheet.columns = setColumns(dataColumns);

  let rowNum = 0;
  if (headerRows.length > 0) {
    headerRows.forEach(function (headerRow) {
      rowNum++;
      addHeaderRow(worksheet, rowNum, headerRow);
    });
    rowNum++;
    worksheet.addRow([]).commit();
  }

  rowNum++;
  let dataHeaderRow = worksheet.addRow(dataColumns.map(function (column) {
    return column.label
  }));
  dataHeaderRow.font = { bold: true }
  dataHeaderRow.commit();

  dataColumns.forEach ((column) => setColumnAlignment(worksheet, column));

  return workbook;
}

module.exports = {
  createDownloadFile(fileName, worksheetName, dataColumns, headerRows, data, res) {
    try {
      const workbook = initializeWorkbook(res, worksheetName, headerRows, dataColumns, fileName);
      const worksheet = workbook.getWorksheet(worksheetName);

      data.forEach(function (dataRow) {
        let row = worksheet.addRow(dataColumns.map((column) => getCellValue(dataRow, column)));
        row.commit();
      });
      worksheet.commit();

      workbook.commit()
        .then(function () {
            res.end();
          },
          function (err) {
            res.status(400).send("Error! " + utilities.sanitizeError(err));
          });
    }
    catch (err) {
      console.log(err);
      res.status(400).send("Error! " + utilities.sanitizeError(err));
    }
  },
  createDownloadFileFromStream(fileName, worksheetName, dataColumns, headerRows, dataStream, res) {
    try {
      const workbook = initializeWorkbook(res, worksheetName, headerRows, dataColumns, fileName);
      const worksheet = workbook.getWorksheet(worksheetName);

      if (dataStream !== null) {
        dataStream.on('data', (rows) => {
          rows.forEach(function (dataRow) {
            let row = worksheet.addRow(dataColumns.map((column) => getCellValue(dataRow, column)));
            row.commit();
          });
        });
        dataStream.on('end', () => {
          worksheet.commit();

          workbook.commit()
            .then(function () {
                res.end();
              },
              function (err) {
                res.status(400).send("Error! " + utilities.sanitizeError(err));
              });
        });
      }
      else {
        worksheet.commit();

        workbook.commit()
          .then(function () {
              res.end();
            },
            function (err) {
              res.status(400).send("Error! " + utilities.sanitizeError(err));
            });
      }
    }
    catch (err) {
      console.log(err);
      res.status(400).send("Error! " + utilities.sanitizeError(err));
    }
  }
}
