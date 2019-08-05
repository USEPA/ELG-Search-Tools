const {
  RefRole,
} = require('../models');

module.exports = {
  async roles(req, res) {
    try {
      const roles = await RefRole.findAll({});
      res.send(roles);
    } catch (err) {
      res.status(400).send({
        err: 'Data unavailable.',
      });
    }
  },
};
