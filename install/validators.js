module.exports.prefixValidator = (str) => {
  if (str.match(/^[a-zA-Z][a-z-A-Z0-9-]*-$/)) return true;
  return 'Must contain only numbers and letters, start with a letter and end in a dash';
};
