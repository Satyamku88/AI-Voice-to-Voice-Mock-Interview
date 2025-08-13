/* main UI logic:
 - start webcam feed on load
 - allow record -> stop
 - send audio blob to /api/respond (expects JSON { transcript, feedback, question? })
 - then request TTS for bot feedback via /api/tts and play it
 - animate bot while TTS plays
*/

const localVideo = document.getElementById('localVideo');
const recordBtn = document.getElementById('recordBtn');
const recIndicator = document.getElementById('rec-indicator');

let mediaRecorder;
let audioChunks = [];
let isRecording = false;

// start webcam
async function startWebcam(){
  try{
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640 }, audio: false });
    localVideo.srcObject = stream;
  }catch(e){
    console.warn("Camera access denied or not available:", e);
    document.getElementById('cam-status').textContent = 'Camera unavailable';
  }
}
startWebcam();

// helper: append message to chat
function addChat(text, who='bot', meta=''){
  const wrapper = document.createElement('div');
  wrapper.className = `chat-message ${who}`;

  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  const txt = document.createElement('div');
  txt.className = 'bubble-text';
  txt.textContent = text;

  const metaEl = document.createElement('div');
  metaEl.className = 'bubble-meta';
  metaEl.textContent = meta;

  bubble.appendChild(txt);
  if(meta) bubble.appendChild(metaEl);

  const avatar = document.createElement('img');
  avatar.className = 'bubble-avatar';
  avatar.src = who === 'bot' ? '/static/images/bot-full.png' : '/static/images/user.png';

  wrapper.appendChild(bubble);
  wrapper.appendChild(avatar);
  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;
  return wrapper;
}

// recording handlers
recordBtn.addEventListener('click', async () => {
  if (!isRecording) {
    // Start recording
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

      mediaRecorder.onstop = async () => {
        recIndicator.textContent = 'Processing...';
        const blob = new Blob(audioChunks, { type: audioChunks[0].type || 'audio/webm' });
        const form = new FormData();
        form.append('audio', blob, 'answer.webm');

        // show temporary user bubble
        const userPlaceholder = addChat('... (processing your answer)', 'user', 'You');

        // send audio to backend
       try {
  const resp = await fetch('/api/answer', { method: 'POST', body: form });
  if (!resp.ok) {
    userPlaceholder.querySelector('.bubble-text').textContent = 'Error: server error';
    recIndicator.textContent = '● Not recording';
    isRecording = false;
    recordBtn.textContent = '🎙️ Record Answer';
    return;
  }
  const data = await resp.json(); // expect JSON: { transcript, feedback, ai_audio }
  
  // replace placeholder with actual transcript
  userPlaceholder.querySelector('.bubble-text').textContent = data.transcript || 'No transcript';

  // add bot feedback in chat
  addChat(data.feedback || 'No feedback provided', 'bot', 'Feedback');

  // **** CORRECTED PART ****
  // If the server sent back an audio filename, play it directly
  if (data.ai_audio) {
    const audioUrl = `/api/audio/${data.ai_audio}`;
    const audio = new Audio(audioUrl);
    // Add visual indicator while bot is "speaking"
    const botImg = document.getElementById('botImg');
    const botStatus = document.getElementById('botStatus');
    botImg.classList.add('bot-speaking');
    botStatus.textContent = 'Speaking...';
    audio.play();
    audio.onended = () => {
        // Remove visual indicator when done
        botImg.classList.remove('bot-speaking');
        botStatus.textContent = 'Idle';
    };
  }
  
} catch (err) {
  console.error('Error sending audio', err);
  userPlaceholder.querySelector('.bubble-text').textContent = 'Error: network';
} finally {
  recIndicator.textContent = '● Not recording';
  isRecording = false;
  recordBtn.textContent = '🎙️ Record Answer';
}
      };

      mediaRecorder.start();
      isRecording = true;
      recordBtn.textContent = '⏹ Stop Recording';
      recIndicator.textContent = '● Recording...';
    } catch (e) {
      console.error('Could not start recording', e);
      alert('Microphone access is required.');
    }
  } else {
    // Stop recording
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    isRecording = false;
    recordBtn.textContent = '🎙️ Record Answer';
    recIndicator.textContent = '● Not recording';
  }
});

function addMessage(sender, text) {
    let msg = document.createElement("div");
    msg.classList.add("message", sender);

    if (sender === "bot") {
        msg.classList.add("bot-reply"); // highlight bot messages
    }

    msg.textContent = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// play TTS by calling /api/tts with JSON { text }
async function playTTS(text){
  if (!text) return;
  try {
    // show bot speaking visual
    botImg.classList.add('bot-speaking');
    botStatus.classList.add('speaking');
    botStatus.textContent = 'Speaking...';

    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) {
      console.warn('TTS failed');
      botImg.classList.remove('bot-speaking');
      botStatus.classList.remove('speaking');
      botStatus.textContent = 'Idle';
      return;
    }
    const audioBlob = await res.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    ttsPlayer.src = audioUrl;
    ttsPlayer.hidden = false;
    await ttsPlayer.play();
    // when finished
    ttsPlayer.onended = () => {
      botImg.classList.remove('bot-speaking');
      botStatus.classList.remove('speaking');
      botStatus.textContent = 'Idle';
      URL.revokeObjectURL(audioUrl);
    };
  } catch (e) {
    console.error('TTS playback error', e);
    botImg.classList.remove('bot-speaking');
    botStatus.classList.remove('speaking');
    botStatus.textContent = 'Idle';
  }
}
// initial bot status
botStatus.textContent = 'Idle';