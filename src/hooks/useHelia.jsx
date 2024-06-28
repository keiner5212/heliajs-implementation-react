import { useContext } from "react";
import { HeliaContext } from "@/provider/HeliaProvider";

export const useHelia = () => {
	const { helia, fs, error, starting, peers } = useContext(HeliaContext);
	return { helia, fs, error, starting, peers };
};

export async function provideCid(cid, helia) {
	for await (const event of helia.libp2p.services.dht.provide(cid)) {
		console.log(event)
	 }
}