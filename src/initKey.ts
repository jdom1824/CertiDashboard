import { ec as EC } from 'elliptic';
import { createHash } from 'crypto';

const ec = new EC('secp256k1');

export function generateDerivedKeyFromDate(userId: string, date: string) {
  const input = `${userId}:${date}`;
  const seed = createHash('sha256').update(input).digest();
  const key = ec.keyFromPrivate(seed);

  return {
    privateKey: key.getPrivate('hex'),
    publicKey: key.getPublic('hex'),
  };
}
