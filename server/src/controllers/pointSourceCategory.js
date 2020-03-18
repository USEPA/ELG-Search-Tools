const utilities = require('./utilities');

const PointSourceCategory = require('../models').PointSourceCategory;
const PointSourceSubcategory = require('../models').PointSourceSubcategory;
const Op = require('sequelize').Op;

module.exports = {
  list(req, res) {
    try {
      return PointSourceCategory.findAll({
        attributes: ['pointSourceCategoryCode', 'pointSourceCategoryName'],
        where: {
          includeInSearchTool: { [Op.eq]: true },
        },
        order: ['pointSourceCategoryCode'],
      })
        .then((pointSourceCategories) => {
          res.status(200).send(pointSourceCategories);
        })
        .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send('Error !' + utilities.sanitizeError(err.toString()));
    }
  },
  /**
   * @param {
   *          {id:number}
   * } req.params
   */
  read(req, res) {
    // check for required query attributes and replace with defaults if missing
    try {
      let id = utilities.parseIdAsInteger(req.params.id);

      if (id === null) {
        return res.status(400).send('Invalid value passed for id')
      }

      return PointSourceCategory.findByPk(id, {
        attributes: ['pointSourceCategoryCode', 'pointSourceCategoryName']
      })
        .then((pointSourceCategory) => {
          let result = new Map();

          if(pointSourceCategory) {
            result['pointSourceCategoryCode'] = pointSourceCategory.pointSourceCategoryCode;
            result['pointSourceCategoryName'] = pointSourceCategory.pointSourceCategoryName;

            PointSourceSubcategory.findAll({
              attributes: ['id', 'pointSourceSubcategoryCode', 'pointSourceSubcategoryTitle', 'comboSubcategory'],
              where: {
                pointSourceCategoryCode: { [Op.eq]: id },
              },
              order: ['pointSourceSubcategoryCode'],
            })
              .then((pointSourceSubcategories) => {
                result['pointSourceSubcategories'] = pointSourceSubcategories;

                res.status(200).send(result);
              })
              .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
          }
          else {
            res.status(200).send(result);
          }

        })
        .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send('Error !' + utilities.sanitizeError(err.toString()));
    }
  },
};
