import { Routes, Route, Link } from "react-router-dom";
import { Rocket, Monitor } from "lucide-react";
import { SenderScreen } from "./screens/SenderScreen";
import { ReceiverScreen } from "./screens/ReceiverScreen";

function App() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
			<Routes>
				<Route path="/" element={<HomeScreen />} />
				<Route path="/sender" element={<SenderScreen />} />
				<Route path="/receiver" element={<ReceiverScreen />} />
			</Routes>
		</div>
	);
}

function HomeScreen() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center space-y-12 p-8">
			<h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
				Web Development Adventure
			</h1>
			<div className="flex gap-8">
				<Link
					to="/sender"
					className="group relative px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
				>
					<div className="flex items-center gap-3">
						<Rocket className="w-6 h-6" />
						<span className="text-xl font-semibold">Sender</span>
					</div>
					<div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300" />
				</Link>
				<Link
					to="/receiver"
					className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
				>
					<div className="flex items-center gap-3">
						<Monitor className="w-6 h-6" />
						<span className="text-xl font-semibold">Receiver</span>
					</div>
					<div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300" />
				</Link>
			</div>
			<p className="text-gray-400 max-w-md text-center mt-8">
				Choose your role in this educational adventure. Learn web development
				and basic cryptography concepts through an interactive game!
			</p>
			<div className="text-white text-center md:fixed mt-2 md:mt-0 left-0 bottom-0 w-full pb-6">
				Made with &#10084; by{" "}
				<a
					href="https://github.com/MalekD5"
					className="text-teal-500 underline underline-offset-2"
				>
					Malek Shawahneh
				</a>
			</div>
		</div>
	);
}

export default App;
