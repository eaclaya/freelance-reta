# RETA Freelance Accounting

A comprehensive freelance accounting application designed specifically for Spanish autónomos (self-employed workers) under the RETA (Régimen Especial de Trabajadores Autónomos) system.

## Features

- **Client Management**: Add, edit, and manage client information
- **Invoice Generation**: Create and manage invoices with PDF export capabilities
- **Expense Tracking**: Record and categorize business expenses
- **Tax Calendar**: Track important Spanish tax deadlines (Modelo 130, Modelo 303)
- **Exchange Rate Integration**: Real-time currency conversion for international clients
- **Dashboard Analytics**: Overview of income, outstanding invoices, and tax obligations
- **Profile Management**: Maintain business profile and settings

## Tech Stack

- **Framework**: Next.js 15.5.3 with React 19
- **Database**: Prisma with SQLite
- **UI Components**: Radix UI with Tailwind CSS
- **Authentication**: NextAuth.js
- **PDF Generation**: jsPDF with html2canvas
- **Calendar**: Schedule-X calendar component
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up the database:

```bash
npx prisma generate
npx prisma db push
```

4. (Optional) Seed the database with sample data:

```bash
npx prisma db seed
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Building for Production

```bash
npm run build
npm start
```

## Database Schema

The application uses Prisma with the following main entities:
- **Clients**: Customer information and contact details
- **Invoices**: Invoice records with line items and status tracking
- **Expenses**: Business expense records with categories
- **Profile**: User business profile and tax settings
- **Reminders**: Tax deadline and important date reminders

## Spanish Tax Compliance

This application is specifically designed for Spanish freelancers and includes:
- Quarterly tax deadline tracking (Modelo 130, Modelo 303)
- RETA status monitoring
- Spanish tax calendar integration
- Euro-based calculations with international currency support

## License

Private project for freelance accounting management.
