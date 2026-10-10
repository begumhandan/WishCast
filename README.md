# 🔮 WishCast

**Forecast the day you get what you want.**

![Next.js](https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)
![Vitest](https://img.shields.io/badge/tested_with-Vitest-6E9F18?logo=vitest&logoColor=white)

Most budgeting apps look backwards: *"Where did my money go last month?"*
WishCast looks forward. Tell it your income, the thing you want and when you want it.
It tells you **how much you can spend today**, and it updates **the date you'll actually get it** every time you log an expense.

> 📸 _Demo GIF coming soon_

---

## ✨ Features

| | Feature |
|---|---|
| 🚧 | **Daily allowance:** "You can spend ₺193.33 today and stay on track." |
| 🚧 | **Wish forecast:** estimated purchase date, recalculated live |
| 🚧 | **Inflation-aware goals:** the price of your wish grows every month, and so does the target |
| 🚧 | **Expense impact:** "That coffee pushed your wish back by 2 days." |
| 🚧 | **Payday-based periods:** budgets follow *your* payday, even on the 31st |
| 🚧 | **Period close:** leftover money is moved into your wish automatically |
| 🚧 | **Feasibility check:** if the goal is impossible in time, WishCast suggests the earliest realistic date |
| 🚧 | Sign in with GitHub; every user sees only their own data |

## 🧮 How it works

All amounts are stored as **integer kuruş** (1 ₺ = 100 kuruş), so there are no floating-point surprises.

```
monthly saving needed = ⌈ (price − saved) / months left ⌉
spendable this period = income − fixed expenses − monthly saving
daily allowance       = ⌊ (spendable − spent so far) / days left (incl. today) ⌋
```

**The forecast** simulates month by month: your savings grow by your monthly saving while the price grows by the monthly inflation rate. The first month where savings ≥ price is your wish date.

**Example:** you want a ₺60,000 phone, you have ₺10,000 saved and you save ₺10,000 every month.

| Monthly price increase | Forecast |
|---|---|
| 0% | March 2027 |
| 2% | **April 2027** (inflation costs you a month) |

## 🛠 Tech stack

- **Framework:** Next.js (App Router, Server Actions), TypeScript
- **UI:** Tailwind CSS, Recharts
- **Database:** Prisma ORM, SQLite (dev) / PostgreSQL (prod)
- **Auth:** Auth.js (GitHub OAuth)
- **Validation & dates:** zod, date-fns
- **Testing:** Vitest

## 📁 Project structure

```
lib/
  money.ts      # parseTL / formatTL (text ⇄ kuruş)
  plan.ts       # pure business logic: budget, periods, allowance, forecast
  db.ts         # Prisma client
  auth.ts       # Auth.js config
app/
  page.tsx            # dashboard
  onboarding/         # income, payday, fixed expenses
  goal/               # create/edit your wish
  history/            # expense list + chart
  actions.ts          # Server Actions
components/   AllowanceCard, GoalProgress, QuickExpense, ImpactToast
prisma/       schema.prisma
tests/        money.test.ts, plan.test.ts
```

## 🚀 Getting started

**Requirements:** Node.js 20+, a GitHub OAuth app (callback URL: `http://localhost:3000/api/auth/callback/github`)

```bash
git clone https://github.com/begumhandan/wishcast.git
cd wishcast
npm install
cp .env.example .env        # PowerShell: Copy-Item .env.example .env
npx auth secret             # generates AUTH_SECRET
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | `file:./dev.db` for local SQLite |
| `AUTH_SECRET` | Random secret for Auth.js |
| `AUTH_GITHUB_ID` | GitHub OAuth app client ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth app client secret |

## 🧪 Testing

The business logic in `lib/` is pure and fully unit tested, including edge cases like paydays on the 31st in February, year boundaries and goals that inflation makes unreachable.

```bash
npm test
```

## 🧠 Design decisions

- **Integer kuruş instead of floats:** `0.1 + 0.2 !== 0.3`. Monthly savings round **up** and the daily allowance rounds **down**, so the user never falls short.
- **Pure logic layer:** all calculations live in `lib/plan.ts` with no database or framework code, which makes them easy to test.
- **Server Actions with ownership checks:** every mutation validates input with zod and scopes queries by `userId`.
- **Expense impact:** _to be documented_

## 🗺 Roadmap

- [ ] Shareable progress card ("I'm 62% of the way to my wish 🎯") via `next/og`
- [ ] Real inflation data from the Central Bank of Türkiye (EVDS API)
- [ ] PWA + daily "log your expenses" reminder
- [ ] Multiple wishes with priorities
- [ ] Bank statement CSV import
- [ ] Deploy on Vercel + Neon PostgreSQL

## 📄 License

MIT