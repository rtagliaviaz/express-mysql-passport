const {format} = require('timeago.js');

const helpers = {};

helpers.timeago = (created_at) => {
  return format(created_at);
};

helpers.format = (created_at) => {
  let date = new Date(created_at)
  let year = date.getFullYear()
  let month = date.getMonth()+1
  let day = date.getDate()
  return (day + ' / ' + month + ' / ' + year)
}

helpers.isEq = (user) => {
    return user == 1;
};

helpers.when = (a, operator, b, options) => {
  let operators = {
    'eq': function(l,r) { return l == r; },
    'noteq': function(l,r) { return l != r; },
    'gt': function(l,r) { return Number(l) > Number(r); },
    'or': function(l,r) { return l || r; },
    'and': function(l,r) { return l && r; },
    '%': function(l,r) { return (l % r) === 0; }
   },
  result = operators[operator](a, b);
  if (result) return options.fn(this);
  else  return options.inverse(this);
}

module.exports = helpers;