import type React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { CheckCheckIcon, ShieldX } from "lucide-react";
import { SpinnerIcon } from "../components/Spinner";
import { tv } from "tailwind-variants";

type Rocket = {
	id: number;
	color: string;
	code: string;
};

function shuffle(array: object[]) {
	array.sort(() => Math.random() - 0.5);
}

const ROCKETS = [
	{ id: 1, color: "pink", code: "15 08 13 10" },
	{ id: 2, color: "blue", code: "01 11 20 04" },
	{ id: 3, color: "green", code: "06 17 04 04 13" },
	{ id: 4, color: "violet", code: "21 08 14 11 04 19" },
] satisfies Rocket[];

shuffle(ROCKETS);

const variants = tv({
	base: "px-6 py-2 text-white rounded-lg hover:bg-green-600 transition-colors",
	variants: {
		decrypting: {
			waiting: "bg-gray-500",
			decrypting: "bg-yellow-500",
			success: "bg-green-500",
			failed: "bg-red-500",
		},
	},
});

function Icon({
	decrypting,
}: { decrypting: "waiting" | "decrypting" | "success" | "failed" }) {
	switch (decrypting) {
		case "decrypting":
			return <SpinnerIcon />;
		case "success":
			return <CheckCheckIcon />;
		case "failed":
			return <ShieldX />;
		case "waiting":
			return "👾 Decrypt";
	}
}

export function SenderScreen() {
	const [decrypting, setDecrypting] = useState<
		"waiting" | "decrypting" | "success" | "failed"
	>("waiting");
	const [selectedRocket, setSelectedRocket] = useState<Rocket | null>(null);
	const [userInput, setUserInput] = useState("");
	const [launchedRockets, setLaunchedRockets] = useState<number[]>([]);

	useEffect(() => {
		supabase.channel("game").subscribe();
	}, []);

	const handleRocketSelect = (rocket: Rocket) => {
		if (!launchedRockets.includes(rocket.id)) {
			setSelectedRocket(rocket);
			setUserInput("");
		}
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setDecrypting("decrypting");
		setTimeout(() => {
			if (selectedRocket && userInput.toLowerCase() === selectedRocket.color) {
				setLaunchedRockets([...launchedRockets, selectedRocket.id]);
				supabase.channel("game").send({
					type: "broadcast",
					event: "rocketIncoming",
					payload: { rocketId: selectedRocket.id },
				});
				setSelectedRocket(null);
				setUserInput("");
				setDecrypting("success");
			} else {
				setDecrypting("failed");
			}
			setTimeout(() => {
				setDecrypting("waiting");
			}, 500);
		}, 1500);
	};

	const variant = variants({ decrypting });

	return (
		<div
			className="min-h-screen p-8"
			style={{
				backgroundImage: "url(./assets/mars.png)",
			}}
		>
			<div className="max-w-4xl mx-auto">
				<h1 className="text-4xl font-bold text-white mb-8">
					🛸 Mars Command Center
				</h1>

				<div className="grid grid-cols-2 gap-8 mb-8">
					{ROCKETS.map((rocket) => (
						<motion.div
							key={rocket.id}
							className={`relative p-6 rounded-lg cursor-pointer ${
								launchedRockets.includes(rocket.id)
									? "opacity-80 cursor-not-allowed"
									: "hover:shadow-lg"
							}`}
							whileHover={
								!launchedRockets.includes(rocket.id) ? { scale: 1.05 } : {}
							}
							onClick={() => handleRocketSelect(rocket)}
						>
							<div
								className={`h-28 rounded-lg backdrop-blur-sm bg-gray-800 flex items-center justify-center ${
									launchedRockets.includes(rocket.id) ? "bg-green-500" : ""
								}`}
							>
								<motion.div
									animate={
										launchedRockets.includes(rocket.id)
											? { y: -1000, transition: { duration: 2 } }
											: {}
									}
								>
									<img src="./rocket.svg" className="w-24 h-24" alt="rocket" />
								</motion.div>
							</div>
						</motion.div>
					))}
				</div>

				{selectedRocket && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-gray-800  p-6 rounded-lg backdrop-blur-sm"
					>
						<h2 className="text-2xl font-semibold mb-4">🔍 Decrypt the Code</h2>
						<p className="mb-4 font-mono text-xl">{selectedRocket.code}</p>
						<form onSubmit={handleSubmit} className="flex gap-4">
							<input
								type="text"
								value={userInput}
								onChange={(e) => setUserInput(e.target.value)}
								className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
								placeholder="Enter the color name..."
							/>
							<button
								type="submit"
								className={variant}
								disabled={decrypting !== "waiting"}
							>
								<Icon decrypting={decrypting} />
							</button>
						</form>
					</motion.div>
				)}
			</div>
			<div className="text-white text-center md:fixed mt-2 md:mt-0 left-0 bottom-0 w-full pb-6">
				Made with &#10084; by{" "}
				<a
					href="https://github.com/MalekD5"
					className="text-teal-500 font-bold underline underline-offset-2"
				>
					Malek Shawahneh
				</a>
			</div>
		</div>
	);
}
