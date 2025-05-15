# Project Brief

This document outlines the core requirements and goals of the project. It serves as the foundation for all other Memory Bank documents and the source of truth for the project scope.

## Core Requirements

The React Native mobile app, designed for the `technician` role, must support the following functionalities:

**Existing Features (to be maintained/enhanced):**
- User authentication and session management.
- Ability to go online (clock-in) and offline (clock-out).
- Foreground and background location tracking while the technician is online.
- Display a list of jobs assigned to the technician.
- Detailed view of individual jobs, including customer information, service location, and job details.
- Ability to update job status (e.g., "En Route", "On Site", "Completed").
- View a log of activities related to a job.
- View and edit estimated arrival time for a job.
- One-click navigation to the service location using Google Maps or Apple Maps.
- Functionality to generate an invoice for services rendered.
- Ability to record cash payments received from customers.
- Mechanism to send an invoice link to customers for credit card payments (replaces in-app CC processing).

**New Features to be Implemented:**
- Job Screen:
    - Upload photos related to the job.
    - View and add comments to a job.
    - Edit/update service address.
    - Edit/update vehicle information.
    - Remove activity log entries (clarify if this is a general feature or specific conditions).
    - Display payment information (in addition to invoices and line items).
    - Display technician payout information for the job.
- Account Management Screen:
    - Cash management features, including depositing cash owed.
- Leverage existing API endpoints for all new feature implementations.

## Project Goals

1.  **Continue Development of Technician-Focused Mobile App:** Further develop the React Native mobile application, which serves as a specialized tool for technicians, mirroring relevant functionalities from the existing Phoenix CRM web application.
2.  **Feature Parity (Technician Role):** Incrementally implement features from the Phoenix CRM web app that are pertinent to the technician's workflow, aiming to provide a comprehensive mobile solution for their daily tasks.
3.  **Streamlined User Experience:** Ensure the mobile app offers a user-friendly and efficient experience tailored to the needs of roadside service technicians.
4.  **Maintain and Enhance Existing Functionality:** Ensure current features are stable, performant, and improved upon where necessary.
5.  **Secure Payment Processing:** Adhere to the updated payment processing model by facilitating invoice sharing for CC payments, rather than direct in-app CC handling.
