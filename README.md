# AutoCare Garage Management System

## Important database update

This version fixes duplicate Django model definitions and connects **Service & Job Cards** and **Staff Management** to the SQLite database.

- Customer Management: Django + SQLite
- Vehicle Management: Django + SQLite
- Service & Job Cards: Django + SQLite
- Staff Management: Django + SQLite
- Billing & Payments: browser localStorage (survives refresh in the same browser)
- Spare Parts & Stock: browser localStorage (survives refresh in the same browser)
- Reports: calculated from the loaded module data

## Run the backend (PowerShell)

Open a terminal in the `backend` folder:

```powershell
cd C:\Users\Admin\Desktop\AutoCare\backend
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe manage.py runserver
```

Do not type the `PS C:\...>` prompt itself. Run only the commands above.

The migration adds Job Cards and Staff tables and inserts demo records for the existing vehicle `MH09AB1234` and four staff members, if those tables are empty. Existing customers and vehicles in `db.sqlite3` are preserved.

## Run the frontend

Open a second terminal:

```powershell
cd C:\Users\Admin\Desktop\AutoCare
npm run dev
```

Open the Vite URL shown in the terminal (usually `http://localhost:5173`).

## API endpoints

- `/api/customers/`
- `/api/vehicles/`
- `/api/jobs/`
- `/api/staff/`

Create, edit, and delete operations for Job Cards and Staff now go to Django, not React-only state.

## Before replacing your current project

Keep a backup of your existing `backend\db.sqlite3`, `backend\venv`, and `node_modules`. The ZIP does not include `venv` or `node_modules`.
