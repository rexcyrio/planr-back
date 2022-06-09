function formatErrorMessage(error) {
  return `${error.name}: ${error.message}`;
}

module.exports = formatErrorMessage;
