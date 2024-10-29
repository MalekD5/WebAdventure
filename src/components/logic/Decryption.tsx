import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useState } from "react";
import type { Rocket } from "../../types";
import IconButton from "../IconButton";

export default function Decryption({
	setLaunchedRockets,
	launchedRockets,
	selectedRocket,
	setSelectedRocket,
	setShowDialog,
}: {
	setLaunchedRockets: React.Dispatch<React.SetStateAction<number[]>>;
	setSelectedRocket: React.Dispatch<React.SetStateAction<Rocket | null>>;
	launchedRockets: number[];
	setShowDialog: React.Dispatch<React.SetStateAction<boolean>>;
	selectedRocket: Rocket | null;
}) {
	const [decrypting, setDecrypting] = useState<
		"waiting" | "check" | "success" | "failed"
	>("waiting");
	const [userInput, setUserInput] = useState("");

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setDecrypting("check");
		setTimeout(() => {
			if (
				selectedRocket &&
				selectedRocket.type === "decryption" &&
				userInput.toLowerCase() === selectedRocket.content.solution
			) {
				setDecrypting("success");
				setTimeout(() => {
					setShowDialog(false);
					setLaunchedRockets([...launchedRockets, selectedRocket.id]);
					supabase.channel("game").send({
						type: "broadcast",
						event: "rocketIncoming",
						payload: { rocketId: selectedRocket.id },
					});
					setSelectedRocket(null);
					setUserInput("");
					setDecrypting("waiting");
				}, 2000);
			} else {
				setDecrypting("failed");
				setTimeout(() => {
					setDecrypting("waiting");
				}, 500);
			}
		}, 1500);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="bg-gray-800 p-6 rounded-lg backdrop-blur-sm"
		>
			<h2 className="text-2xl font-semibold mb-4">🔍 Decrypt the Code</h2>
			<p className="mb-4 font-mono text-xl">
				{selectedRocket &&
					selectedRocket.type === "decryption" &&
					selectedRocket.content.code}
			</p>
			<form onSubmit={handleSubmit} className="flex gap-4">
				<input
					type="text"
					value={userInput}
					onChange={(e) => setUserInput(e.target.value)}
					className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
					placeholder="Enter the color name..."
				/>
				<IconButton onClick={() => {}} state={decrypting} />
			</form>
		</motion.div>
	);
}
