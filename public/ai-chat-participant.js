document.addEventListener('DOMContentLoaded', () => {
	console.log('DOMContentLoaded');
	const addAiParticipantButton = document.querySelector('[data-add-ai-participant]');
	if (addAiParticipantButton) {
		addAiParticipantButton.addEventListener('click', () => {
			console.log('addAiParticipantButton clicked');
			fetch(`/ai-chat-participant/add-ai-participant`, { method: 'POST' }).then(() => {
				// location.reload();
				console.log('AI participant added');
			});
		});
	} else {
		console.log('addAiParticipantButton not found');
	}
});
