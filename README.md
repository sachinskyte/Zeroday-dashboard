# Zero-Day Sentinel Dashboard

Zero-Day Sentinel Dashboard is a **web-based analytics platform** designed to visualize and monitor **AI-predicted zero-day vulnerabilities** and **blockchain-stored reports**. Users can enter the AI model prediction URL and blockchain URL in the settings to fetch and display relevant data.

## 🚀 Features

- **Custom AI Model & Blockchain Integration**: Users input API endpoints for AI predictions and blockchain data.
- **Real-Time Analytics**: Displays AI-generated vulnerability predictions and blockchain-stored security reports.
- **User-Friendly Dashboard**: Interactive UI for monitoring security insights.

## 🛠️ Tech Stack

- **Frontend**: React.js (Dashboard UI)
- **Backend**: Node.js (API communication layer)
- **Charting & Analytics**: Chart.js / Recharts

## 📌 Installation & Setup

### Step 1: Clone the repository using the project's Git URL.
```sh
git clone https://github.com/sachinskyte/Zeroday-dashboard.git
```

### Step 2: Navigate to the project directory.
```sh
cd zeroday-dashboard
```

### Step 3: Install the necessary dependencies.
```sh
npm i
```

### Step 4: Start the development server with auto-reloading and an instant preview.
```sh
npm run dev
```

## 🔧 Configuration

To ensure seamless functionality, configure the following settings within the dashboard:

- **AI Model Prediction URL**: Enter the endpoint where the AI model's predictions are accessible.
- **Blockchain Data URL**: Provide the API URL for fetching blockchain-stored vulnerability reports.

These URLs can be updated anytime through the settings panel in the dashboard UI.

## Live Demo  

Experience the Zeroday Dashboard live: [Zeroday Dashboard](https://zeroday-dashboard.vercel.app/)  



## 🤝 Contributing

We welcome contributions from developers passionate about cybersecurity, AI, and blockchain. To maintain code quality and ensure a smooth collaboration process, please follow these guidelines:

### How to Contribute

1. **Fork the Repository**: Click the “Fork” button on GitHub to create a copy of this repository under your GitHub account.
2. **Clone Your Fork**: Download the repository to your local machine.
   ```sh
   git clone https://github.com/your-username/Zeroday-dashboard.git
   ```
3. **Create a Feature Branch**: Always work on a separate branch when making changes.
   ```sh
   git checkout -b feature-branch-name
   ```
4. **Implement Your Changes**: Add new features, fix bugs, or improve documentation while following best coding practices.
5. **Test Your Changes**: Ensure all changes function correctly and do not introduce regressions.
6. **Commit Your Changes**: Use meaningful commit messages.
   ```sh
   git commit -m "[Feature] Added new visualization for AI predictions"
   ```
7. **Push Your Branch to GitHub**:
   ```sh
   git push origin feature-branch-name
   ```
8. **Create a Pull Request (PR)**: Navigate to the original repository and open a PR explaining your changes.
9. **Review & Merge**: The maintainers will review your PR, provide feedback, and merge it if it meets the project standards.

