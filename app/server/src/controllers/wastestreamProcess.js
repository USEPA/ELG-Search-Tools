const utilities = require('./utilities');
const limitation = require('./limitation');
const download = require('./download');

module.exports = {
  /**
   * @param {
   *          {id:number},
   *          {download:string}
   * } req.query
   */
  limitations(req, res) {
    try {
      // check for required query attributes and replace with defaults if missing
      let id = utilities.parseIdAsInteger(req.query.id);

      if (id === null) {
        return res.status(400).send('Invalid value passed for id')
      }

      let downloadRequested = utilities.parseDownload(req.query.download);

      limitation.wastestreamProcessLimitations(id)
        .then(limitations => {
          if (downloadRequested) {
            download.createDownloadFile('limitations',
              'Pollutant Limitations',
              [
                { key: 'pollutantDescription', label: 'Pollutant', width: 40 },
                { key: 'limitationDurationTypeDisplay', label: 'Type of Limitation', width: 30 },
                { key: 'limitationValue', label: 'Limitation Value' },
                { key: 'alternateLimitFlag', label: 'Limitation Flag' },
                { key: 'limitationUnitCode', label: 'Units', width: 90 },
                { key: 'limitationUnitBasis', label: 'Limitation Basis' }
              ],
              [
                { label: 'Point Source Category ' + limitations.pointSourceCategoryCode, value: limitations.pointSourceCategoryName },
                { label: 'Subpart', value: limitations.comboSubcategory },
                { label: 'CFR Section', value: limitations.cfrSection },
                { label: 'Level of Control', value: limitations.controlTechnologyCode},
                { label: 'Process Operation/Wastestream', value: limitations.title },
                { label: 'Other Process/Wastestream Details', value: limitations.secondary.replace(/<strong><u>and<\/u><\/strong>/ig, 'AND'), wrapText: true }
              ],
              limitations.limitations,
              res);
          }
          else {
            res.status(200).send(limitations)
          }
        })
        .catch((error) => res.status(400).send(utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send('Error !' + utilities.sanitizeError(err.toString()));
    }
  }
};
