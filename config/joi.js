const Joi = require('@hapi/joi');

exports.validateSignup = (data) => {
  const Schema = {
    username:Joi.string().min(3).max(255).required(),
    password:Joi.string().min(3).max(1024).required(),
    email:Joi.string().required().min(3).max(255).email({ minDomainSegments: 2 })
  };
  return Joi.validate(data,Schema);
};

exports.validateLogin = (data) => {
  const Schema = {
    email:Joi.string().required().min(3).max(255).email({minDomainSegments:2}),
    password:Joi.string().min(3).max(1024).required(),
    submit:Joi.number().integer().min(0).max(1).required()
  };
  return Joi.validate(data,Schema);
};


