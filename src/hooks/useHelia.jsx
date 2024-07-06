import { useContext } from "react";
import { HeliaContext } from "@/provider/HeliaProvider";

export const useHelia = () => {
	const { helia, fs, error, starting, peers } = useContext(HeliaContext);
	return { helia, fs, error, starting, peers };
};

export async function provideCid(cid, helia) {

	const startTime = Date.now();
	for await (const event of helia.libp2p.services.dht.provide(cid)) {
		console.log("Providing...");
	 }

	console.log(`Provided in ${Date.now() - startTime}ms`);
}