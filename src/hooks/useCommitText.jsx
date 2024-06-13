/* eslint-disable no-console */

import { useCallback } from "react";
import { useHelia } from "@/hooks/useHelia";
import { CID } from "multiformats/cid";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const useCommitText = (setCidString, setCommittedText) => {
	const { helia, fs, error, starting } = useHelia();

	const commitText = useCallback(
		async (text) => {
			if (!error && !starting) {
				try {
					const cid = await fs.addBytes(
						encoder.encode(text),
						helia.blockstore
					);
					setCidString(cid.toString());
					console.log("Added file:", cid.toString());
				} catch (e) {
					console.error(e);
				}
			} else {
				console.log("please wait for helia to start");
			}
		},
		[error, starting, helia, fs]
	);

	const fetchCommittedText = useCallback(
		async (cidString) => {
			let text = "";
			if (!error && !starting) {
				try {
					const cid = CID.parse(cidString);
					for await (const chunk of fs.cat(cid)) {
						text += decoder.decode(chunk, {
							stream: true,
						});
					}
					setCommittedText(text);
				} catch (e) {
					console.error(e);
				}
			} else {
				console.log("please wait for helia to start");
			}
		},
		[error, starting, helia, fs]
	);
	return { commitText, fetchCommittedText };
};
