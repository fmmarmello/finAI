# **App Name**: FinAI

## Core Features:

- User Authentication: Allow users to sign up and log in using email/password, Google, or Apple.
- Manual Entry: Enable users to manually add expenses and income with fields for description, amount, date, category (with AI suggestions), and source.
- Automatic Document Reading: Process uploaded PDF or image files of receipts and credit card statements (Itaú, Porto Seguro, Nubank) to extract transaction data using ML Kit. The system is capable of learning distinct invoice layouts.
- Smart Categorization: Use a pre-trained AI model (via Vertex AI or TensorFlow Lite) to automatically categorize transactions based on descriptions. Allow users to correct categories and use this feedback to retrain the model, a process which functions as an intelligent 'tool' for the user's benefit.
- Dashboard: Present key financial data, including expense distribution by category, monthly balance, and a list of recent transactions, in a dashboard.
- AI-Powered Insights: Analyze user spending habits and provide insights such as trend analysis, anomaly detection (e.g., duplicate charges), identification of recurring subscriptions, and expense predictions.

## Style Guidelines:

- Primary color: Vivid blue (#29ABE2) to evoke trust and clarity, reflecting the app's focus on financial management.
- Background color: Light gray (#F0F4F7), a very low saturation, brighter tint of the primary hue, creating a clean and professional backdrop.
- Accent color: Green (#90EE90) to highlight positive actions and key insights.
- Headline font: 'Poppins', a geometric sans-serif for a modern and precise look; use 'Inter' as the body font, as this pairing works nicely.
- Use clear, minimalist icons for categories and actions to enhance usability.
- Maintain a clean and structured layout to facilitate easy navigation and data comprehension.
- Implement subtle animations for user feedback and data loading to enhance the overall user experience.