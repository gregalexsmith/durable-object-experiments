document.addEventListener('DOMContentLoaded', () => {
	let socket;
	let clientName;
	const output = document.querySelector('[data-ws-output]');
	const clientCount = document.querySelector('[data-ws-client-count]');
	const connectButton = document.querySelector('[data-ws-connect]');
	const sendButton = document.querySelector('[data-ws-send]');
	const closeButton = document.querySelector('[data-ws-close]');
	const messageInput = document.querySelector('[data-ws-input]');

	function addMessage(message) {
		if (output) {
			const messageElement = document.createElement('div');
			messageElement.textContent = message;
			output.appendChild(messageElement);
			output.scrollTop = output.scrollHeight;
		}
	}

	function updateClientCount(count) {
		if (clientCount) {
			clientCount.textContent = `Connected Clients: ${count}`;
		}
	}

	function updateButtonStates(isConnected) {
		if (connectButton) connectButton.disabled = isConnected;
		if (sendButton) sendButton.disabled = !isConnected;
		if (closeButton) closeButton.disabled = !isConnected;
		if (messageInput) messageInput.disabled = !isConnected;
	}

	if (connectButton) {
		connectButton.addEventListener('click', () => {
			if (socket) {
				addMessage('Already connected');
				return;
			}

			clientName = prompt('Enter your name:');
			if (!clientName) {
				addMessage('Connection cancelled. Name is required.');
				return;
			}

			socket = new WebSocket(`${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}${location.pathname}/websocket`);

			socket.addEventListener('open', () => {
				addMessage('Connected to WebSocket');
				updateButtonStates(true);
				// Send the client's name as the first message
				socket.send(clientName);
			});

			socket.addEventListener('message', (event) => {
				addMessage(`Received: ${event.data}`);
				const match = event.data.match(/Total clients: (\d+)/);
				if (match) {
					updateClientCount(match[1]);
				}
			});

			socket.addEventListener('close', () => {
				addMessage('WebSocket connection closed');
				updateButtonStates(false);
				socket = null;
				updateClientCount(0);
			});

			socket.addEventListener('error', (error) => {
				addMessage(`WebSocket error: ${error.message}`);
			});
		});
	}

	if (sendButton && messageInput) {
		sendButton.addEventListener('click', () => {
			if (!socket) {
				addMessage('Not connected');
				return;
			}

			const message = messageInput.value.trim();
			if (message) {
				socket.send(message);
				addMessage(`Sent: ${message}`);
				messageInput.value = '';
			}
		});

		// Allow sending message with Enter key
		messageInput.addEventListener('keypress', (event) => {
			if (event.key === 'Enter' && !event.shiftKey) {
				event.preventDefault();
				sendButton.click();
			}
		});
	}

	if (closeButton) {
		closeButton.addEventListener('click', () => {
			if (!socket) {
				addMessage('Not connected');
				return;
			}

			socket.close();
		});
	}

	// Initially disable send, close buttons, and input
	updateButtonStates(false);
});
