import { DIDDocument, ParsedDID, Resolver } from "did-resolver";
import RegistryContract from "jolocom-registry-contract";
import { IpfsStorageAgent } from "./ipfs";

const CONTRACT_ADDRESS = '0xd4351c3f383d79ba378ed1875275b1e7b960f120';
const PROVIDER_URI = 'https://rinkeby.infura.io/v3/64fa85ca0b28483ea90919a83630d5d8';
const IPFS_ENDPOINT = 'https://ipfs.jolocom.com:443'

export function getResolver(providerUri: string = PROVIDER_URI, contractAddress: string = CONTRACT_ADDRESS, ipfsHost: string = IPFS_ENDPOINT) {
  const registryContract = new RegistryContract(contractAddress, providerUri)
  const ipfsAgent = new IpfsStorageAgent(ipfsHost)

  async function resolve(
    did: string,
    parsed: ParsedDID,
    didResolver: Resolver
  ): Promise<DIDDocument | null> {
    const ipfsHash = await registryContract.resolveDID(did);

    if (ipfsHash) {
      return (await ipfsAgent.catJSON(ipfsHash)) as DIDDocument;
    }

    return null
  }

  return { "jolo": resolve }
}

export async function getPublicProfile(didDoc: DIDDocument, ipfsHost: string = IPFS_ENDPOINT): Promise<any | null> {
  const ipfsAgent = new IpfsStorageAgent(ipfsHost);

  const publicProfileSection = didDoc?.service?.find(
    endpoint => endpoint.type === 'JolocomPublicProfile',
  );

  if (publicProfileSection?.serviceEndpoint) {
    const hash = publicProfileSection.serviceEndpoint.replace('ipfs://', '');
    return ipfsAgent.catJSON(hash)
  }
}

