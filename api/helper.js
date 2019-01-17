const errorResponse = (error = 'UNKNOWN_ERROR', message = null) => ({
  data: {},
  status: {
    hasError: true,
    error,
    message,
  },
});

module.exports = {
  errorResponse,
};
