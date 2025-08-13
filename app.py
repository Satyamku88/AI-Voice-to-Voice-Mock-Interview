from flask import Flask, request, jsonify, send_file, render_template
import os
import tempfile
import subprocess
import speech_recognition as sr
import parselmouth
import librosa
import numpy as np
from gtts import gTTS
import google.generativeai as genai

app = Flask(__name__)

# Homepage
@app.route("/")
def index():
    return render_template("index.html")

# Configure Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("No GOOGLE_API_KEY set for Flask application")
genai.configure(api_key=api_key)

recognizer = sr.Recognizer()

questions = [
    "Tell me about yourself.",
    "Why should we hire you?",
    "Describe a challenge you faced and how you overcame it."
]
question_index = 0


def analyze_audio(file_path):
    snd = parselmouth.Sound(file_path)
    pitch_data = snd.to_pitch()
    pitch_values = pitch_data.selected_array['frequency']
    pitch_values = pitch_values[pitch_values != 0]

    avg_pitch = np.mean(pitch_values) if len(pitch_values) > 0 else 0
    pitch_var = np.std(pitch_values) if len(pitch_values) > 0 else 0

    y, sr_rate = librosa.load(file_path)
    rms = np.mean(librosa.feature.rms(y=y))
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr_rate)
    tempo = float(tempo)

    confidence_score = (
        min(avg_pitch / 200, 1) * 0.3 +
        min(pitch_var / 50, 1) * 0.3 +
        min(rms * 10, 1) * 0.4
    ) * 100

    return {
        "avg_pitch": float(np.round(avg_pitch, 2)),
        "pitch_var": float(np.round(pitch_var, 2)),
        "volume": float(np.round(rms, 4)),
        "tempo": float(np.round(tempo, 2)),
        "confidence_score": float(np.round(confidence_score, 1))
    }


@app.route("/api/answer", methods=["POST"])
def process_answer():
    global question_index

    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]

    temp_dir = tempfile.gettempdir()
    input_webm = os.path.join(temp_dir, "user_answer.webm")
    output_wav = os.path.join(temp_dir, "user_answer.wav")

    audio_file.save(input_webm)

    subprocess.run(
        ["ffmpeg", "-y", "-i", input_webm, output_wav],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )

    with sr.AudioFile(output_wav) as source:
        audio_data = recognizer.record(source)
        try:
            transcript = recognizer.recognize_google(audio_data)
        except sr.UnknownValueError:
            transcript = "[Could not understand audio]"

    tone_data = analyze_audio(output_wav)

    prompt = f"""
    Interview question: {questions[question_index]}
    User answer: {transcript}
    Tone analysis: {tone_data}

    Provide:
    - Short feedback on answer
    - Next question (if any)
    """

    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    ai_text = response.text.strip()

    tts = gTTS(ai_text)
    tts_path = os.path.join(temp_dir, "ai_response.mp3")
    tts.save(tts_path)

    current_question = questions[question_index]
    question_index = (question_index + 1) % len(questions)

    return jsonify({
        "transcript": transcript,
        "feedback": ai_text,
        "question": str(current_question),
        "tone": {k: float(v) for k, v in tone_data.items()},
        "ai_audio": os.path.basename(tts_path)  # Send filename, not full path
    })




@app.route("/api/audio/<filename>")
def get_audio(filename):
    return send_file(os.path.join(tempfile.gettempdir(), filename), mimetype="audio/mpeg")


if __name__ == "__main__":
    app.run(debug=True)
