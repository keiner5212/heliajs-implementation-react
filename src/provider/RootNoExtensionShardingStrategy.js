import { CID } from 'multiformats/cid';
import { base32 } from 'multiformats/bases/base32';

class RootNoExtensionShardingStrategy {
  constructor() {
    this.extension = '';
  }

  encode(cid) {
    return cid.toString(base32.encoder).toUpperCase();
  }

  decode(path) {
    return CID.parse(path);
  }
}

export default RootNoExtensionShardingStrategy;
