import { CheckCheckIcon, ShieldX } from "lucide-react";
import { SpinnerIcon } from "./Spinner";
import { tv } from "tailwind-variants";

const variants = tv({
	base: "px-6 py-2 text-white rounded-lg hover:bg-green-600 transition-colors",
	variants: {
		decrypting: {
			waiting: "bg-gray-500",
			check: "bg-yellow-500",
			success: "bg-green-500",
			failed: "bg-red-500",
		},
	},
});

function Icon({
	decrypting,
}: { decrypting: "waiting" | "check" | "success" | "failed" }) {
	switch (decrypting) {
		case "check":
			return <SpinnerIcon />;
		case "success":
			return <CheckCheckIcon />;
		case "failed":
			return <ShieldX />;
		case "waiting":
			return "👾 Check";
	}
}

type ChallengeState = "waiting" | "check" | "success" | "failed";

export default function IconButton({
	state: decrypting,
	onClick,
}: {
	state: ChallengeState;
	onClick: React.MouseEventHandler<HTMLButtonElement>;
}) {
	const variant = variants({ decrypting });

	return (
		<button
			type="submit"
			onClick={onClick}
			className={variant}
			disabled={decrypting !== "waiting"}
		>
			<Icon decrypting={decrypting} />
		</button>
	);
}
