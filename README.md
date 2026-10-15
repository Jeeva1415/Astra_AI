# ✦ Astra AI

**Astra AI** is a friendly AI tutoring chatbot that explains programming, data analysis, machine learning, and more in simple, beginner-friendly language. It pairs a sleek dark-themed web interface with a FastAPI backend powered by the Groq API.

Astra behaves like a patient mentor with 10 years of teaching experience: it gives step-by-step explanations, practical examples, complete working code, and always ends with a short motivational sign-off.

---

## Features

- 🎓 **Mentor-style teaching**: simple explanations, polite corrections, line-by-line code walkthroughs
- 💬 **Chat interface**: responsive dark UI with a welcome screen, suggestion cards, and a "thinking" animation
- 🗂️ **Chat history**: conversations are saved in the browser (`localStorage`) and listed under *Recent Chats*
- 🗑️ **Chat management**: start a new chat, delete a single chat, or clear all history
- ✍️ **Basic Markdown rendering**: code blocks, inline code, and bold text (HTML-escaped for safety)
- ⌨️ **Keyboard friendly**: `Enter` to send, `Shift + Enter` for a new line
- ⚡ **Fast responses** using Groq's `openai/gpt-oss-120b` model via LangChain

---

## Tech Stack

| Layer    | Technology                                   |
|----------|----------------------------------------------|
| Frontend | HTML, CSS, vanilla JavaScript                |
| Backend  | Python, FastAPI, Uvicorn                     |
| AI       | LangChain (`langchain-groq`), Groq API       |
| Storage  | Browser `localStorage`                       |

---

## Project Structure

```
Astra_AI/
├── backend/
│   ├── app.py            # FastAPI app: /chat endpoint + system prompt
│   ├── requirements.txt  # Python dependencies
│   └── .env              # Your Groq API key (never commit this)
├── frontend/
│   ├── index.html        # Page layout
│   ├── style.css         # Styling and animations
│   └── script.js         # Chat logic, history, and API calls
├── .gitignore
├── LICENSE
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.9+
- A free [Groq API key](https://console.groq.com/keys)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/Astra_AI.git
cd Astra_AI
```

### 2. Set up the backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` folder:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Start the server:

```bash
uvicorn app:app --reload
```

The API runs at `http://127.0.0.1:8000`. Interactive docs are available at `http://127.0.0.1:8000/docs`.

### 3. Run the frontend

Open a second terminal:

```bash
cd frontend
python -m http.server 5500
```

Then visit `http://127.0.0.1:5500`.

You can also use the **Live Server** extension in VS Code on `index.html`.

---

## Dependencies

`backend/requirements.txt`:

```
streamlit
python-dotenv
langchain
langchain-groq
fastapi
uvicorn
langchain-core
```

---

## API Reference

### `GET /`

Health check.

```json
{ "status": "online", "message": "Astra AI backend is running" }
```

### `POST /chat`

Send a message to Astra.

**Request**

```json
{ "message": "Explain Python lists" }
```

**Response**

```json
{ "response": "Astra's answer..." }
```

---

## Configuration

Customize Astra in `backend/app.py`:

- **Personality / teaching style**: edit `SYSTEM_PROMPT`
- **Model**: change the `model` value in `ChatGroq(...)`
- **Creativity**: adjust `temperature`
- **Response length**: adjust `max_tokens`
- **Reasoning depth**: adjust `reasoning_effort`

If your backend runs on a different address, update the URL in `frontend/script.js`:

```js
fetch("http://127.0.0.1:8000/chat", { ... })
```

---

## Known Limitations

- The backend sends only the latest message to the model, so Astra doesn't remember earlier messages in the same chat.
- Chat history lives in the browser only; clearing site data removes it.
- Attachments, Settings, Explore, and Share buttons are UI placeholders.
- CORS is open (`allow_origins=["*"]`) for development. Restrict it before deploying.

---

## Roadmap

- [ ] Send full conversation history for contextual replies
- [ ] Streaming responses
- [ ] Full Markdown rendering with syntax highlighting and a copy-code button
- [ ] Light/dark theme toggle
- [ ] File attachments
- [ ] Deployment guide (Render / Railway / Vercel)

---

## Contributing

Contributions, issues, and feature requests are welcome. Fork the repo and open a pull request.

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

---

*Curiosity is where great things begin.* ✦
