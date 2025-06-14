"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDerivedKeyFromDate = generateDerivedKeyFromDate;
const elliptic_1 = require("elliptic");
const crypto_1 = require("crypto");
const ec = new elliptic_1.ec('secp256k1');
function generateDerivedKeyFromDate(userId, date) {
    const input = `${userId}:${date}`;
    const seed = (0, crypto_1.createHash)('sha256').update(input).digest();
    const key = ec.keyFromPrivate(seed);
    return {
        privateKey: key.getPrivate('hex'),
        publicKey: key.getPublic('hex'),
    };
}
