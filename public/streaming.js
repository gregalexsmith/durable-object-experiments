/**
 * Helper to stream responses from a form submission to a target element.
 *
 * Usage:
 * <form action="/stream" method="post" data-stream-target="#responseTarget">
 *   <input type="text" name="prompt" />
 *   <button type="submit">Submit</button>
 * </form>
 *
 * <div id="responseTarget"></div>
 */
function setupStreamingForms() {
	const forms = document.querySelectorAll('[data-stream-target]');

	forms.forEach((form) => {
		const targetSelector = form.dataset.streamTarget;
		const target = document.querySelector(targetSelector);

		if (!target) {
			console.error(`Target not found for selector: ${targetSelector}`);
			return;
		}

		form.addEventListener('submit', async (event) => {
			event.preventDefault();

			const formData = new FormData(form);
			const url = form.action;
			const method = form.method.toUpperCase();

			target.innerHTML = '';

			try {
				const response = await fetch(url, {
					method,
					body: method === 'POST' ? formData : undefined,
					headers: {
						Accept: 'text/event-stream',
					},
				});

				const reader = response.body.getReader();
				const decoder = new TextDecoder();

				while (true) {
					const { done, value } = await reader.read();

					if (done) break;
					const chunk = decoder.decode(value, { stream: true });
					target.innerHTML += chunk;
				}
			} catch (error) {
				console.error('Streaming error:', error);
				target.innerHTML = 'An error occurred while streaming the response.';
			}
		});
	});
}

document.addEventListener('DOMContentLoaded', setupStreamingForms);
