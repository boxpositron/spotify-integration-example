require("dotenv").config();
const Axios = require("axios");
const logger = require("moment-logger").default;
const VRE = require("@boxpositron/vre");

const { RequiredEnvironmentTypes, default: validate } = VRE;

validate([
  {
    name: "CLIENT_ID",
    type: RequiredEnvironmentTypes.String,
  },
  {
    name: "CLIENT_SECRET",
    type: RequiredEnvironmentTypes.String,
  },
]);

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const generateAuthToken = ({ clientId, clientSecret }) =>
  Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

const fetchToken = async ({ clientId, clientSecret }) => {
  try {
    const GRANT_TYPE = "client_credentials";

    const bearerToken = generateAuthToken({ clientId, clientSecret });

    const axios = Axios.create({
      baseURL: "https://accounts.spotify.com/api/token",
      headers: {
        Authorization: `Basic ${bearerToken}`,
      },
    });

    const options = {
      method: "POST",
      data: `grant_type=${GRANT_TYPE}`,
    };

    const {
      data: { access_token: token },
    } = await axios(options);

    return token;
  } catch (err) {
    if (!Axios.isAxiosError(err)) {
      throw err;
    }

    throw new Error(err.response.data.error);
  }
};

logger.log("Generating Token");

fetchToken({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET })
  .then(logger.info)
  .catch(logger.error);
