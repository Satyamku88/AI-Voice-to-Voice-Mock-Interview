# 🎙️ AI Voice-to-Voice Mock Interview (Gemini)

An **AI-powered mock interview platform** that conducts **voice-based interviews**, evaluates responses, and provides **real-time feedback with tone & confidence analysis**.  
Perfect for **job seekers** to practice and improve their interview skills with an intelligent, interactive AI interviewer.

---

## 📌 Features

✅ **Voice-based Conversation** – AI asks interview questions, listens to your voice responses, and replies back in voice.  
✅ **Real-time Feedback** – Gives short, constructive feedback after each answer.  
✅ **Tone & Confidence Analysis** – Measures pitch, pitch variation, volume, tempo, and confidence score.  
✅ **Interactive Web UI** – Chat-like interface for smooth and engaging practice sessions.  
✅ **Question Flow** – Dynamic follow-up questions based on your responses.  

---

## 🛠️ Tech Stack

**Frontend**  
- HTML5, CSS3, JavaScript  
- Fetch API for async communication  

**Backend**  
- Python (Flask)  
- [SpeechRecognition](https://pypi.org/project/SpeechRecognition/) – Speech-to-Text  
- [gTTS](https://pypi.org/project/gTTS/) – Text-to-Speech  
- [Parselmouth](https://pypi.org/project/praat-parselmouth/) & [Librosa](https://pypi.org/project/librosa/) – Audio Analysis  
- [FFmpeg](https://ffmpeg.org/) – Audio format conversion  
- [Google Generative AI (Gemini)](https://ai.google/) – AI-generated responses  

---

## 📂 Project Structure

```

AI-Voice-to-Voice-Mock-Interview/
│
├── app.py                  # Flask backend server
├── templates/
│   └── index.html          # Frontend UI
├── static/
│   ├── css/style.css       # Stylesheet
│   ├── js/script.js        # Frontend logic
│   ├── images/             # Bot & user icons
│
├── requirements.txt        # Python dependencies
└── README.md               # Documentation

````

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/YourUsername/AI-Voice-to-Voice-Mock-Interview.git
cd AI-Voice-to-Voice-Mock-Interview
````

### 2️⃣ Create Virtual Environment

```bash
python -m venv venv
```

Activate:

```bash
venv\Scripts\activate   # Windows
source venv/bin/activate  # Mac/Linux
```

### 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

### 4️⃣ Install FFmpeg

Download from: [https://ffmpeg.org/download.html](https://ffmpeg.org/download.html)
Add FFmpeg to your **PATH** so it works in terminal.

### 5️⃣ Add Google Gemini API Key

Edit `app.py`:

```python
genai.configure(api_key="YOUR_API_KEY")
```

### 6️⃣ Run the App

```bash
python app.py
```

The app will be live at:
➡ **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 🎯 How It Works

1. **AI Voice Question** – AI asks you a job interview question.
2. **User Response** – You speak your answer into the microphone.
3. **Speech-to-Text** – Your audio is converted into text.
4. **Tone Analysis** – Measures pitch, variation, volume, tempo & confidence.
5. **AI Feedback** – Gemini AI generates constructive feedback & follow-up question.
6. **Text-to-Speech** – AI response is played back in natural voice.

---

## 📊 Example Tone Analysis Output

```json
{
  "avg_pitch": 180.5,
  "pitch_var": 15.2,
  "volume": 0.0456,
  "tempo": 110.5,
  "confidence_score": 78.5
}
```

---

## 🚀 Deployment

You can deploy this Flask app to:

* **Heroku**
* **Render**
* **Railway**
* **Vercel (serverless Flask)**

**Tips:**

* Set environment variables for `GOOGLE_API_KEY`.
* Ensure FFmpeg is installed on the deployment server.

---

## 📸 Screenshots

**Interview UI**
![Chat UI](static/images/screenshot1.png)

**Tone Analysis**
![Tone Analysis](static/images/screenshot2.png)

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 💡 Future Improvements

* 🌍 Multi-language support
* 📑 Detailed PDF report after interview
* 📹 Video-based interview with face & gesture analysis
* 🔗 Integration with LinkedIn for resume feedback

---

## 👨‍💻 Author

**Satyam Kumar Kasyap**
📧 Email: *[your-email@example.com](mailto:satyamku88@gmail.com)*
🔗 GitHub: [Your GitHub Profile](https://github.com/Satyamku88)

---

