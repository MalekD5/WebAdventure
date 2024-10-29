import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import Stars from "../components/Stars";
import type { Rocket } from "../types";
import Decryption from "../components/logic/Decryption";
import CodingRocketScreen from "../components/logic/CodingRocketScreen";
import GraphRocketScreen from "../components/logic/GraphRocketScreen";
import DSRocketScreen from "../components/logic/DSRocketScreen";

function shuffle(array: object[]) {
	array.sort(() => Math.random() - 0.5);
}

const codes = [
	{
		code: "15 08 13 10",
		solution: "pink",
	},
	{
		code: "06 17 04 04 13",
		solution: "green",
	},
	{
		code: "01 11 20 04",
		solution: "blue",
	},
	{
		code: "21 08 14 11 04 19",
		solution: "violet",
	},
];

const randomCode = codes[Math.floor(Math.random() * codes.length)];
const randomCode2 = codes[Math.floor(Math.random() * codes.length)];

const ROCKETS = [
	{
		id: 1,
		type: "decryption",
		content: {
			...randomCode,
		},
	},
	{
		id: 2,
		type: "coding",
		content: {
			instructions: [{}],
		},
	},
	{
		id: 3,
		type: "decryption",
		content: {
			...randomCode2,
		},
	},
	{
		id: 4,
		type: "ds",
		content: {
			files: ["video.mp4", "img.png", "secret.txt", "img.txt", "video.png"],
			solution: {
				video: ["video.mp4"],
				image: ["img.png"],
				text: ["secret.txt", "img.txt"],
			},
		},
	},
] satisfies Rocket[];

shuffle(ROCKETS);

export function SenderScreen() {
	const [selectedRocket, setSelectedRocket] = useState<Rocket | null>(null);
	const [launchedRockets, setLaunchedRockets] = useState<number[]>([]);
	const [showDialog, setShowDialog] = useState(false);

	useEffect(() => {
		const gameChannel = supabase.channel("game");
		gameChannel.send({
			type: "broadcast",
			event: "reset",
			payload: {
				rocketId: "reset",
			},
		});

		gameChannel.on(
			"broadcast",
			{
				event: "reset",
			},
			(_payload) => {
				setLaunchedRockets([]);
				setSelectedRocket(null);
				setShowDialog(false);
			},
		);

		gameChannel.subscribe();
		return () => {
			gameChannel.unsubscribe();
		};
	}, []);

	const handleRocketSelect = (rocket: Rocket) => {
		if (!launchedRockets.includes(rocket.id)) {
			setSelectedRocket(rocket);
			setShowDialog(true);
		}
	};

	const handleCloseDialog = () => {
		setShowDialog(false);
		setSelectedRocket(null);
	};

	let RocketScreen = null;

	switch (selectedRocket?.type) {
		case "coding":
			RocketScreen = (
				<CodingRocketScreen
					setShowDialog={setShowDialog}
					setLaunchedRockets={setLaunchedRockets}
					launchedRockets={launchedRockets}
					selectedRocket={selectedRocket}
					setSelectedRocket={setSelectedRocket}
				/>
			);
			break;
		case "graph":
			RocketScreen = (
				<GraphRocketScreen
					setShowDialog={setShowDialog}
					setLaunchedRockets={setLaunchedRockets}
					launchedRockets={launchedRockets}
					selectedRocket={selectedRocket}
					setSelectedRocket={setSelectedRocket}
				/>
			);
			break;
		case "ds":
			RocketScreen = (
				<DSRocketScreen
					setShowDialog={setShowDialog}
					setLaunchedRockets={setLaunchedRockets}
					launchedRockets={launchedRockets}
					selectedRocket={selectedRocket}
					setSelectedRocket={setSelectedRocket}
				/>
			);
			break;
		case "decryption":
			RocketScreen = (
				<Decryption
					setShowDialog={setShowDialog}
					setLaunchedRockets={setLaunchedRockets}
					launchedRockets={launchedRockets}
					selectedRocket={selectedRocket}
					setSelectedRocket={setSelectedRocket}
				/>
			);
	}

	return (
		<>
			<div
				className="min-h-screen p-8 bg-cover"
				style={{
					backgroundImage: "url(./assets/mars.png)",
					backgroundPosition: "center top",
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
									className={`h-32 rounded-lg backdrop-blur-sm bg-gray-800 flex items-center justify-center ${
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
										<img
											src="./assets/rocket.svg"
											className="w-24 h-24"
											alt="rocket"
										/>
									</motion.div>
								</div>
							</motion.div>
						))}
					</div>
				</div>

				{/* Dialog Overlay */}
				{RocketScreen && showDialog && (
					// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
					<div
						className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
						onClick={handleCloseDialog}
					>
						{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
						<div
							className={`bg-gray-900 rounded-2xl mx-4 overflow-hidden shadow-2xl border border-gray-800 flex flex-col
									 ${selectedRocket?.type === "ds" ? "w-full max-w-6xl" : "w-full max-w-3xl"}`}
							onClick={(e) => e.stopPropagation()}
						>
							<div className="flex justify-between items-center p-4 border-b border-gray-800">
								<h2 className="text-xl font-bold text-gray-200">
									Rocket Challenge
								</h2>
							</div>

							<div
								className={`p-6 flex-grow overflow-auto ${selectedRocket?.type === "ds" ? "max-h-[80vh]" : "max-h-[70vh]"}`}
							>
								{RocketScreen}
							</div>

							<div className="p-4 border-t border-gray-800 flex justify-center gap-4">
								<button
									type="button"
									onClick={handleCloseDialog}
									className="px-6 py-2.5 bg-gray-800 text-gray-400 rounded-lg
										 hover:bg-gray-700 hover:text-gray-200 
										 transition-all duration-200
										 flex items-center gap-2
										 transform hover:scale-105"
								>
									<span>Close Challenge</span>
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<title>Close</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>
						</div>
					</div>
				)}

				<div className="text-white text-center md:fixed mt-2 md:mt-0 left-0 -bottom-4 w-full pb-6">
					Made with &#10084; by{" "}
					<a
						href="https://github.com/MalekD5"
						className="text-teal-500 font-bold underline underline-offset-2"
					>
						Malek Shawahneh
					</a>
				</div>
			</div>
			<Stars />
		</>
	);
}
