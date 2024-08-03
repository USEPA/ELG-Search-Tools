const utilities = require('./utilities');

const fs = require('fs');

module.exports = {
  list(req, res) {
    try {
      //get latest version of the glossary from file system (updated from TS or s3 on each server restart)
      const path = require('path');
      const fileName = path.join(__dirname, '../s3/glossary.json');

      const file = fs.createReadStream(fileName);
      file.pipe(res);
    } catch (err) {
      return res.status(400).send('Error !' + utilities.sanitizeError(err.toString()));
    }
  },
  help(req, res) {
    try {
      //get latest version of help pdf from file system (updated from s3 on each server restart)
      const path = require('path');
      const fileName = path.join(__dirname, '../s3/ELG Database Users Guide.pdf');

      const file = fs.createReadStream(fileName);
      const stat = fs.statSync(fileName);
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=ELG Database Users Guide.pdf');
      file.pipe(res);
    } catch (err) {
      res.status(400).send('Error !' + utilities.sanitizeError(err.toString()));
    }
  },
  contact(req, res) {
    try {
      //get latest contact information from file system (updated from s3 on each server restart)
      const path = require('path');
      const fileName = path.join(__dirname, '../s3/contact.txt');

      const file = fs.createReadStream(fileName);
      file.pipe(res);
    } catch (err) {
      return res.status(400).send('Error !' + utilities.sanitizeError(err.toString()));
    }
  },
};
