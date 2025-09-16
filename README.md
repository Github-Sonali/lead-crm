# Lead CRM

A simple CRM application built with **Next.js**, **Prisma**, and **SQLite**.  
It allows managing buyers, tracking property preferences, and maintaining buyer history.

---

## 🚀 Features

- Add, view, and manage buyers
- Track buyer status, city, property type, and budget
- Prisma ORM with SQLite
- Prisma Studio for quick DB management

---

## 🛠️ Tech Stack

- **Frontend**: Next.js (App Router)
- **Database**: SQLite + Prisma ORM
- **Deployment**: Vercel (optional)

---

## 📂 Folder Structure

lead-crm/
├── prisma/ # Schema & migrations
│ └── schema.prisma
├── src/
│ ├── app/ # Next.js App Router pages
│ ├── generated/ # Prisma client (auto-generated)
│ └── components/ # Reusable UI components
├── package.json
└── README.md

---

## ▶️ Getting Started

1. Clone repo:

   ```sh
   git clone https://github.com/<your-username>/lead-crm.git
   cd lead-crm

   ```

2. Install deps:
   npm install

3. Setup database:
   npx prisma migrate dev --name init
   npx prisma studio

4. Run app:
   npm run dev
