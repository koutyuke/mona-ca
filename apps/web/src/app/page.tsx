"use client";

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
			<a href="http://localhost:8787/auth/discord/signup?redirect-uri=/&client-type=web">signup with discord</a>
			<a href="http://localhost:8787/auth/discord/login?redirect-uri=/&client-type=web">login with discord</a>
			<a href="http://localhost:8787/auth/google/signup?redirect-uri=/&client-type=web">signup with google</a>
			<a href="http://localhost:8787/auth/google/login?redirect-uri=/&client-type=web">login with google</a>
			<button
				type="button"
				onClick={async () => {
					await fetch("http://localhost:8787/auth/logout", {
						method: "POST",
						credentials: "include",
						headers: {
							"mc-client-type": "web",
						},
					});
				}}
			>
				logout
			</button>
			<button
				type="button"
				onClick={async () => {
					await fetch("http://localhost:8787/auth/login", {
						method: "POST",
						credentials: "include",
						headers: {
							"mc-client-type": "web",
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
			>
				login
			</button>
			<button
				type="button"
				onClick={async () => {
					await fetch("http://localhost:8787/auth/email-verification", {
						method: "POST",
						credentials: "include",
						headers: {
							"mc-client-type": "web",
							"cf-connecting-ip": "192.168.50.204",
							"content-type": "application/json",
						},
						body: JSON.stringify({
							email: null,
						}),
					});
				}}
			>
				email-verification-request
			</button>
			<button
				type="button"
				onClick={async () => {
					await fetch("http://localhost:8787/auth/email-verification/confirm", {
						method: "POST",
						credentials: "include",
						headers: {
							"mc-client-type": "web",
							"cf-connecting-ip": "192.168.50.204",
							"content-type": "application/json",
						},
						body: JSON.stringify({
							code: "65457465",
							emailVerificationSessionToken: "s2jzqjxozepxy2geveoeh4nszac2o2xwafjnomfzoixqn76teqlq",
						}),
					});
				}}
			>
				email-verification-confirm
			</button>
			<button
				type="button"
				onClick={async () => {
					const res = await fetch("http://localhost:8787/auth/discord/link", {
						method: "GET",
						credentials: "include",
						headers: {
							"mc-client-type": "web",
						},
					});

					const data: { url: string } = await res.json();

					window.location.href = data.url;
				}}
			>
				account-link
			</button>
			<button
				type="button"
				onClick={async () => {
					const res = await fetch("http://localhost:8787/auth/association/preview", {
						method: "POST",
						credentials: "include",
						headers: {
							"mc-client-type": "web",
							"content-type": "application/json",
						},
						body: JSON.stringify({}),
					});

					const data = await res.json();

					console.log(data);
				}}
			>
				account-association-preview
			</button>
		</main>
	);
}
