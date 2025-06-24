"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeClient = void 0;
require("server-only");
const next_sanity_1 = require("next-sanity");
const env_1 = require("../env");
exports.writeClient = (0, next_sanity_1.createClient)({
    projectId: env_1.projectId,
    dataset: env_1.dataset,
    apiVersion: env_1.apiVersion,
    useCdn: false,
    token: env_1.token,
});
if (!env_1.token || !exports.writeClient.config().token) {
    throw new Error("Missing SANITY_API_WRITE_TOKEN. The app will not run correctly and likes/dislikes will not be saved. Please add it to your .env.local file.");
}
