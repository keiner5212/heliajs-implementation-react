import { React, useState, useEffect } from "react";
import "./App.css";
import { useCommitText } from "@/hooks/useCommitText";
import { useHelia } from "@/hooks/useHelia";
import { useCommitFile } from "./hooks/useCommitFile";

function App() {
	const [text, setText] = useState("");
	const [file, setFile] = useState();
	const { helia, error, starting, peers } = useHelia();
	const [fileCid, setFileCid] = useState("");
	const [cidString, setCidString] = useState("");
	const [committedFile, setCommittedFile] = useState();
	const [committedText, setCommittedText] = useState();
	const { commitFile, fetchCommittedFile } = useCommitFile(
		setFileCid,
		setCommittedFile
	);
	const [fileType, setFileType] = useState("");
	const [fileName, setFileName] = useState("");

	const { commitText, fetchCommittedText } = useCommitText(
		setCidString,
		setCommittedText
	);

	useEffect(() => {
		if (committedFile) {
			const url = URL.createObjectURL(committedFile);
			window.open(url, "_blank");
		}
	}, [committedFile]);

	return (
		<div className="App">
			<div
				id="heliaStatus"
				style={{
					border: `4px solid ${
						error ? "red" : starting ? "yellow" : "green"
					}`,
					paddingBottom: "4px",
				}}
			>
				Helia Status:{" "}
				{error ? "Error" : starting ? "Starting" : "Running"}
				{helia && !error && !starting && (
					<p>ID: {helia.libp2p.peerId.toString()}</p>
				)}
				{helia && !error && !starting && (
					<>
						<div>Conected Peers: {peers.length}</div>
						<button onClick={() => console.log(peers)}>
							Log pers
						</button>
					</>
				)}
			</div>
			<div>
				<p>Texts</p>
				<input
					id="textInput"
					value={text}
					onChange={(event) => setText(event.target.value)}
					type="text"
				/>
				<button id="commitTextButton" onClick={() => commitText(text)}>
					Add Text To Node
				</button>
				<div id="cidOutput">
					textCid:
					<input
						type="text"
						value={cidString ?? ""}
						onChange={(e) => {
							setCidString(e.target.value);
						}}
					/>
				</div>
				<button
					id="fetchCommittedTextButton"
					onClick={() => fetchCommittedText(cidString)}
				>
					Fetch Committed Text
				</button>
				<button>Delete text</button>
				<div id="committedTextOutput">
					Committed Text: {committedText}
				</div>
			</div>
			<div>
				<p>Files</p>
				<input
					id="fileInput"
					type="file"
					onChange={(event) => {
						setFile(event.target.files[0]);
						setFileName(event.target.files[0].name);
						setFileType(event.target.files[0].type);
					}}
				/>
				<button id="commitFileButton" onClick={() => commitFile(file)}>
					Add File To Node
				</button>

				<div id="cidOutput">
					file info:
					<label>
						file Cid:
						<input
							type="text"
							value={fileCid}
							onChange={(e) => {
								setFileCid(e.target.value);
							}}
						/>
					</label>
					<label>
						file Type:
						<input
							type="text"
							value={fileType}
							onChange={(e) => {
								setFileType(e.target.value);
							}}
						/>
					</label>
					<label>
						file Name:
						<input
							type="text"
							value={fileName ?? ""}
							onChange={(e) => {
								setFileName(e.target.value);
							}}
						/>
					</label>
				</div>
				<button
					id="fetchCommittedFileButton"
					onClick={async () => {
						fetchCommittedFile(fileCid, fileName, fileType);
					}}
				>
					Fetch Committed File
				</button>
				<button>Delete file</button>
			</div>
		</div>
	);
}

export default App;
