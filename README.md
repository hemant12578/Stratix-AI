# 🚀 Stratix AI | Empowering Everyone with Data Intelligence

<div align="center">

![Stratix AI Logo](logo.jpeg)

**Submitted to: AI for All Challenge - India's Open Data & AI-Readiness Hackathon**

[![Frontend Demo](https://img.shields.io/badge/Demo-Live-success?style=for-the-badge&logo=vercel)](https://stratixai.netlify.app/)
[![Video Walkthrough](https://img.shields.io/badge/Video-Demo-red?style=for-the-badge&logo=youtube)](https://drive.google.com/file/d/1_0EuliehQ-hhFRwzS5eDYWBW86Vw3vOI/view?usp=drivesdk)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

**🌟 Democratizing Data Intelligence for Everyone 🌟**

</div>

---

## 🎯 The Problem We're Solving

In India, **powerful market research and ML tools** are locked behind expensive enterprise software. Small founders, students, and researchers struggle with:
- ❌ Complex, messy public datasets that require manual cleaning
- ❌ No access to business intelligence without coding skills
- ❌ ML models that take weeks to build and deploy
- ❌ Hidden biases in AI that perpetuate inequality

**Stratix AI changes this.**

---

## 💡 Our Solution: AI for All

Stratix AI makes **advanced data intelligence accessible to everyone** through:

### 🧠 **Strategy Hub** - Business Intelligence Without Code
Type your startup idea → Get instant market analysis, revenue models, competitor insights, and SWOT analysis. **No MBA required.**

### 🛡️ **Responsible AI (Bias Audit)** 
Before any dataset is used, we automatically scan for gender, geographical, and demographic biases. **Fair AI for fair outcomes.**

### ⚡ **Automated Data Readiness**
Upload messy government data (PDFs, CSVs, Excel) → Stratix AI cleans, structures, and makes it ML-ready in seconds.

### 🤖 **Auto-ML Code Generator**
Describe your ML task in plain English → Get production-ready Python code (scikit-learn, TensorFlow) with explanations. **Learn by doing.**

---

## 🎥 Demo & Screenshots

### 📹 **Video Walkthrough** (2 mins)
👉 [**Watch Full Demo Here**](https://drive.google.com/file/d/1_0EuliehQ-hhFRwzS5eDYWBW86Vw3vOI/view?usp=drivesdk)

### 🖼️ **Live Application**
🌐 [**Try Stratix AI**](https://stratixai.netlify.app/)

---

## 🏗️ Architecture
```
┌─────────────────┐
│  React Frontend │ ← Beautiful Dark UI (Tailwind CSS)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  FastAPI Backend│ ← Python + ML Logic
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Google Gemini AI│ ← High-speed reasoning & generation
└─────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **AI Engine** | Google Gemini 1.5 Flash |
| **Backend** | FastAPI (Python 3.10+) |
| **Frontend** | React.js + Tailwind CSS |
| **ML Libraries** | Pandas, NumPy, Scikit-learn |
| **Deployment** | Netlify (Frontend), Render (Backend - in progress) |

---

## 🌍 How Stratix AI Aligns with "AI for All" Themes

| Theme | How We Address It |
|-------|-------------------|
| **🎯 AI for Social Impact** | Strategy Hub helps **MSMEs and students** validate ideas without expensive consultants |
| **📊 Data Readiness & Standardization** | Automated cleaning, bias detection, and schema harmonization for Indian public datasets |
| **🤖 Indic Language Enablement** | *(Roadmap)* Multilingual support for data inputs and AI responses |
| **📄 Public Data Extraction** | Upload PDFs/CSVs → Structured, AI-ready data in seconds |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 16+
- Google Gemini API Key

### Installation
```bash
# Clone the repository
git clone https://github.com/hemant12578/Stratix-AI.git
cd Stratix-AI

# Backend Setup
cd server
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend Setup (new terminal)
cd client
npm install
npm start
```

### Environment Variables
Create `.env` files:

**Backend (`server/.env`):**
```
GEMINI_API_KEY=your_api_key_here
```

**Frontend (`client/.env`):**
```
REACT_APP_API_URL=http://localhost:8000
```

---

## 📈 Impact & Future Vision

### Current Impact
- ✅ **Open Source** (MIT License) - Free forever
- ✅ Makes ML accessible to **non-coders**
- ✅ Reduces data prep time from **hours → minutes**
- ✅ Ensures **responsible AI** through bias audits

### Roadmap
- 🔜 Integration with **AIKosh** (Factly's open data repository)
- 🔜 Indic language support (Hindi, Tamil, Telugu, Bengali)
- 🔜 Government dataset scraper (GeM, NSSO, Census)
- 🔜 Mobile app for **Anganwadi workers** and field researchers

---

## 📜 Open Source & License

This project is **100% Open Source** under the **MIT License**.  
We believe in **public value** and **collaborative innovation**.

**Why Open Source?**  
So that students, researchers, and civic-tech communities can:
- Learn from the code
- Build upon our work
- Contribute improvements
- Deploy for social good

---

## 👨‍💻 About the Creator

**Hemant** - Class 8 Student & AI Enthusiast  
📧 Contact: h9696838@gmail.com  
🎓 Building the future, one line of code at a time.

> *"I built Stratix AI because I believe everyone deserves access to powerful data tools, not just big corporations."*

---

## 🙏 Acknowledgments

- **Factly & Meta** for organizing AI for All Challenge
- **Google Gemini** for the AI engine
- **Open Data Community** for inspiration

---

## ⭐ Support This Project

If Stratix AI helped you, please:
- ⭐ **Star this repo** on GitHub
- 🐦 Share on Twitter with **#AIforAll** and **#StratixAI**
- 💡 Suggest features in [Issues](https://github.com/hemant12578/Stratix-AI/issues)

---

<div align="center">

**Built with ❤️ for India's AI Revolution**

[![GitHub](https://img.shields.io/badge/GitHub-hemant12578-black?style=for-the-badge&logo=github)](https://github.com/hemant12578)

</div>
