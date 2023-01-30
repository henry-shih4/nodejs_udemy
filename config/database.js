const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const connectDatabase = async () => {
  await mongoose
    .connect(process.env.CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((con) => {
      console.log(`MongoDB connected at ${con.connection.host}`);
    });
};

module.exports = connectDatabase;
