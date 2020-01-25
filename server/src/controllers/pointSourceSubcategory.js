const PointSourceSubcategory = require('../models').PointSourceSubcategory;
const ControlTechnology = require('../models').ControlTechnology;
const Op = require('sequelize').Op;

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

function sanitizeError(error) {
  return DOMPurify.sanitize(error);
}

module.exports = {
  /**
   * @param {
   *          {pointSourceCategoryCode:number}
   * } req.query
   */
  list(req, res) {
    // check for required query attributes and replace with defaults if missing
    try {
      let pointSourceCategoryCode = req.query.pointSourceCategoryCode ? req.query.pointSourceCategoryCode : 0;

      return PointSourceSubcategory.findAll({
        attributes: ['id', 'pointSourceSubcategoryCode', 'pointSourceSubcategoryTitle', 'comboSubcategory'],
        where: {
          pointSourceCategoryCode: { [Op.eq]: pointSourceCategoryCode },
        },
        order: ['pointSourceSubcategoryCode'],
      })
        .then((pointSourceSubcategories) => {
          res.status(200).send(pointSourceSubcategories);
        })
        .catch((error) => res.status(400).send('Error! ' + sanitizeError(error)));
    } catch (err) {
      return res.status(400).send('Error !' + sanitizeError(err.toString()) + typeof req.query.keyword);
    }
  },
  /**
   * @param {
   *          {id:number},
   * } req.params
   */
  read(req, res) {
    // check for required query attributes and replace with defaults if missing
    let id = req.params.id ? req.params.id : 0;

    return PointSourceSubcategory.findAll({
      attributes: ['id', 'pointSourceSubcategoryCode', 'pointSourceSubcategoryTitle', 'comboSubcategory'],
      where: {
        id: { [Op.eq]: id }
      }})
      .then((pointSourceSubcategory) => {
        let result = new Map();

        result['id'] = pointSourceSubcategory[0].id;
        result['pointSourceSubcategoryCode'] = pointSourceSubcategory[0].pointSourceSubcategoryCode;
        result['pointSourceSubcategoryTitle'] = pointSourceSubcategory[0].pointSourceSubcategoryTitle;
        result['comboSubcategory'] = pointSourceSubcategory[0].comboSubcategory;

        ControlTechnology.findAll({
          attributes: ['id', 'controlTechnologyCode', 'controlTechnologyDescription', 'notes'],
          where: {
            pointSourceSubcategoryId: { [Op.eq]: id },
            controlTechnologyCode: {[Op.in]: ['BPT', 'BCT', 'BAT', 'NSPS', 'PSES', 'PSNS']}
          },
          order: ['displayOrder'],
        })
          .then((controlTechnologies) => {
            result['controlTechnologies'] = controlTechnologies;

            res.status(200).send(result);
          })
          .catch((error) => res.status(400).send('Error! ' + sanitizeError(error)))
      })
      .catch((error) => res.status(400).send('Error! ' + sanitizeError(error)));
  }
};
