# Rental Management System

A full-stack Rental Management System built using Django REST Framework, React.js, and MySQL.

The system allows landlords to manage properties, rooms, tenants, rental payments, utility bills, complaints, rental agreements, and reports. Tenants can securely log in and view their rental information, payments, bills, complaints, and agreements.

## Features

### Landlord

- Landlord registration and login
- Property management
- Room management
- Tenant management
- Tenant account creation
- Rent payment management
- Advance payment management
- Electricity bill management
- Water bill management
- Complaint management
- Rental agreement management
- Monthly rent reports
- Electricity reports
- Water bill reports
- Payment history and filtering
- Tenant deactivation
- Room occupancy management

### Tenant

- Secure tenant login
- View profile
- View assigned property and room
- View advance payment details
- View monthly rent details
- View payment history
- View electricity bills
- View water bills
- View remaining bill amounts
- Submit complaints
- View complaint status
- View rental agreement

## Payment Management

The system supports partial payments.

For example:

- Required Advance: ₹20,000
- Paid: ₹10,000
- Remaining: ₹10,000
- Status: Partially Paid

Similarly, monthly rent can display:

- Required Rent
- Paid Amount
- Remaining Amount
- Payment Status

The system also validates payment limits so that rent and advance payments cannot exceed the configured room amounts.

## Utility Bills

The landlord can create electricity and water bills.

New bills start as:

- Required Amount
- Paid Amount: ₹0
- Remaining Amount
- Status: Pending

The landlord can later edit the bill after receiving payment.

The system supports:

- Pending
- Partially Paid
- Paid

## Complaints

Tenants can submit complaints to the landlord.

Landlords can view and manage complaints and update their status.

## Rental Agreements

Landlords can manage rental agreements associated with their tenants.

Tenants can view their own rental agreement information.

## Reports

The application provides reports for:

- Monthly rent
- Electricity bills
- Water bills

Reports support filtering by relevant property, room, tenant, month, and payment status.

## Technology Stack

### Backend

- Python
- Django
- Django REST Framework
- Simple JWT
- MySQL

### Frontend

- React.js
- Vite
- JavaScript
- HTML
- CSS

### Authentication

- JWT Authentication
- Role-based access
- Landlord and Tenant accounts

## Project Structure

```text
rental-management-system/
│
├── backend/
│   ├── accounts/
│   ├── complaints/
│   ├── rentals/
│   ├── tenants/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
