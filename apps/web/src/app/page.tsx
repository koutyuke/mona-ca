"use client";

import type { JSX } from "react";

// import Turnstile from "react-turnstile";

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
			{/* <Turnstile
				theme="light"
				sitekey="1x00000000000000000000AA"
				onVerify={token => {
					// biome-ignore lint/suspicious/noConsoleLog: <explanation>
					console.log(token);
				}}
			/> */}
			<a href="http://localhost:8787/auth/federated/discord?redirect-uri=/&platform=web">auth with discord</a>
			<a href="http://localhost:8787/auth/federated/google?redirect-uri=/&platform=web">auth with google</a>
			<button
				onClick={async () => {
					await fetch("http://localhost:8787/auth/logout", {
						method: "POST",
						credentials: "include",
						headers: {
							"mc-platform": "web",
						},
					});
				}}
				type="button"
			>
				logout
			</button>
			<button
				onClick={async () => {
					await fetch("http://localhost:8787/auth/login", {
						method: "POST",
						credentials: "include",
						headers: {
							"mc-platform": "web",
							"cf-connecting-ip": "192.168.50.204",
							"content-type": "application/json",
						},
						body: JSON.stringify({
							cfTurnstileResponse: "XXXX.DUMMY.TOKEN.XXXX",
							email: "hello@example.com",
							password: "passwordPassowrd",
						}),
					});
				}}
				type="button"
			>
				login
			</button>
			<button
				onClick={async () => {
					const res = await fetch("http://localhost:8787/users/me/identities/federated/discord/link/prepare", {
						method: "POST",
						credentials: "include",
						headers: {
							"mc-platform": "web",
						},
					});

					const data: { providerLinkRequestToken: string } = await res.json();

					window.location.href = `http://localhost:8787/users/me/identities/federated/discord/link?platform=web&link-token=${data.providerLinkRequestToken}&redirect-uri=/`;
				}}
				type="button"
			>
				provider-link(discord)
			</button>
			<button
				onClick={async () => {
					const res = await fetch("http://localhost:8787/users/me/identities/federated/google/link/prepare", {
						method: "POST",
						credentials: "include",
						headers: {
							"mc-platform": "web",
						},
					});

					const data: { providerLinkRequestToken: string } = await res.json();

					window.location.href = `http://localhost:8787/users/me/identities/federated/google/link?platform=web&link-token=${data.providerLinkRequestToken}&redirect-uri=/`;
				}}
				type="button"
			>
				provider-link(google)
			</button>
		</main>
	);
}
