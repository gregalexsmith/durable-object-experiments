let socket;

document.addEventListener('DOMContentLoaded', () => {
	const connectButton = document.getElementById('connect');
	const sendButton = document.getElementById('send');
	const closeButton = document.getElementById('close');
	const output = document.getElementById('output');
	const clientCount = document.createElement('div');
	clientCount.id = 'client-count';
	document.body.insertBefore(clientCount, document.getElementById('ws-controls'));

	function addMessage(message) {
		const messageElement = document.createElement('div');
		messageElement.textContent = message;
		output.appendChild(messageElement);
		output.scrollTop = output.scrollHeight;
	}

	function updateClientCount(count) {
		clientCount.textContent = `Connected Clients: ${count}`;
	}

	connectButton.addEventListener('click', () => {
		if (socket) {
			addMessage('Already connected');
			return;
		}

		socket = new WebSocket(`${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}${location.pathname}/websocket`);

		socket.addEventListener('open', () => {
			addMessage('Connected to WebSocket');
			connectButton.disabled = true;
			sendButton.disabled = false;
			closeButton.disabled = false;
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
			connectButton.disabled = false;
			sendButton.disabled = true;
			closeButton.disabled = true;
			socket = null;
			updateClientCount(0);
		});

		socket.addEventListener('error', (error) => {
			addMessage(`WebSocket error: ${error.message}`);
		});
	});

	sendButton.addEventListener('click', () => {
		if (!socket) {
			addMessage('Not connected');
			return;
		}

		const message = `Hello, server! Time: ${new Date().toISOString()}`;
		socket.send(message);
		addMessage(`Sent: ${message}`);
	});

	closeButton.addEventListener('click', () => {
		if (!socket) {
			addMessage('Not connected');
			return;
		}

		socket.close();
	});

	// Initially disable send and close buttons
	sendButton.disabled = true;
	closeButton.disabled = true;
});
