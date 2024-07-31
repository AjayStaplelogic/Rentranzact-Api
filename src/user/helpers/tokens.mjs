import * as crypto from "crypto";

function generate_token() {
    return crypto.randomBytes(32).toString("hex");
}


export { generate_token }