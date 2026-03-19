# shieldgig-ai-insurance
# 🚀 ShieldGig: AI-Powered Income Protection for Delivery Workers

---

## 📌 Problem Statement

India’s gig economy (Swiggy, Zomato, Zepto, Amazon delivery partners) is highly dependent on external conditions such as weather, pollution, and curfews. These disruptions reduce working hours and can cause up to 20–30% loss in weekly income.

Currently, gig workers have no financial protection against such uncontrollable events and must bear the full financial loss.

---

## 👤 Persona

**Target User:**  
Food Delivery Partner (Swiggy/Zomato) operating in urban areas.

### 📍 Scenario:
- A delivery partner earns ₹500–₹800 per day.
- Heavy rain or extreme heat reduces order availability.
- The worker cannot complete deliveries and loses income.
- No compensation is available for such disruptions.

---

## 💡 Solution Overview

ShieldGig is an AI-powered parametric insurance platform that protects gig workers against income loss caused by external disruptions.

### 🔥 Key Idea:
- Monitor real-world conditions (weather, pollution, curfews)
- Automatically detect disruptions
- Trigger claims instantly
- Provide immediate payouts

✅ No paperwork  
✅ No manual claims  
✅ Fully automated (Zero-touch insurance)

---

## 🔄 Workflow

1. User registers on the platform.
2. User selects a weekly insurance plan.
3. System captures location and work zone.
4. AI calculates risk level and premium.
5. External APIs monitor:
   - Weather conditions
   - Air Quality Index (AQI)
6. If thresholds are exceeded:
   - Claim is automatically triggered
   - Instant payout is processed
7. User receives compensation for lost income.

---

## 💰 Weekly Premium Model

| Risk Level   | Weekly Premium |
|-------------|--------------|
| Low Risk     | ₹20/week     |
| Medium Risk  | ₹40/week     |
| High Risk    | ₹60/week     |

### 📊 Factors Considered:
- Location (flood-prone / high pollution zones)
- Historical disruption data
- Weather trends

---

## ⚡ Parametric Triggers

| Event            | Condition              | Payout |
|------------------|----------------------|--------|
| Heavy Rain       | Rainfall > 50mm       | ₹300   |
| Extreme Heat     | Temperature > 45°C    | ₹200   |
| High Pollution   | AQI > 300             | ₹250   |
| Curfew/Closures  | Zone restrictions     | ₹300   |

👉 Claims are triggered automatically when conditions are met.

---

## 🤖 AI/ML Integration

### 🔹 Risk Prediction
- Predicts disruption probability based on location & historical data

### 🔹 Dynamic Premium Calculation
- Adjusts weekly premium based on predicted risk

### 🔹 Fraud Detection
- GPS validation (user location vs event location)
- Duplicate claim detection
- Activity verification

---

## 🌐 Platform Choice

**Web Application**

### ✅ Why Web?
- Accessible on all devices
- No installation required
- Lightweight for gig workers
- Faster deployment

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite)
- **Backend:** node.js
- **Database:** MongoDB Atlas
- **APIs:** OpenWeather API, AQI API (or mock data)
- **AI/ML:** Python (Flask) or rule-based logic
- **Payment:** Razorpay (Test Mode) / Mock UPI

---

## 🧱 Development Plan

### 🔹 Phase 1:
- Idea design
- Workflow definition
- README documentation

### 🔹 Phase 2:
- User registration system
- Insurance policy management
- Dynamic premium calculation
- Claims automation

### 🔹 Phase 3:
- Fraud detection system
- Instant payout simulation
- Analytics dashboard

---

## 📊 Detailed Dashboard Features

### 👤 Worker Dashboard (Delivery Partner)

The worker dashboard is designed to provide a simple and transparent view of insurance coverage and payouts.

#### 🔹 Profile Section
- Displays user details such as name, working location, and risk category.
- Helps in personalized premium calculation.

#### 🔹 Active Insurance Plan
- Shows current weekly plan (₹20/₹40/₹60).
- Displays coverage status and validity period.
- Ensures workers are aware of their active protection.

#### 🔹 Earnings Protection Summary
- Shows total income protected during the week.
- Displays number of disruptions covered.
- Provides financial visibility to the user.

#### 🔹 Real-Time Alerts
- Alerts users about ongoing disruptions such as:
  - Heavy rain
  - Extreme heat
  - High AQI
- Notifies when insurance triggers are activated.

#### 🔹 Claim History
- Displays all past claims with:
  - Date
  - Event type
  - Payout amount
  - Status
- Builds trust and transparency.

#### 🔹 Instant Payout Status
- Shows payout details including:
  - Amount credited
  - Payment method
  - Timestamp
- Highlights zero-touch claim processing.

---

### 🧑‍💼 Admin Dashboard (Insurance Provider)

The admin dashboard provides complete control and monitoring of the system.

#### 🔹 Overview Metrics
- Total users
- Active policies
- Total claims triggered
- Total payouts processed

#### 🔹 Risk Analytics
- Identifies high-risk zones
- Displays disruption frequency trends
- Helps optimize premium pricing

#### 🔹 Claims Monitoring
- Tracks all claims in real-time
- Displays event type, location, and payout details

#### 🔹 Fraud Detection Panel
- Detects suspicious activities such as:
  - Duplicate claims
  - GPS mismatches
  - Invalid triggers

#### 🔹 Predictive Insights
- Uses AI to forecast:
  - Future disruptions
  - Expected claim volume
- Helps in proactive decision making

#### 🔹 System Monitoring
- Tracks API health and uptime
- Ensures smooth functioning of the platform

---

## 🚀 Future Enhancements

- Integration with delivery platforms (Swiggy/Zomato APIs)
- Real-time notifications
- Advanced ML prediction models
- Personalized insurance plans

---

## 🎯 Conclusion

ShieldGig provides a scalable, AI-driven solution to protect gig workers from income loss. By combining real-time data, automation, and predictive intelligence, it ensures financial stability and resilience in the gig economy.

---
Viedo URL:

