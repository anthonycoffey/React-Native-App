# Product Context

This document describes why this project exists, the problems it solves, how it should work, and the user experience goals.

## Problem Statement

1.  **Mobile-First Interface Need:** Technicians are primarily on the go and require a streamlined, mobile-native interface for their tasks, rather than relying on a web application designed for broader use cases and potentially larger screens.
2.  **Limited Web-Based Location Tracking:** Browser-based location tracking has significant limitations, especially for continuous background updates. This hinders the effectiveness of features like the "technician tracker" in the main Phoenix CRM web app, which relies on real-time technician location.
3.  **Inefficiency of Web App for Field Tasks:** Requiring technicians to use the full web app for field tasks can be cumbersome and inefficient on mobile devices.

## Proposed Solution

1.  **Dedicated Technician Mobile App:** Develop and enhance a React Native mobile application specifically tailored to the `technician` role.
2.  **Feature Migration:** Systematically migrate technician-relevant features from the existing Phoenix CRM web application to the mobile app. The goal is for technicians to be able to perform 80-90% of their necessary tasks using the mobile app.
3.  **Enhanced Location Tracking:** Leverage native mobile capabilities to provide robust foreground and background location tracking. This data feeds into the existing backend API, supporting features like the "technician tracker" on the web app with more accurate and real-time information.

## How It Works

The React Native mobile application interfaces with the same existing backend API that the Phoenix CRM web application uses. Technicians will:
1.  Log in to the mobile app using their credentials.
2.  Go "online" to enable location tracking and indicate availability.
3.  Receive and view assigned jobs.
4.  Update job statuses (e.g., en route, on site, completed) in real-time.
5.  Utilize tools for navigation, communication (view/add comments - future), invoicing, and payment recording.
6.  Manage job-related information such as arrival times, service details (future: photo uploads, address/vehicle edits).
7.  Go "offline" to disable location tracking and indicate end of shift.
8.  (Future) Manage account-specific tasks like cash deposits.

## User Experience Goals

1.  **Feature Accessibility:** Ensure technicians have access to all necessary features and information pertinent to their role, comparable to what they would find in the web app, but optimized for a mobile experience.
2.  **Efficiency and Speed:** Provide a fast, responsive, and intuitive interface that allows technicians to complete tasks quickly and with minimal friction.
3.  **Reliability:** Ensure the app is stable and reliable, especially for critical functions like location tracking and job status updates.
4.  **Ease of Use:** Design the app to be user-friendly, requiring minimal training for technicians familiar with the Phoenix CRM ecosystem.
5.  **Reduced Reliance on Web App:** Enable technicians to perform the vast majority of their daily tasks within the mobile app, significantly reducing the need to access the web application while in the field.
