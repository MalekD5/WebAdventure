export type Rocket =
	| {
			id: number;
			type: "decryption";
			content: {
				solution: string;
				code: string;
			};
	  }
	| {
			id: number;
			type: "coding";
			content: {
				instructions: object[];
			};
	  }
	| {
			id: number;
			type: "graph";
			content: {
				nodes: { id: number; name: string }[];
				solution: [number, number][];
			};
	  }
	| {
			id: number;
			type: "ds";
			content: {
				files: string[];
				solution: {
					video: string[];
					image: string[];
					text: string[];
				};
			};
	  };
