import { useContext } from "react";
import { HeliaContext } from "@/provider/HeliaProvider";

export const useHelia = () => {
	const { helia, fs, error, starting, peers } = useContext(HeliaContext);
	return { helia, fs, error, starting, peers };
};

export async function provideCid(cid, helia) {
	const res = await helia.libp2p.services.dht.provide(cid);
	console.log(res);
}
