// --------------------------------------------------
// db.js contains the logic to connect to both local and
// deployed databases
// --------------------------------------------------
const { connect } = require("mongoose");

const logger = require("../config/components/logger");
/**
 * Connect to local or deployed database.
 * @async
 */
const connectToDB = async () => {
  try {
    const res = await connect(process.env.MONGODB_URI);
    logger.info(" > Successful connection to DB");
  } catch (err) {
    logger.info("Error:", err);
  }
};

connectToDB();
