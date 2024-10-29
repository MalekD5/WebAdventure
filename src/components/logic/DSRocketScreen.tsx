import {
	DndContext,
	DragOverlay,
	type DragStartEvent,
	type DragEndEvent,
	useDroppable,
} from "@dnd-kit/core";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { useState } from "react";
import IconButton from "../IconButton";
import type { Rocket } from "../../types";
import { supabase } from "../../lib/supabase";

interface File {
	id: string;
	name: string;
	type: "video" | "image" | "text" | "uncategorized";
	correctType: "video" | "image" | "text";
}

type FilesState = {
	uncategorized: File[];
	video: File[];
	image: File[];
	text: File[];
};

const initialFiles: File[] = [
	{ id: "1", name: "Document.txt", type: "uncategorized", correctType: "text" },
	{ id: "2", name: "Image.jpg", type: "uncategorized", correctType: "image" },
	{ id: "3", name: "Video.mp4", type: "uncategorized", correctType: "video" },
	{
		id: "5",
		name: "Screenshot.png",
		type: "uncategorized",
		correctType: "image",
	},
];

interface FileContainerProps {
	id: "video" | "image" | "text" | "uncategorized";
	files: File[];
}
const FileContainer: React.FC<FileContainerProps> = ({ id, files }) => {
	const { setNodeRef } = useDroppable({ id });

	const getContainerTitle = (id: FileContainerProps["id"]) => {
		switch (id) {
			case "video":
				return "Video Files";
			case "image":
				return "Image Files";
			case "text":
				return "Text Files";
			default:
				return "Files to Sort";
		}
	};

	return (
		<div
			ref={setNodeRef}
			className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 
                 border border-gray-700/50 shadow-lg text-gray-200
                 w-full min-w-[250px] max-w-sm"
		>
			<h2 className="font-bold mb-4 text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
				{getContainerTitle(id)}
			</h2>
			<div className="space-y-3">
				{files.map((file) => (
					<FileItem key={file.id} id={file.id} name={file.name} />
				))}
			</div>
		</div>
	);
};

interface FileItemProps {
	id: string;
	name: string;
}

const FileItem: React.FC<FileItemProps> = ({ id, name }) => {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className="bg-gray-700/50 p-4 rounded-lg shadow-md cursor-pointer border border-gray-600/50 
                 hover:bg-gray-600/50 transition-all duration-300 hover:scale-[1.02]
                 text-gray-200 flex items-center gap-3"
		>
			<div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
				{name.split(".").pop()?.slice(0, 3)}
			</div>
			{name}
		</div>
	);
};

export default function DSRocketScreen({
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
	const [files, setFiles] = useState<FilesState>({
		uncategorized: initialFiles,
		video: [],
		image: [],
		text: [],
	});
	const [activeId, setActiveId] = useState<string | null>(null);
	const [playerSolution, setPlayerSolution] = useState<Record<string, string>>(
		{},
	);

	const [state, setState] = useState<
		"waiting" | "check" | "success" | "failed"
	>("waiting");

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	};

	const handleDragOver = () => {};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (!over) {
			setActiveId(null);
			return;
		}

		const oldContainer = findContainer(active.id as string);
		const newContainer = over.id as keyof FilesState;

		if (!oldContainer || !newContainer || !(newContainer in files)) {
			setActiveId(null);
			return;
		}

		const movedFile = files[oldContainer].find((file) => file.id === active.id);

		if (movedFile) {
			setFiles((prevFiles) => {
				const sourceContainer = [...prevFiles[oldContainer]];
				const targetContainer = [...(prevFiles[newContainer] || [])];

				const updatedSource = sourceContainer.filter(
					(file) => file.id !== active.id,
				);

				const updatedTarget = [...targetContainer, movedFile];

				return {
					...prevFiles,
					[oldContainer]: updatedSource,
					[newContainer]: updatedTarget,
				};
			});

			setPlayerSolution((prev) => ({
				...prev,
				[movedFile.id]: newContainer,
			}));
		}

		setActiveId(null);
	};

	const findContainer = (id: string): keyof FilesState | undefined => {
		return Object.keys(files).find((key) =>
			files[key as keyof FilesState].some((file) => file.id === id),
		) as keyof FilesState | undefined;
	};

	const checkSolution = () => {
		setState("check");
		const correct = Object.entries(playerSolution).every(
			([fileId, container]) => {
				const file = initialFiles.find((f) => f.id === fileId);
				return file?.correctType === container;
			},
		);

		setTimeout(() => {
			setState(correct ? "success" : "failed");
			if (correct) {
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				setLaunchedRockets([...launchedRockets, selectedRocket!.id]);
				supabase.channel("game").send({
					type: "broadcast",
					event: "rocketIncoming",

					payload: { rocketId: selectedRocket?.id },
				});
				setSelectedRocket(null);
				setTimeout(() => {
					setState("waiting");
					setShowDialog(false);
				}, 500);
			}
		}, 1500);
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-1">
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-8">
					<IconButton onClick={checkSolution} state={state} />
				</div>

				<DndContext
					onDragStart={handleDragStart}
					onDragOver={handleDragOver}
					onDragEnd={handleDragEnd}
				>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<FileContainer id="uncategorized" files={files.uncategorized} />
						<FileContainer id="video" files={files.video} />
						<FileContainer id="image" files={files.image} />
						<FileContainer id="text" files={files.text} />
					</div>
					<DragOverlay>
						{activeId ? (
							<FileItem
								id={activeId}
								name={
									// biome-ignore lint/style/noNonNullAssertion: <explanation>
									files[findContainer(activeId)!].find(
										(file) => file.id === activeId,
									)?.name || ""
								}
							/>
						) : null}
					</DragOverlay>
				</DndContext>
			</div>
		</div>
	);
}
