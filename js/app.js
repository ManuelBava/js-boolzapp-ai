// DOM REFS
const chatFormEl = document.getElementById('form');
const inputText = chatFormEl.querySelector('input');
const chatBox = document.querySelector('.chat-box');
const contactStatus = document.querySelector('.contact-status');

// DATA
let messages = [];

// CHECK IN THE LOCAL STORAGE
const localMessagesData = JSON.parse(localStorage.getItem('messages-list'));
if (localMessagesData !== null) {
    messages = localMessagesData;
    renderMessageIntoUI();
};

chatFormEl.addEventListener('submit', async e => {
    e.preventDefault();
    // lettura dati dal nostro input usando metodo trim per pulire eventuali spazi indesiderati
    const inputValue = inputText.value.trim();
    if (inputValue === '') {
        focusOnInput();
        return;
    };

    addNewMessage(inputValue, 'sent');

    renderMessageIntoUI();

    // AI INTEGRATION

    // Conversione dati nel formato richiesto dall'API
    const formattedMessages = messages.map(message => {
        return {
            role: message.type === 'sent' ? 'user' : 'model',
            parts: [
                {
                    text: message.text
                }
            ]
        };
    });

    // PRIMO ELEMENTO DELL'ARRAY PER DARE IL PROMPT AL MODELLO 
    formattedMessages.unshift({
        role: 'user',
        parts: [
            {
                text: geminiConf.systemPrompt
            }
        ]
    });

    // CALL AJAX POST
    contactStatus.innerHTML = 'Sta scrivendo...'
    const response = await fetch(`${geminiConf.endpoint}?key=${geminiConf.apiKey}`, {
        method: 'POST',
        body: JSON.stringify({ contents: formattedMessages }),
        headers: {
            'Content-type': 'application/json'
        }
    });

    const data = await response.json();
    const aiMessage = data.candidates[0].content.parts[0].text;
    contactStatus.innerHTML = 'Online 🟢';
    addNewMessage(aiMessage, 'received');
    renderMessageIntoUI();
});


/**Render the message into the UI */
function renderMessageIntoUI() {
    let messageMarkup = '';
    messages.forEach(message => {
        const { text, time, type } = message;
        messageMarkup += ` <div class="chat-row ${type}">
        <div class="chat-message">
        <p>${text}</p>
        <time>${time}</time>
        </div>
        </div>`;
    });
    chatBox.innerHTML = messageMarkup;

    focusOnInput();

    // scorrimento automatico della chat box in base alla lunghezza della chat
    chatBox.scrollTop = chatBox.scrollHeight;
}

/**Reset form */
function focusOnInput() {
    chatFormEl.reset();
    inputText.focus();
};

/**
 * ADD a new message into the messages array collection
 * @param {string} text 
 * @param {string} type 
 */
function addNewMessage(text, type) {
    const message = {
        text,
        time: new Date().toLocaleString(),
        type
    };
    messages.push(message);
    localStorage.setItem('messages-list', JSON.stringify(messages));
}