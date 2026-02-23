# Alpha Core AI - Advanced Features

## ✨ New Features Added

### 1. **Enhanced Code & Math Rendering**

#### Code Blocks
- **Syntax Highlighting**: All code blocks are highlighted with language-specific colors
- **Language Detection**: Automatically detects language from code block markers (\`\`\`language)
- **Copy Button**: One-click copy button for all code blocks
- **Supported Languages**: Python, JavaScript, TypeScript, C++, C#, Java, SQL, and more
- **Scrollable**: Large code blocks are horizontally scrollable

**Usage in Chat:**
\`\`\`python
def hello_world():
    print("Hello, World!")
\`\`\`

#### Math Expressions
- **Inline Math**: Use `$expression$` for inline mathematical notation
- **Block Math**: Use `$$expression$$` for display-style equations
- **KaTeX Support**: Full LaTeX formatting support
- **Auto-rendering**: Math expressions are automatically rendered when detected

**Usage in Chat:**
- Inline: "The formula is $E = mc^2$ which shows..."
- Block: $$\int_0^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$

---

## 🧠 Intelligent Models Available

### Speed/Lightweight Models (Fast Response)
- **Qwen 0.5B**: Ultra-lightweight, great for quick queries
- **TinyLlama 1.1B**: Small but capable general model

### Programming Specialists
- **Qwen Coder 1.5B**: Lightweight code generation
- **Phi 3.5 Mini**: Microsoft's intelligent compact coder
- **DeepSeek Coder 6.7B**: Advanced code generation and analysis (2.3 GB)
- **OpenCoder 8B**: Enterprise-grade code generation (2.3 GB)

### General Intelligence
- **Mistral 7B**: Powerful reasoning model
- **Neural Chat 7B**: Optimized for natural conversation
- **Llama 2 7B**: Meta's versatile model
- **Zephyr 7B**: High-quality instruction-following

---

## 📥 Model Management

### Automatic Caching
- Models are downloaded on first use
- Cached locally in `backend/models/` directory
- Subsequent uses load from cache instantly
- Cache validation prevents incomplete downloads

### Model Download Status
- Real-time download progress with percentage
- File size information displayed
- Automatic error recovery with re-download on failure

### Supported Model Formats
- GGUF (Quantized Large Language Models)
- All models optimized for local CPU/GPU inference
- Q4_K_M quantization for best quality-to-size ratio

---

## 🎨 Image Generation (Optional)

### Supported Backends
1. **Ollama** (Local - Recommended)
   - Setup: `ollama pull stable-diffusion`
   - No internet required after setup
   - Fully private image generation

2. **Hugging Face API**
   - Setup: Set `HF_API_KEY` environment variable
   - Remote API calls
   - More model variety

3. **OpenAI DALL-E**
   - Setup: Set `OPENAI_API_KEY` environment variable
   - Professional-grade image generation
   - Requires OpenAI API credits

### Usage in Chat
```
POST /generate-image
{
  "prompt": "A beautiful sunset over mountains",
  "width": 512,
  "height": 512,
  "steps": 20
}
```

Check backend status:
```
GET /image-status
```

---

## 🚀 Quick Start (Local PC)

### Prerequisites
- Python 3.10+
- Node.js 18+
- 8GB RAM minimum (16GB recommended for larger models)
- 50GB free disk space for model storage

### Setup Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```

Backend runs on `http://localhost:8000`

### Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

---

## 💻 API Endpoints

### Chat Endpoint
```
POST /chat
Content-Type: application/json

{
  "message": "Explain async/await in Python with code examples",
  "model": "deepseek-coder",
  "temperature": 0.7,
  "max_tokens": 2048
}
```

### Image Generation
```
POST /generate-image
{
  "prompt": "Your prompt here",
  "width": 512,
  "height": 512,
  "steps": 20
}
```

### Health Check
```
GET /health
```

### Model Status
```
GET /image-status
```

---

## 📊 Performance Tips

### For Fast Response
- Use: Qwen 0.5B or TinyLlama 1.1B
- Best for: Quick answers, simple queries

### For Better Quality
- Use: Mistral 7B, Zephyr 7B, or Llama 2 7B
- Best for: Complex reasoning, detailed explanations

### For Code Generation
- Use: DeepSeek Coder or OpenCoder
- Best for: Professional code, complex algorithms

### For Balanced Performance
- Use: Phi 3.5 Mini or Qwen Coder
- Best for: General-purpose tasks with decent quality

---

## 🔧 Environment Variables

### Optional Configuration
```bash
# Image Generation
OLLAMA_URL=http://localhost:11434
HF_API_KEY=your_hugging_face_api_key
OPENAI_API_KEY=your_openai_api_key

# Backend Server
PORT=8000
```

---

## 🎯 Example Conversations

### Example 1: Code Generation
```
User: "Write a Python function to merge two sorted lists"