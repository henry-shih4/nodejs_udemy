const ErrorHandler = require("../src/utils/errorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      success: false,
      error: err,
      errMessage: err.message,
      stack: err.stack,
    });
  }

  //production errors, what we want user to see.
  if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    //Wrong mongoose object ID error
    if (err.name === "CastError") {
      const message = `Resource not found. Invalid: ${err.path}`;
      error = new ErrorHandler(message, 404);
    }

    //Validation Error
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((value) => {
        return ` ${value.message}`;
      });
      error = new ErrorHandler(message, 400);
    }

    if (err.code === 11000) {
      const message = `That ${Object.keys(
        err.keyValue
      )} is already registered!`;
      error = new ErrorHandler(message, 400);
    }

    //Handling wrong JWT Token error

    if (err.name === "JsonWebTokenError") {
      const message = "JSON Web Token is invalid. Please try again";
      error = new ErrorHandler(message, 500);
    }

    //Handling JWT Token expired

    if (err.name === "TokenExpiredError") {
      const message = "JSON Web Token has expired. Please login again.";
      error = new ErrorHandler(message, 500);
    }

    res.status(error.statusCode).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
