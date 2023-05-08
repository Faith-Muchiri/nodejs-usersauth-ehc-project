const { constants } = require("../constants")
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;

  switch (statusCode) {
    case constants.VALIDATION_ERROR:
      res.json({
        title: "validation failed",
        message: err.message,
        stackTrace: err.stack,
      });
      break;
    case constants.NOT_FOUND:
      res.json({
        title: "Not Found",
        message: err.message,
        stackTrace: err.stack,
      });
      case constants.UNAUTHORIZED:
        res.json({
          title: "un authorized",
          message: err.message,
          stackTrace: err.stack,
        });
        break;
      case constants.FORBIDDEN:
        res.json({
          title: "forbidden",
          message: err.message,
          stackTrace: err.stack,
        });
        case constants.SERVER_ERROR:
            res.json({
              title: "Server Error",
              message: err.message,
              stackTrace: err.stack,
            });
    default:
        console.log("No Error, All good !")
        break;
  }
};

module.exports = errorHandler;
