# 🚀 Stratix AI | Democratizing Data Intelligence

<div align="center">

![Stratix AI Logo](logo.jpeg)

[![Frontend Demo](https://img.shields.io/badge/Demo-Live-success?style=for-the-badge&logo=vercel)](https://stratixai.netlify.app/)
[![License](https://img.shields.io/badge/License-AGPL-blue?style=for-the-badge)](LICENSE)
[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red?style=for-the-badge)](https://github.com/hemant12578)

</div>

🎯 The Problem
In India, powerful market research and ML tools are locked behind expensive enterprise software:

❌ Market research costs ₹50,000 - 5,00,000

❌ ML platforms charge ₹50,000+/year

❌ Data cleaning takes hours of manual work

❌ Complex datasets remain unusable

❌ Small businesses can't afford consultants

❌ Students can't access professional tools

Stratix AI changes this.

💡 The Solution
Stratix AI makes enterprise-grade data intelligence accessible to everyone - powered by advanced AI and open-source transparency.

🧠 Strategy Hub - Business Intelligence Without MBA
Type your startup idea → Get instant market analysis, revenue models, competitor insights, and SWOT analysis.

Perfect for: Startup founders, entrepreneurs, business students

🛡️ Responsible AI (Bias Audit) Automatically scan datasets for gender, geographical, and demographic biases before using them in AI models.
Perfect for: Researchers, data scientists, organizations building fair AI

⚡ Automated Data Readiness
Upload messy government data (PDFs, CSVs, Excel) → Get structured, ML-ready datasets in seconds.

Perfect for: Data analysts, students, NGOs working with public data

🤖 Auto-ML Code Generator
Describe your ML task in plain English → Get production-ready Python code (scikit-learn, TensorFlow) with detailed explanations.

Perfect for: Students learning ML, developers building prototypes, non-coders needing ML solutions

⚠️ Current Limitations (Updated)
While Stratix AI is powerful, users should be aware of the following technical constraints:

API Rate Limits: High traffic may cause temporary delays in response.

Complex Data Extraction: Scanned or heavily stylized PDFs might need verification for 100% accuracy.

Hardware Constraints: Processing very large datasets (100MB+) is currently optimized for cloud execution only.

🛡️ Enterprise-Grade Infrastructure
🔄 Multi-AI Provider Failover System
Stratix AI uses three AI providers with automatic failover to ensure 100% uptime. If one system goes down, the redundant architecture instantly switches to a secondary provider, ensuring your workflow never stops.

⚖️ License & Commercial Rights
This project has been updated from MIT to GNU Affero General Public License v3.0 (AGPL-3.0).

Commercial Use: Allowed. You can use this for business or sell services based on it.

Transparency: If you host this on a server for users (Cloud/SaaS), you must provide the source code to the users.

Integrity: This ensures that Stratix AI remains an open and fair ecosystem for all.
#### 4. **Open Data Focus** 🌐
- Specifically designed for Indian government datasets
- Handles messy PDFs, Excel files, and unstructured data
- Makes public data AI-ready for social impact

#### 5. **Responsible AI First** 🛡️
- Built-in bias detection for gender, geography, and demographics
- Ensures fairness before datasets enter ML pipelines
- Promotes ethical AI development

---

## 🎥 Demo & Live Application

### 📹 **Full Video Walkthrough** (2-minute demo)
👉 [**Watch Demo Video**](https://drive.google.com/file/d/1_0EuliehQ-hhFRwzS5eDYWBW86Vw3vOI/view?usp=drivesdk)

### 🌐 **Try It Live**
🚀 [**Launch Stratix AI**](https://stratixai.netlify.app/)

---

## 🏗️ System Architecture
```
┌─────────────────────────────────────────────┐
│          React Frontend (Tailwind)          │
│  • Strategy Hub  • Data Cleaner  • ML Gen   │
└───────────────────┬─────────────────────────┘
                    │ REST API
                    ▼
┌─────────────────────────────────────────────┐
│         FastAPI Backend (Python)            │
│  • Request Routing  • Data Processing       │
│  • Bias Detection   • Code Generation       │
└───────────────────┬─────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌──────────────┐       ┌──────────────┐
│ Google Gemini│◄──────┤   Fallback   │
│ (Primary AI) │       │   Handler    │
└──────────────┘       └───────┬──────┘
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
            ┌──────────────┐      ┌──────────────┐
            │   OpenAI     │      │  OpenRouter  │
            │  (Backup 1)  │      │  (Backup 2)  │
            └──────────────┘      └──────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **AI Engine (Primary)** | Google Gemini 1.5 Flash | High-speed reasoning & generation |
| **AI Fallback 1** | OpenAI GPT-4 | Premium quality backup |
| **AI Fallback 2** | OpenRouter AI | Cost-effective alternative |
| **Backend** | FastAPI (Python 3.10+) | High-performance async API |
| **Frontend** | React.js + Tailwind CSS | Modern, responsive UI |
| **ML Libraries** | Pandas, NumPy, Scikit-learn | Data processing & ML |
| **Data Processing** | Python-docx, PyPDF2, openpyxl | Multi-format support |
| **Deployment** | Vercel (Frontend), Railway (Backend) | Cloud-native hosting |

---

## 🌍 How Stratix AI Aligns with "AI for All" Themes

| Hackathon Theme | How Stratix AI Addresses It | Impact |
|-----------------|----------------------------|--------|
| **🎯 AI for Social Impact** | Strategy Hub democratizes business intelligence for **MSMEs, students, and non-tech founders** | Levels the playing field for small entrepreneurs |
| **📊 Data Readiness & Standardization** | Automated cleaning, bias detection, schema harmonization for **Indian public datasets** | Makes government data usable for AI/ML |
| **🤖 Indic Language Enablement** | *(Roadmap)* Multilingual support for Hindi, Tamil, Telugu, Bengali inputs/outputs | Breaks language barriers in AI access |
| **📄 Public Data Extraction** | Upload messy PDFs/CSVs/Excel → Get **structured, AI-ready data** in seconds | Saves hours of manual data wrangling |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10 or higher
- Node.js 16 or higher
- API Keys: Google Gemini, OpenAI (optional), OpenRouter (optional)

### Quick Start

#### 1️⃣ Clone the Repository
```bash
git clone https://github.com/hemant12578/Stratix-AI.git
cd Stratix-AI
```

#### 2️⃣ Backend Setup
```bash
cd server
pip install -r requirements.txt

# Create .env file with your API keys
echo "GEMINI_API_KEY=your_gemini_key_here" > .env
echo "OPENAI_API_KEY=your_openai_key_here" >> .env  # Optional
echo "OPENROUTER_API_KEY=your_openrouter_key_here" >> .env  # Optional

# Start the backend
uvicorn main:app --reload --port 8000
```

#### 3️⃣ Frontend Setup (New Terminal)
```bash
cd client
npm install

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:8000" > .env

# Start the frontend
npm run dev
```

#### 4️⃣ Access the Application
Open your browser and navigate to: `http://localhost:3000`

## Deployment

### Frontend on Vercel
- Set the Vercel project root directory to `client`
- Build command: `npm run build`
- Output directory: `dist`
- Add this environment variable in Vercel: `VITE_API_BASE_URL=https://<your-railway-backend>.up.railway.app`

### Backend on Railway
- Add `railway.json` from the repo root
- Use the default Railway start command from `railway.json`
- Set `FRONTEND_URL=https://<your-vercel-project>.vercel.app` in Railway
- Keep your API keys in Railway environment variables

---

## 📂 Project Structure
```
Stratix-AI/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Strategy Hub, Data Cleaner, ML Gen
│   │   └── App.js         # Main application
│   └── package.json
│
├── server/                # FastAPI backend
│   ├── main.py           # API routes
│   ├── ai_handler.py     # Multi-provider AI logic
│   ├── bias_detector.py  # Fairness auditing
│   ├── data_cleaner.py   # Automated data processing
│   └── requirements.txt
│
├── api/                  # Additional API utilities
├── README.md
└── LICENSE
```

---

## 📈 Impact & Vision

### Current Impact
- ✅ **100% Open Source** (MIT License) - Free forever for everyone
- ✅ Makes ML accessible to **non-coders and students**
- ✅ Reduces data preparation time from **hours → minutes**
- ✅ Ensures **responsible AI** through automatic bias audits
- ✅ **Enterprise-grade reliability** with multi-provider fallback

### 🔮 Future Roadmap

#### Phase 1 (Post-Hackathon)
- 🔜 Full backend deployment on cloud infrastructure
- 🔜 Integration with **AIKosh** (Factly's open data repository)
- 🔜 Enhanced bias detection algorithms
- 🔜 User authentication and project management

#### Phase 2 (Q2 2026)
- 🔜 Indic language support (Hindi, Tamil, Telugu, Bengali, Marathi)
- 🔜 Government dataset auto-scraper (GeM, NSSO, Census, NFHS)
- 🔜 Advanced ML model templates (Deep Learning, NLP, Computer Vision)
- 🔜 Collaborative features for teams

#### Phase 3 (Q3-Q4 2026)
- 🔜 Mobile app for **Anganwadi workers** and field researchers
- 🔜 Voice-based data input for low-literacy users
- 🔜 Integration with government portals (Open Government Data Platform)
- 🔜 AI-powered policy impact analysis tools

### 🌟 Long-term Vision
**Making India a global leader in democratized AI** by ensuring every citizen—from students to small business owners—has access to world-class data intelligence tools.

---

## 🎓 Use Cases

### For Students & Researchers
- 📚 Learn ML by generating and studying production-ready code
- 🔬 Clean and analyze datasets for academic projects
- 📊 Validate research hypotheses with data-driven insights

### For Startups & MSMEs
- 💡 Validate business ideas with market analysis
- 📈 Identify market gaps and opportunities
- 💰 Create data-driven revenue models without hiring consultants

### For Social Impact Organizations
- 🏥 Analyze health data for community interventions
- 🌾 Process agricultural data for farmer support programs
- 📖 Evaluate education outcomes across regions

### For Government & Policy Makers
- 📊 Make public datasets AI-ready for research
- 🔍 Detect biases in existing datasets
- 📈 Track scheme implementation and impact

---

## 📜 Open Source & License

This project is **100% Open Source** under the **[MIT License](LICENSE)**.

### Why Open Source?

We believe in **public value creation** and **collaborative innovation**. By making Stratix AI open source, we enable:

- ✅ **Learning** - Students can study professional-grade code
- ✅ **Building** - Developers can extend and customize features
- ✅ **Contributing** - Community can improve and add capabilities
- ✅ **Social Good** - Anyone can deploy for civic-tech projects
- ✅ **Transparency** - Full visibility into AI decision-making

**All final solutions will be linked to AIKosh**, ensuring long-term public value and reuse across India's AI ecosystem.

---

## 👨‍💻 About the Creator

**Hemant** - Class 8 Student, AI Enthusiast & Future Innovator

📧 **Contact:** h9696838@gmail.com  
🎓 **Mission:** Building the future of accessible AI, one line of code at a time

> *"I built Stratix AI because I believe everyone deserves access to powerful data tools, not just big corporations. Age should never be a barrier to solving real-world problems."*

### Why This Project Matters to Me

As a Class 8 student, I've seen how:
- Small business owners struggle without market research tools
- Students can't afford expensive ML platforms
- Government data sits unused because it's too complex
- AI remains a "big company" privilege

**Stratix AI is my answer to these problems.** It proves that with the right tools, anyone—regardless of age, background, or technical expertise—can harness the power of AI for good.

---

## 🙏 Acknowledgments

- **Factly & Meta** for organizing the AI for All Challenge and championing open data
- **Google Gemini** for providing accessible AI capabilities
- **Open Data Community** for inspiration and datasets
- **Indian Government** for promoting open data initiatives
- **My mentors and supporters** who believed in this vision

---

## 🤝 Contributing

We welcome contributions from developers, data scientists, and AI enthusiasts!

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Areas We Need Help
- 🌐 Indic language integration (Hindi, Tamil, Telugu, etc.)
- 📊 Additional data format support (XML, JSON, databases)
- 🤖 More ML model templates
- 🎨 UI/UX improvements
- 📖 Documentation and tutorials
- 🧪 Testing and quality assurance

---

## 📞 Support & Community

### Get Help
- 📧 Email: h9696838@gmail.com
- 🐛 Report bugs: [GitHub Issues](https://github.com/hemant12578/Stratix-AI/issues)
- 💡 Request features: [GitHub Discussions](https://github.com/hemant12578/Stratix-AI/discussions)

### Stay Updated
- ⭐ Star this repository to follow development
- 👁️ Watch for updates and new releases
- 🍴 Fork to create your own version

---

## ⭐ Support This Project

If Stratix AI helped you or inspired you, please:

- ⭐ **Star this repository** on GitHub
- 🐦 **Share on social media** with **#AIforAll**, **#StratixAI**, and **#OpenData**
- 💡 **Suggest features** in [GitHub Issues](https://github.com/hemant12578/Stratix-AI/issues)
- 🤝 **Contribute code** or documentation
- 📣 **Spread the word** to students, researchers, and entrepreneurs who could benefit

**Every star, share, and contribution helps democratize AI for millions!**

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/hemant12578/Stratix-AI?style=social)
![GitHub forks](https://img.shields.io/github/forks/hemant12578/Stratix-AI?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/hemant12578/Stratix-AI?style=social)
![GitHub last commit](https://img.shields.io/github/last-commit/hemant12578/Stratix-AI)
![GitHub issues](https://img.shields.io/github/issues/hemant12578/Stratix-AI)
![GitHub pull requests](https://img.shields.io/github/issues-pr/hemant12578/Stratix-AI)

---

<div align="center">

## 🏆 Built for AI for All Challenge 2026

**Making AI Accessible • Making Data Usable • Making Impact Real**

---

**Built with ❤️ by a Class 8 student for India's AI Revolution**

[![GitHub](https://img.shields.io/badge/GitHub-hemant12578-black?style=for-the-badge&logo=github)](https://github.com/hemant12578)
[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge&logo=vercel)](https://stratixai.netlify.app/)
[![MIT License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

</div>

---

<div align="center">

### 🌟 Thank you for supporting Stratix AI! 🌟

**Together, we're democratizing data intelligence for everyone.**

*Star ⭐ this project if you believe in accessible AI for all!*

</div>
