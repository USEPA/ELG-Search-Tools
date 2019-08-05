const fs = require('fs');
const xml2js = require('xml2js');
const csv = require('csvtojson');

const parseStringSync = (str) => {
  let result;
  new xml2js.Parser({ explicitArray: false }).parseString(str, (e, r) => {
    result = r;
  });
  return result;
};

const wqxXmlToJson = (filePath) => {
  const xml = fs.readFileSync(filePath);
  const json = parseStringSync(xml);
  const refArray = json.WQXDomainValueList.WQXElement.WQXElementRow;
  const newJson = [];
  refArray.forEach((col) => {
    const val = {};
    col.WQXElementRowColumn.forEach((field) => {
      if (field.$.colname !== 'LastChangeDate') val[field.$.colname] = field.$.value;
    });
    newJson.push(val);
  });
  const data = newJson.map((datum) => {
    return {
      id: datum.UniqueIdentifier,
      name: datum.Name,
      description: datum.Description,
    };
  });
  return data;
};

const csvToJson = async (filePath) => {
  const json = await csv({ checkType: true }).fromFile(filePath);
  return json;
};

module.exports = { wqxXmlToJson, csvToJson };
