import { unixfs } from "@helia/unixfs";
import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { IDBBlockstore } from "blockstore-idb";
import { IDBDatastore } from "datastore-idb";
import { bootstrap } from "@libp2p/bootstrap";
import { identify, identifyPush } from "@libp2p/identify";
import { autoNAT } from "@libp2p/autonat";
import { dcutr } from "@libp2p/dcutr";
import { kadDHT } from "@libp2p/kad-dht";

import {
	useEffect,
	useState,
	useCallback,
	useMemo,
	createContext,
} from "react";
import { createLibp2p } from "libp2p";
// import { webRTC } from "@libp2p/webrtc";
import { webSockets } from "@libp2p/websockets";

export function isWebTransportSupported() {
	return typeof window.WebTransport !== "undefined";
}

export const HeliaContext = createContext({
	helia: null,
	fs: null,
	error: false,
	starting: true,
	peers: [],
});

export const HeliaProvider = ({ children }) => {
	const [helia, setHelia] = useState();
	const [fs, setFs] = useState();
	const [starting, setStarting] = useState(true);
	const [error, setError] = useState(false);
	const [peers, setPeers] = useState([]);

	const startHelia = useCallback(async () => {
		if (helia) {
			console.info("helia already started");
		} else if (window.helia) {
			console.info("found a windowed instance of helia, populating ...");
			setHelia(window.helia);
			setStarting(false);
		} else {
			try {
				console.info("Starting Helia");
				if (isWebTransportSupported()) {
					import("helia").then(async ({ createHelia }) => {
						const blockstore = new IDBBlockstore(
							"blockstore-hello-app"
						);
						const datastore = new IDBDatastore(
							"datastore-hello-app"
						);
						await blockstore.open();
						await datastore.open();

						const libp2p = await createLibp2p({
							transports: [
								webSockets()
							],
							connectionEncryption: [noise()],
							streamMuxers: [yamux()],
							datastore: datastore,
							peerDiscovery: [
								bootstrap({
									list: [
										"/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
										"/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
										"/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
										"/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
									],
								}),
							],
							services: {
								identify: identify(),
								identifyPush: identifyPush(),
								autoNAT: autoNAT(),
								dcutr: dcutr(),
								dht: kadDHT({
									protocol: "/ipfs/kad/1.0.0",
								}),
							},
						});

						await libp2p.start();

						const helia = await createHelia({
							libp2p,
							datastore,
							blockstore,
						});

						window.helia = helia;

						await helia.libp2p.services.dht.setMode("server");

						helia.libp2p.addEventListener("peer:connect", (evt) => {
							setPeers(helia.libp2p.getPeers());
						});

						helia.libp2p.addEventListener(
							"peer:disconnect",
							(evt) => {
								setPeers(helia.libp2p.getPeers());
							}
						);

						setHelia(helia);
						setStarting(false);
					});
				} else {
					setStarting(false);
					setError(true);
				}
			} catch (e) {
				console.error(e);
				setError(true);
			}
		}
	}, []);

	useEffect(() => {
		startHelia();
	}, []);

	useEffect(() => {
		if (helia) {
			console.info("helia started");
			setFs(unixfs(helia));
		}
	}, [helia]);

	const obj = useMemo(
		() => ({
			helia,
			fs,
			error,
			starting,
			peers,
		}),
		[starting, error, fs, peers]
	);

	return (
		<HeliaContext.Provider value={obj}>{children}</HeliaContext.Provider>
	);
};
