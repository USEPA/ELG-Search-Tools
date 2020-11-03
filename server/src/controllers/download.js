const utilities = require('./utilities');

const Crypto = require("crypto");
const Excel = require('exceljs');

module.exports = {
  createDownloadFile(fileName, worksheetName, dataColumns, headerRows, data, res) {
    try {
      const fileId = Crypto.randomBytes(16).toString("hex");

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=' + fileName + '-' + fileId + '.xlsx');

      const workbook = new Excel.stream.xlsx.WorkbookWriter({stream: res, useStyles: true});

      let worksheet = workbook.addWorksheet(worksheetName);
      worksheet.state = 'visible';

      worksheet.columns = dataColumns.map(function (column) {
        return {
          key: column.key,
          width: (column.width ? column.width : 20)
        }
      });

      let rowNum = 0;
      headerRows.forEach(function (headerRow) {
        rowNum++;
        let row = worksheet.addRow([]);
        worksheet.getCell(rowNum, 1).value = {
          richText: [
            {font: { bold: true}, text: headerRow.label + ': '},
            {text: headerRow.value}
          ]
        };
        worksheet.mergeCells(rowNum, 1, rowNum, worksheet.columns.length);
        row.commit();
      });
      rowNum++;
      worksheet.addRow([]).commit();

      rowNum++;
      let dataHeaderRow = worksheet.addRow(dataColumns.map(function (column) {
        return column.label
      }));
      dataHeaderRow.font = { bold: true }
      dataHeaderRow.commit();

      dataColumns.forEach (function (column) {
        if (column.wrapText) {
          worksheet.getColumn(column.key).alignment = { wrapText: true };
        }
      });

      data.forEach(function (dataRow) {
        rowNum++;
        let row = worksheet.addRow(dataColumns.map(function (column) {
          return dataRow[column.key]
        }));
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
  }
}
