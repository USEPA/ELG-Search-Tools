const utilities = require('./utilities');
const limitation = require('./limitation');

module.exports = {
  /**
   * @param {
   *          {id:number}
   * } req.params
   */
  limitations(req, res) {
    try {
      // check for required query attributes and replace with defaults if missing
      let id = isNaN(req.params.id) ? null : (Number.isInteger(Number(req.params.id)) ? Number(req.params.id) : null);

      if (id === null) {
        return res.status(400).send('Invalid value passed for id')
      }

      limitation.wastestreamProcessLimitations(id)
        .then(limitations => {
          res.status(200).send(limitations)
        })
        .catch((error) => res.status(400).send(utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send('Error !' + utilities.sanitizeError(err.toString()));
    }
  }
};
