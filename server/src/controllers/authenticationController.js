const jwt = require('jsonwebtoken');
const path = require('path');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const { Op } = require('sequelize');
const { User } = require('../models');
const config = require('../config/config');

function jwtSignUser(user) {
  const ONE_WEEK = 60 * 60 * 24 * 7;
  return jwt.sign({ id: user.id, email: user.email }, config.authentication.jwtSecret, { expiresIn: ONE_WEEK });
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  service: config.service,
  auth: {
    user: config.email,
    pass: config.emailPassword,
  },
});

const handlebarsOptions = {
  viewEngine: {
    extName: '.hbs',
    partialsDir: path.resolve('./server/src/templates/'),
  },
  viewPath: path.resolve('./server/src/templates/'),
  extName: '.html',
};

transporter.use('compile', hbs(handlebarsOptions));

module.exports = {
  async register(req, res) {
    try {
      const user = await User.create(req.body);
      const userJson = user.toJSON();
      const token = jwtSignUser(userJson);
      delete userJson.password;
      res.header('Access-Control-Expose-Headers', 'Authorization');
      res.header('Authorization', `Bearer ${token}`);
      res.send({
        data: userJson,
      });
    } catch (err) {
      res.status(400).send({
        error: 'This email account is already in use.',
      });
    }
  },
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({
        where: {
          email,
        },
      });

      if (!user) {
        return res.status(403).send({
          error: 'The credentials do not match our records. Please try again or reset your password.',
        });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid || !user) {
        return res.status(403).send({
          error: 'The credentials do not match our records. Please try again or reset your password.',
        });
      }
      const userJson = user.toJSON();
      const token = jwtSignUser(userJson);
      delete userJson.password;
      res.header('Access-Control-Expose-Headers', 'Authorization');
      res.header('Authorization', `Bearer ${token}`);
      return res.send({
        data: userJson,
      });
    } catch (err) {
      return res.status(500).send({
        error: `An error has occurred trying to log in: ${err}`,
      });
    }
  },

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findOne({
        where: {
          email,
        },
      });

      if (!user) {
        return res.status(422).send({
          error: 'User not found.',
        });
      }
      const userJson = user.toJSON();
      const token = jwtSignUser(userJson);

      await User.update(
        {
          resetPasswordToken: token,
          resetPasswordExpires: Date.now() + 1000 * 60 * 60 * 24,
        },
        {
          where: {
            id: user.id,
          },
        }
      );

      const updatedUser = await User.findOne({
        where: {
          id: user.id,
        },
      });

      const updatedUserJson = updatedUser.toJSON();

      const data = {
        to: updatedUserJson.email,
        from: 'aqua.qapp@gmail.com',
        template: 'forgot-password-email',
        subject: 'AquaQAPP Password Reset',
        context: {
          url: `${config.baseUrl}/resetPassword?token=${updatedUserJson.resetPasswordToken}`,
          name: updatedUserJson.name.split(' ')[0],
        },
      };

      return transporter.sendMail(data, () => {
        return res.json({ message: 'Success' });
      });
    } catch (error) {
      return console.error(error);
    }
  },

  async renderResetPasswordTemplate(req, res) {
    return res.sendFile(path.resolve('./client/views/Reset.vue'));
  },

  async resetPassword(req, res) {
    try {
      const { resetPasswordToken } = req.body;
      const user = await User.findOne({
        where: {
          resetPasswordToken,
          resetPasswordExpires: {
            [Op.gt]: Date.now(),
          },
        },
      });

      if (!user) {
        return res.status(422).send({
          error: 'The password reset token has expired. Please follow steps to reset again.',
        });
      }
      const { newPassword, confirmNewPassword } = req.body;
      if (newPassword === confirmNewPassword) {
        user.password = newPassword;
        await user.hashPassword(user);
        await User.update(
          {
            resetPasswordToken: null,
            resetPasswordExpires: null,
            password: user.password,
          },
          {
            where: {
              resetPasswordToken,
            },
          }
        );

        const updatedUser = await User.findOne({
          where: {
            id: user.id,
          },
        });

        const data = {
          to: updatedUser.email,
          from: 'aqua.qapp@gmail.com',
          template: 'reset-password-email',
          subject: 'Password Reset Confirmation',
          context: {
            name: updatedUser.name.split(' ')[0],
            url: config.baseUrl,
          },
        };

        return transporter.sendMail(data, (err) => {
          if (!err) {
            return res.json({ message: 'Password reset' });
          }
          return console.error(err);
        });
      }
      return res.status(422).send({
        error: 'Passwords do not match.',
      });
    } catch (err) {
      return console.error(err);
    }
  },

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword, confirmNewPassword } = req.body;
      const { email } = req.user;
      const user = await User.findOne({
        where: {
          email,
        },
      });

      const isPasswordValid = await user.comparePassword(currentPassword);

      if (!isPasswordValid || !user) {
        return res.status(422).send({
          error: 'The credentials do not match our records. Please try again.',
        });
      }

      if (newPassword === confirmNewPassword) {
        user.password = newPassword;
        await user.hashPassword(user);

        await User.update(
          {
            password: user.password,
          },
          {
            where: {
              id: user.id,
            },
          }
        );

        const userJson = user.toJSON();
        delete userJson.password;
        return res.send({
          data: userJson,
        });
      }
      return res.status(422).send({
        error: 'Passwords do not match.',
      });
    } catch (error) {
      return console.error(error);
    }
  },

  async user(req, res) {
    try {
      const { newName, newEmail, newOrganization } = req.body;
      if (!newEmail || !newName || !newOrganization) {
        const userJson = req.user.toJSON();
        const token = jwtSignUser(userJson);
        delete userJson.password;
        res.header('Access-Control-Expose-Headers', 'Authorization');
        res.header('Authorization', `Bearer ${token}`);
        return res.send({
          data: userJson,
        });
      }
      const { email } = req.user;
      const user = await User.findOne({
        where: {
          email,
        },
      });

      if (!user) {
        return res.status(422).send({
          error: 'User not found.',
        });
      }

      if (newName.length > 255) {
        return res.status(500).send({ error: 'Full Name should be 255 characters or less.' });
      }
      if (newEmail.length > 255) {
        return res.status(500).send({ error: 'Email should be 255 characters or less.' });
      }
      await User.update(
        {
          name: newName,
          email: newEmail,
          organization: newOrganization,
        },
        {
          where: {
            id: user.id,
          },
        }
      );

      const userJson = user.toJSON();
      delete userJson.password;
      return res.send({
        data: userJson,
      });
    } catch (error) {
      return res.status(500).send({
        error: `An error has occurred trying to update your information: ${error}`,
      });
    }
  },

  async logout(req) {
    req.logout();
  },
};
