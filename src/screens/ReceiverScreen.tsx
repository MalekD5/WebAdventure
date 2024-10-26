import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

type Segment = {
	id: number;
	content: string;
	type: "title" | "subtitle" | "image" | "button";
};

type HandleRocketIncoming = { payload: { rocketId: string | number } };

const SEGMENTS = [
	{ id: 1, content: "Software Engineering", type: "title" },
	{ id: 2, content: "The Hashemite University", type: "subtitle" },
	{
		id: 3,
		content:
			"https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
		type: "image",
	},
	{ id: 4, content: "CLICK ME", type: "button" },
] satisfies Segment[];

export function ReceiverScreen() {
	const [completedSegments, setCompletedSegments] = useState<Segment[]>([]);
	const [incomingRocket, setIncomingRocket] = useState<string | number | null>(
		null,
	);

	useEffect(() => {
		let isProcessing = false;

		const handleRocketIncoming = ({ payload }: HandleRocketIncoming) => {
			const rocketId = payload.rocketId;

			console.log("ReceiverScreen: Rocket incoming event received:", rocketId);

			if (isProcessing) {
				console.log("ReceiverScreen: Ignoring duplicate rocket incoming event");
				return;
			}

			isProcessing = true;
			console.log("ReceiverScreen: Processing rocket incoming event");
			setIncomingRocket(rocketId);

			setTimeout(() => {
				setCompletedSegments((prevSegments) => {
					console.log("ReceiverScreen: Current segments:", prevSegments.length);
					if (prevSegments.length < SEGMENTS.length) {
						console.log("ReceiverScreen: Adding new segment");
						return [...prevSegments, SEGMENTS[prevSegments.length]];
					}
					console.log("ReceiverScreen: All segments completed");
					return prevSegments;
				});
				setIncomingRocket(null);
				isProcessing = false;
				console.log(
					"ReceiverScreen: Finished processing rocket incoming event",
				);
			}, 2000);
		};

		supabase
			.channel("game")
			.on(
				"broadcast",
				{
					event: "rocketIncoming",
				},
				(payload) => {
					handleRocketIncoming(payload as unknown as HandleRocketIncoming);
				},
			)
			.subscribe();

		return () => {};
	}, []);

	const handleGameWin = () => {
		if (completedSegments.length === SEGMENTS.length) {
			alert("Congratulations! You have completed the game!");
		}
	};

	return (
		<div
			className="min-h-screen bg-gradient-to-b from-blue-900 to-indigo-900 p-8 relative overflow-hidden bg-cover"
			style={{ backgroundImage: "url(./assets/earth.png)" }}
		>
			<div className="max-w-4xl mx-auto grid grid-cols-2 gap-8">
				<div className="space-y-8">
					<h1 className="text-4xl font-bold text-white">
						🌍️ Earth Base Station
					</h1>

					<div className="relative h-96 ">
						{incomingRocket && (
							<motion.div
								initial={{ y: -700 }}
								animate={{ y: 500 }}
								transition={{ duration: 2 }}
								className="absolute top-0 left-[40%] -translate-x-1/2 w-20 h-32"
							>
								<img src="./rocket.svg" className="w-24 h-24" alt="rocket" />
							</motion.div>
						)}
					</div>
				</div>

				<div className="bg-gray-800/50 rounded-lg backdrop-blur-sm p-2 ">
					<div className="aspect-video bg-black/50 rounded-lg p-2 space-y-4">
						<div className="flex items-center justify-center">
							<div className="w-96 min-h-[33rem] bg-gray-800 rounded-lg shadow-lg p-4 relative">
								<div className="absolute top-2 left-2 flex space-x-2">
									<div className="w-3 h-3 rounded-full bg-red-500" />
									<div className="w-3 h-3 rounded-full bg-yellow-500" />
									<div className="w-3 h-3 rounded-full bg-green-500" />
								</div>
								<div className="mt-6 text-sm font-mono">
									<p className="text-yellow-600 font-bold text-center text-xl">
										Data from Mars
									</p>
									<div className="border-t-2 border-dashed border-gray-500 w-full my-2" />{" "}
									{completedSegments.map((segment) => (
										<motion.div
											key={segment.id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											className="text-center mt-6 text-sm font-mono"
										>
											{segment.type === "title" && (
												<h1 className="text-3xl font-bold text-white">
													{segment.content}
												</h1>
											)}
											{segment.type === "subtitle" && (
												<h2 className="text-xl text-gray-300">
													{segment.content}
												</h2>
											)}
											{segment.type === "image" && (
												<img
													src={segment.content}
													alt="Coding"
													className="w-full h-48 object-cover rounded-lg"
												/>
											)}
											{segment.type === "button" && (
												<button
													type="button"
													onClick={handleGameWin}
													className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
												>
													{segment.content}
												</button>
											)}
										</motion.div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="text-white text-center md:fixed mt-2 md:mt-0 left-0 bottom-0 w-full pb-6">
				Made with &#10084; by{" "}
				<a
					href="https://github.com/MalekD5"
					className="text-black font-bold underline underline-offset-2"
				>
					Malek Shawahneh
				</a>
			</div>
		</div>
	);
}