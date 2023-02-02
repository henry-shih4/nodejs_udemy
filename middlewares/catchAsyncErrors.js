// module.exports = (func) => (req, res, next) =>
//   Promise.resolve(func(req, res, next)).catch(next);

function catchAsyncFunction(asyncFunction) {
  return (req, res, next) => {
    asyncFunction(req, res, next).catch(next);
  };
}

module.exports = catchAsyncFunction;
