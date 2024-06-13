import { unixfs } from "@helia/unixfs";
import { webSockets } from "@libp2p/websockets";
import { IDBBlockstore } from 'blockstore-idb'
import { useEffect, useState, useCallback, useMemo, createContext } from "react";
import { createLibp2p } from "libp2p";

export function isWebTransportSupported() {
    return typeof window.WebTransport !== 'undefined';
}


export const HeliaContext = createContext({
	helia: null,
	fs: null,
	error: false,
	starting: true,
});

export const HeliaProvider = ({ children }) => {
	const [helia, setHelia] = useState();
	const [fs, setFs] = useState();
	const [starting, setStarting] = useState(true);
	const [error, setError] = useState(false);

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
						const store = new IDBBlockstore()
						const libp2p = await createLibp2p({
							transports: [webSockets()],
						});
						const helia = await createHelia({
							libp2p,
							repo: {
								datastore: store
							}
						});
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
		}),
		[starting, error, fs]
	);

	return (
		<HeliaContext.Provider value={obj}>{children}</HeliaContext.Provider>
	);
};

