Analyze the entire Figma prototype file including all pages, frames, flows, components, variants, interactions, and naming structures.

Generate a comprehensive Product & System Analysis Report based strictly on what exists in the design (do not invent features that are not present).

Structure the output in the following detailed format:

1. Executive Summary

What is the product about?

What problem does it solve?

Who are the target users?

What type of platform is it (marketplace, SaaS, aggregator, etc.)?

What business model is implied?

2. Product Scope Overview

Core modules identified

User roles identified (Customer, Driver, Tour Guide, Tour Agency, Admin, etc.)

Platform type (B2C, B2B, hybrid)

Geographic scope (if implied)

Monetization logic (commission, package sales, booking fee, etc.)

3. Identified User Roles & Permissions

For each user type:

Account capabilities

Dashboard functionality

Access restrictions

Unique features available

Role-based limitations

4. Complete Feature Breakdown (Functional Requirements)

Convert all visible functionality into formal Functional Requirements using this format:

FR-01:
The system shall allow users to register using email and password.

Group by module:

Authentication

User Profile Management

Search & Discovery

Booking System

Messaging / Communication

Package Creation (if available)

Payment Flow

Review & Rating

Supplier Management

Admin Controls

Be exhaustive and detailed.

5. User Flow Analysis

Identify and document:

Registration flow

Login flow

Supplier onboarding flow

Booking flow

Payment flow

Package creation flow

Cancellation flow

Any conditional or branching logic

Explain the logical steps in sequence form.

6. Business Rules Identified

Extract implied business logic such as:

Only Tour Agencies can create packages

Drivers cannot upload multi-service bundles

Deposit requirements (if visible)

Approval process (if implied)

Commission logic (if suggested)

Document as:

BR-01:
Only users with role "Tour Agency" shall be allowed to create and publish travel packages.

7. Non-Functional Requirements (Inferred from Design)

Based on UI, flows, and interactions, generate:

Performance Requirements
Security Requirements
Usability Requirements
Scalability Requirements
Availability Requirements
Compliance / Trust & Safety Requirements

Use measurable standards where appropriate.

8. UX & Design System Analysis

Component system consistency

Reusable components identified

Design tokens (colors, typography, spacing)

Responsiveness assumptions

Accessibility evaluation (contrast, clarity, hierarchy)

9. Data Structure Implications

Infer:

Required database entities (User, Booking, Package, Payment, Review, etc.)

Relationships between entities

Key attributes per entity

Provide this as a structured list.

10. System Architecture Implications

Based on the design, infer:

Backend services required

Payment gateway integration

Notification service

Authentication service

Admin management system

Third-party integrations

11. Gaps & Missing Elements

Identify:

Missing error states

Missing loading states

Missing edge-case flows

Missing confirmation flows

Missing legal/compliance screens

12. Risk & Complexity Assessment

Evaluate:

Product complexity level

Operational complexity

Scaling difficulty

Regulatory risk

Trust & safety risk

13. Product Maturity Assessment

Is this:

MVP-level?

Beta-level?

Production-ready concept?

Explain reasoning.

14. Recommendations for Improvement

Provide:

UX improvements

Feature improvements

Monetization improvements

Technical enhancements

Strategic suggestions

🎯 Important Instructions

Only analyze what exists in the file.

Do not assume features not visible.

Be analytical and professional.

Write in structured, documentation-level format.

Avoid vague summaries.

Think like a senior Product Manager and System Architect.