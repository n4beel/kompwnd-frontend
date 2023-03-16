import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TOKEN, GAIA_HUB_URL_USER } from '../_constants/constants.js'

import * as bip32 from 'bip32';
import { BIP32Interface } from 'bip32';
import { createHash } from 'crypto';
import { ECPair, crypto, address, script, Transaction } from 'bitcoinjs-lib';
import { TokenSigner } from 'jsontokens'
import * as Crypto from 'crypto';

@Injectable()
export class GaiaService {
    constructor(){}

    getAppPrivateKey(user){
        let node: BIP32Interface = bip32.fromBase58(user.account.appsNodeKey);
        const appsNode = new AppsNode(node, user.account.salt);
        const appPrivateKey = appsNode.getAppNode(TOKEN).getKey();
        // console.log("appPrivateKey: " + appPrivateKey);
        return appPrivateKey;
    }

    getGaiaAddress(user){
        let key = this.getAppPrivateKey(user)
        // console.log("ADDRESS:",ecPairToAddress(hexStringToECPair(key + (key.length === 64 ? '01' : ''))));
        return ecPairToAddress(hexStringToECPair(key + (key.length === 64 ? '01' : '')))
    }

    async getGaiaToken(user){
        const response = await fetchPrivate(`${GAIA_HUB_URL_USER}/hub_info`)        
        const hubInfo = await response.json()        
        const token : string = makeV1GaiaAuthToken(hubInfo, this.getAppPrivateKey(user), GAIA_HUB_URL_USER)
        // console.log("TOKEN:" , token);
        return token;
    }
}

class AppNode {
    hdNode;
    appDomain;

    constructor(hdNode, appDomain) {        
        this.hdNode = hdNode;
        this.appDomain = appDomain;
    }

    getKey() {
        return this.hdNode.__D.toString('hex');
    }
} 
class AppsNode {
    hdNode;
    salt;

    constructor(appsHdNode, salt) {
        // console.log("PARTH : TCL: AppsNode -> constructor -> appsHdNode", appsHdNode)
        this.hdNode = appsHdNode;
        this.salt = salt;
    }
  
    getAppNode(appDomain) {
        const hash = createHash('sha256').update(`${appDomain}${this.salt}`).digest('hex');
        const appIndex = hashCode(hash);
        const appNode = this.hdNode.deriveHardened(appIndex);
        return new AppNode(appNode, appDomain);
    }
}
function hashCode(string) {
    let hash = 0;
    if (string.length === 0) return hash;
    for (let i = 0; i < string.length; i++) {
        const character = string.charCodeAt(i);
        hash = (hash << 5) - hash + character;
        hash &= hash;
    }
    return hash & 0x7fffffff;
}
function fetchPrivate(input: RequestInfo, init?: RequestInit): Promise<Response> {
    init = init || { }
    init.referrerPolicy = 'no-referrer'
    return fetch(input, init)
}
function ecPairToAddress(keyPair: ECPair.ECPairInterface) {
    return address.toBase58Check(crypto.hash160(keyPair.publicKey), keyPair.network.pubKeyHash)
}
function hexStringToECPair(skHex: string): ECPair.ECPairInterface {
    if (skHex.length === 66) {
        if (skHex.slice(64) !== '01') {
          throw new Error('Improperly formatted private-key hex string. 66-length hex usually '
                          + 'indicates compressed key, but last byte must be == 1')
        }
        return ECPair.fromPrivateKey(Buffer.from(skHex.slice(0, 64), 'hex'))
    }
    else if (skHex.length === 64) {
        // ecPairOptions.compressed = false
        return ECPair.fromPrivateKey(Buffer.from(skHex, 'hex'))
    } 
    else {
        throw new Error('Improperly formatted private-key hex string: length should be 64 or 66.')
    }
}
function makeV1GaiaAuthToken(
        hubInfo: any,
        signerKeyHex: string,
        hubUrl: string,
        associationToken?: string ): string {

    const challengeText = hubInfo.challenge_text
    const handlesV1Auth = (hubInfo.latest_auth_version && parseInt(hubInfo.latest_auth_version.slice(1), 10) >= 1)
    const iss = getPublicKeyFromPrivate(signerKeyHex)

    if (!handlesV1Auth) {
        return makeLegacyAuthToken(challengeText, signerKeyHex)
    }

    const salt = Crypto.randomBytes(16).toString('hex')
    const payload = {
        gaiaChallenge: challengeText,
        hubUrl,
        iss,
        salt,
        associationToken
    }
    const token = new TokenSigner('ES256K', signerKeyHex).sign(payload)
    return `v1:${token}`
}
function getPublicKeyFromPrivate(privateKey: string) {
    const keyPair = ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'))
    return keyPair.publicKey.toString('hex')
}
function makeLegacyAuthToken(challengeText: string, signerKeyHex: string): string {
    // only sign specific legacy auth challenges.
    let parsedChallenge

    try {
        parsedChallenge = JSON.parse(challengeText)
    } catch (err) {
        throw new Error('Failed in parsing legacy challenge text from the gaia hub.')
    }
    if (parsedChallenge[0] === 'gaiahub' && parsedChallenge[3] === 'aladin_storage_please_sign') {
        const signer = hexStringToECPair(signerKeyHex + (signerKeyHex.length === 64 ? '01' : ''))
        const digest = crypto.sha256(Buffer.from(challengeText))

        const signatureBuffer = signer.sign(digest)
        const signatureWithHash = script.signature.encode(signatureBuffer, Transaction.SIGHASH_NONE)
        
        // We only want the DER encoding so remove the sighash version byte at the end.
        // See: https://github.com/bitcoinjs/bitcoinjs-lib/issues/1241#issuecomment-428062912
        const signature = signatureWithHash.toString('hex').slice(0, -2)
        
        const publickey = getPublicKeyFromPrivate(signerKeyHex)
        const token = Buffer.from(JSON.stringify({ publickey, signature })).toString('base64')
        return token
    } 
    else {
        throw new Error('Failed to connect to legacy gaia hub. If you operate this hub, please update.')
    }
}