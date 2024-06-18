/* eslint-disable no-console */

import { useCallback } from "react";
import { useHelia } from "@/hooks/useHelia";
import { CID } from "multiformats/cid";
import { provideCid } from "./useHelia";

function getUint8ArrayFromFile(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(new Uint8Array(reader.result));
		reader.onerror = (error) => reject(error);
		reader.readAsArrayBuffer(file);
	});
}

function fromUint8ArrayToFile(uint8Array, fileName, fileType) {
	const blob = new Blob([uint8Array], { type: fileType });
	return new File([blob], fileName, { type: fileType });
}

export const useCommitFile = (setCidString, setCommittedFile) => {
	const { helia, fs, error, starting } = useHelia();

	const commitFile = useCallback(
		async (file) => {
			if (!error && !starting) {
				setCommittedFile(null);
				try {
					const buffer = await getUint8ArrayFromFile(file);
					const cid = await fs.addBytes(buffer, helia.blockstore);
					setCidString(cid.toString());
					await provideCid(cid, helia);
				} catch (e) {
					console.error(e);
				}
			} else {
				console.log("please wait for helia to start");
			}
		},
		[error, starting, helia, fs]
	);

	const fetchCommittedFile = useCallback(
		async (cidString, fileName, fileType) => {
			if (!error && !starting) {
				try {
					let chunks = [];
					const cid = CID.parse(cidString);
					for await (const chunk of fs.cat(cid)) {
						chunks.push(chunk);
					}
					let totalLength = chunks.reduce(
						(acc, value) => acc + value.length,
						0
					);
					let combined = new Uint8Array(totalLength);
					let offset = 0;
					chunks.forEach((chunk) => {
						combined.set(chunk, offset);
						offset += chunk.length;
					});
					setCommittedFile(
						fromUint8ArrayToFile(combined, fileName, fileType)
					);
				} catch (e) {
					console.error(e);
				}
			} else {
				console.log("please wait for helia to start");
			}
		},
		[error, starting, helia, fs]
	);

	return { commitFile, fetchCommittedFile };
};
