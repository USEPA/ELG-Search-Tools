const utilities = require('./utilities');

const https = require('https');

const fs = require('fs');

module.exports = {
  list(req, res) {
    try {
      /****************************************************************
       Is Glossary/Terminology Services authorization variable set?
       ****************************************************************/
      if (process.env.ELG_GLOSSARY_AUTH) {
        console.log('ELG_GLOSSARY_AUTH environmental variable found, continuing.');

        let glossaryOptions = {
          host: 'etss.epa.gov',
          port: 443,
          path: '/synaptica_rest_services/api/vocabs/name/ELG%20Glossary/terms/full',
          headers: {
            authorization: 'basic ' + Buffer.from(process.env.ELG_GLOSSARY_AUTH).toString('base64')
          }
        }

        https.get(glossaryOptions, glossaryResponse => {
          let response = '';

          glossaryResponse.on('data', data => {
            response += data;
          });

          glossaryResponse.on('end', () => {
            if (glossaryResponse.statusCode !== 200) {
              console.log (JSON.parse(response));
              response = '[]';
              console.log('Non-200 returned from glossary web service: ' + glossaryResponse.statusCode);
            } else {
              console.log('Successful glossary request');
            }
            res.status(200).send(JSON.parse(response));
          });

          glossaryResponse.on('error', err => {
            console.log('Error returned from glossary web service: ' + utilities.sanitizeError(err.message));
            res.status(200).send(JSON.parse('[]'));
          });
        });
      } else {
        console.log('Glossary/Terminology Services authorization variable NOT set!');
        res.status(200).send(JSON.parse('[]'));
      }
    } catch (err) {
      return res.status(400).send('Error !' + utilities.sanitizeError(err.toString()));
    }
  },
  help (req, res) {
    try {
      const path = require('path');
      const fileName = path.join(__dirname, '..\\..\\api-docs\\ELG Database Users Guide.pdf');

      const file = fs.createReadStream(fileName);
      const stat = fs.statSync(fileName);
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=ELG Database Users Guide.pdf');
      file.pipe(res);
    }
    catch (err) {
      res.status(400).send('Error !' + utilities.sanitizeError(err.toString()));
    }
  }
};
