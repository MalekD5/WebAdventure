import React, { useState } from "react";
import { DndContext, type DragEndEvent, closestCenter } from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Rocket } from "../../types";
import IconButton from "../IconButton";
import { supabase } from "../../lib/supabase";

interface Instruction {
	id: number;
	text: string;
	isCorrect: boolean;
}

function SortableItem({ id, text }: { id: number; text: string }) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<li
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className="bg-gray-800 p-4 border border-gray-700 rounded shadow-lg hover:bg-gray-700 cursor-pointer text-gray-200"
		>
			{text}
		</li>
	);
}

function shuffle(array: object[]) {
	array.sort(() => Math.random() - 0.5);
}

export default function CodingRocketScreen({
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
	const instructions = [
		{ id: 2, text: "Check Fuel Tank", isCorrect: false },
		{ id: 1, text: "Connect fuel hose", isCorrect: false },
		{ id: 4, text: "Start pumpin fuel", isCorrect: false },
		{ id: 3, text: "Monitor fuel", isCorrect: false },
	];

	shuffle(instructions);

	const [items, setItems] = React.useState<Instruction[]>(instructions);

	const correctOrder = [2, 1, 4, 3]; // Connect -> Check -> Initialize -> Monitor

	const [state, setState] = useState<
		"waiting" | "check" | "success" | "failed"
	>("waiting");

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			setItems((items) => {
				const oldIndex = items.findIndex((item) => item.id === active.id);
				const newIndex = items.findIndex((item) => item.id === over.id);
				return arrayMove(items, oldIndex, newIndex);
			});
		}
	};

	const checkSolution = () => {
		setState("check");
		let isCorrect = false;
		setItems((prevItems) => {
			const result = prevItems.map((item, index) => ({
				...item,
				isCorrect: correctOrder[index] === item.id,
			}));
			isCorrect = result.every((item) => item.isCorrect);
			return result;
		});

		setTimeout(() => {
			setState(isCorrect ? "success" : "failed");

			if (isCorrect) {
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
			setTimeout(() => {
				setState("waiting");
			}, 500);
		}, 1000);
	};

	return (
		<div className="min-h-screen bg-gray-900 p-8">
			<div className="max-w-2xl mx-auto">
				<IconButton onClick={checkSolution} state={state} />

				<DndContext
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
				>
					<SortableContext items={items} strategy={verticalListSortingStrategy}>
						<ul className="space-y-3">
							{items.map((item) => (
								<div key={item.id} className="relative">
									<SortableItem id={item.id} text={item.text} />
								</div>
							))}
						</ul>
					</SortableContext>
				</DndContext>
			</div>
		</div>
	);
}
