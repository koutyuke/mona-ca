"use client";

export default function Page(): JSX.Element {
	return (
		<main
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				height: "100svh",
				width: "100svw",
			}}
		>
			{/* <a href="http://localhost:8787/auth/web/signup/discord?gender=man&redirect-url=/">signup with discord</a>
			<a href="http://localhost:8787/auth/web/login/discord?redirect-url=/">login with discord</a>
			<button
				type="button"
				onClick={async () => {
					await fetch("http://localhost:8787/auth/web/logout", {
						method: "POST",
						credentials: "include",
					});
				}}
			>
				logout
			</button> */}
		</main>
	);
}
