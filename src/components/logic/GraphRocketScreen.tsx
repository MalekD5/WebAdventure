import type React from "react";
import { useState, useRef, useCallback } from "react";
import IconButton from "../IconButton";
import type { Rocket } from "../../types";
import { supabase } from "../../lib/supabase";

interface Node {
	id: number;
	x: number;
	y: number;
	label: string;
}

interface Line {
	start: Node;
	end: Node;
}

export default function GraphRocketScreen({
	setShowDialog,
	setLaunchedRockets,
	launchedRockets,
	selectedRocket,
	setSelectedRocket,
}: {
	setShowDialog: React.Dispatch<React.SetStateAction<boolean>>;
	setLaunchedRockets: React.Dispatch<React.SetStateAction<number[]>>;
	launchedRockets: number[];
	selectedRocket: Rocket | null;
	setSelectedRocket: React.Dispatch<React.SetStateAction<Rocket | null>>;
}) {
	const [nodes, setNodes] = useState<Node[]>([
		{ id: 1, x: 100, y: 100, label: "Mars" },
		{ id: 2, x: 300, y: 100, label: "Mars Satallite" },
		{ id: 3, x: 200, y: 100, label: "Earth Satallite" },
		{ id: 4, x: 200, y: 250, label: "Earth" },
	]);

	const [lines, setLines] = useState<Line[]>([]);
	const [dragging, setDragging] = useState<{
		id: number;
		offsetX: number;
		offsetY: number;
	} | null>(null);
	const [connecting, setConnecting] = useState<Node | null>(null);

	const svgRef = useRef<SVGSVGElement>(null);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent<SVGCircleElement>, node: Node) => {
			const circle = e.currentTarget;
			const bbox = circle.getBoundingClientRect();
			const offsetX = e.clientX - bbox.left;
			const offsetY = e.clientY - bbox.top;
			setDragging({ id: node.id, offsetX, offsetY });
		},
		[],
	);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent<SVGSVGElement>) => {
			if (dragging && svgRef.current) {
				const svgRect = svgRef.current.getBoundingClientRect();
				const newX = e.clientX - svgRect.left - dragging.offsetX;
				const newY = e.clientY - svgRect.top - dragging.offsetY;

				setNodes((prevNodes) =>
					prevNodes.map((node) =>
						node.id === dragging.id ? { ...node, x: newX, y: newY } : node,
					),
				);

				setLines((prevLines) =>
					prevLines.map((line) => ({
						start:
							line.start.id === dragging.id
								? { ...line.start, x: newX, y: newY }
								: line.start,
						end:
							line.end.id === dragging.id
								? { ...line.end, x: newX, y: newY }
								: line.end,
					})),
				);
			}

			if (connecting && svgRef.current) {
				const svgRect = svgRef.current.getBoundingClientRect();
				const endX = e.clientX - svgRect.left;
				const endY = e.clientY - svgRect.top;

				const hoveredNode = nodes.find(
					(node) =>
						Math.abs(node.x - endX) < 20 &&
						Math.abs(node.y - endY) < 20 &&
						node.id !== connecting.id,
				);

				if (hoveredNode) {
					setLines((prevLines) => [
						...prevLines,
						{ start: connecting, end: hoveredNode },
					]);
					setConnecting(null);
				}
			}
		},
		[dragging, connecting, nodes],
	);

	const handleMouseUp = useCallback(() => {
		setDragging(null);
		setConnecting(null);
	}, []);

	const handleConnectStart = useCallback((node: Node) => {
		setConnecting(node);
	}, []);

	const [state, setState] = useState<
		"waiting" | "check" | "success" | "failed"
	>("waiting");

	const checkSolution = () => {
		setState("check");

		setTimeout(() => {
			// Convert lines to pairs of node IDs
			const currentPairs = lines.map((line) => {
				// Sort the IDs to make comparison direction-agnostic
				const pair = [line.start.id, line.end.id].sort();
				return `${pair[0]},${pair[1]}`;
			});

			// Define correct pairs (sorted)
			const correctPairs = ["1,2", "2,3", "3,4"];

			// Check if we have exactly the right number of connections
			if (currentPairs.length !== correctPairs.length) {
				setState("failed");
				return;
			}

			// Check if all required pairs exist (in either direction)
			const isValid = correctPairs.every((pair) => currentPairs.includes(pair));

			setState(isValid ? "success" : "failed");
			setTimeout(() => {
				setState("waiting");
				if (isValid) {
					// biome-ignore lint/style/noNonNullAssertion: <explanation>
					setLaunchedRockets([...launchedRockets, selectedRocket!.id]);
					supabase.channel("game").send({
						type: "broadcast",
						event: "rocketIncoming",

						payload: { rocketId: selectedRocket?.id },
					});
					setSelectedRocket(null);
					setShowDialog(false);
				}
			}, 500);
		}, 1000);
	};

	const clearGraph = () => {
		setLines([]);
		setState("waiting");
	};

	return (
		<div className="flex flex-col items-center gap-4 min-h-screen bg-gray-900 p-8 pt-0">
			<div className="flex gap-4">
				<IconButton onClick={checkSolution} state={state} />
				<button
					type="button"
					onClick={clearGraph}
					className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
				>
					Clear
				</button>
			</div>

			<div className="w-full flex items-center justify-center">
				<svg
					ref={svgRef}
					className="w-[800px] h-[500px] border border-gray-700 bg-gray-800 rounded-lg"
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUp}
					onMouseLeave={handleMouseUp}
				>
					<title>Refueling System Graph</title>
					{/* Grid pattern for background */}
					<pattern
						id="grid"
						width="50"
						height="50"
						patternUnits="userSpaceOnUse"
					>
						<path
							d="M 50 0 L 0 0 0 50"
							fill="none"
							stroke="rgba(255,255,255,0.1)"
							strokeWidth="0.5"
						/>
					</pattern>
					<rect width="100%" height="100%" fill="url(#grid)" />

					{/* Connection lines */}
					{lines.map((line, index) => (
						<g key={index}>
							<line
								x1={line.start.x}
								y1={line.start.y}
								x2={line.end.x}
								y2={line.end.y}
								stroke="#4F46E5"
								strokeWidth="3"
								className="transition-all duration-300"
							/>
							{/* Arrow marker */}
							<polygon
								points={`${line.end.x},${line.end.y} 
										 ${line.end.x - 10},${line.end.y - 5} 
										 ${line.end.x - 10},${line.end.y + 5}`}
								fill="#4F46E5"
								transform={`rotate(${
									Math.atan2(
										line.end.y - line.start.y,
										line.end.x - line.start.x,
									) *
									(180 / Math.PI)
								}, ${line.end.x}, ${line.end.y})`}
							/>
						</g>
					))}

					{/* Nodes */}
					{nodes.map((node) => (
						<g key={node.id}>
							{/* Main circle */}
							<circle
								cx={node.x}
								cy={node.y}
								r="30"
								fill="#3B82F6"
								onMouseDown={(e) => handleMouseDown(e, node)}
								className="cursor-move transition-all duration-300 hover:fill-blue-400"
								filter="url(#glow)"
							/>

							{/* Node label */}
							<text
								x={node.x}
								y={node.y}
								textAnchor="middle"
								dy=".3em"
								fill="white"
								className="text-sm font-semibold pointer-events-none"
							>
								{node.label}
							</text>

							{/* Connection point */}
							<circle
								cx={node.x}
								cy={node.y + 25}
								r="12"
								fill="#EF4444"
								onMouseDown={() => handleConnectStart(node)}
								className="cursor-pointer transition-all duration-300 hover:fill-red-400 sie"
							/>
						</g>
					))}

					{/* Active connection line */}
					{connecting && (
						<line
							x1={connecting.x}
							y1={connecting.y}
							x2={connecting.x}
							y2={connecting.y}
							stroke="#6366F1"
							strokeWidth="2"
							strokeDasharray="5,5"
							className="pointer-events-none"
						/>
					)}

					{/* Glow filter */}
					<defs>
						<filter id="glow">
							<feGaussianBlur stdDeviation="2" result="coloredBlur" />
							<feMerge>
								<feMergeNode in="coloredBlur" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>
					</defs>
				</svg>
			</div>
		</div>
	);
}
