# Atmisuki | Digital Art Showcase

<div align="center">
  <p>A high-performance digital ecosystem for artwork exhibition, commission presentation, and brand identity.</p>
  <a href="https://atmisuki-portfolio.vercel.app/"><strong>Live Demonstration</strong></a>
</div>

<br />

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white">
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white">
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white">
</div>

---

## Project Overview

This platform was engineered to serve as a definitive hub for digital artists, merging a high-fidelity portfolio with dynamic management tools. Unlike static alternatives, this system provides an immersive and performant experience, enabling complete autonomy over digital presence without direct code intervention.

The core development philosophy prioritizes **User Experience (UX)** and **Technical Excellence**, ensuring that visual assets are delivered with optimal compression, speed, and responsiveness across all device classes.

## Technical Key Features

The project implements advanced software engineering practices to achieve superior performance benchmarks:

* **Client-Side Image Optimization Pipeline:** A sophisticated system utilizing *Web Workers* to process and convert uploads to **WebP** format directly in the browser. It applies context-aware dynamic resizing for Avatars, Gallery assets, and Commission tiers.
* **Serverless & Real-time Architecture:** Fully integrated with **Supabase**, leveraging PostgreSQL for data integrity and Object Storage with granular Row Level Security (RLS) policies.
* **Aggressive Asset Caching:** Uploaded assets are served with a one-year immutable cache, and gallery URLs carry context-aware width and quality parameters so each surface downloads only what it renders.
* **Responsive Adaptive Interface:** A modern, dark-themed design system featuring fluid components and mobile-optimized navigation built with Tailwind CSS.

## Technology Stack

* **Core Framework:** Next.js (App Router) & React.
* **Language:** TypeScript for static typing and data integrity.
* **Styling:** Tailwind CSS for a utility-first, performant design system.
* **Backend Infrastructure:** Supabase (Database, Storage, and Authentication).
* **Processing:** Multi-threaded image processing via the Web Workers API.
* **Deployment:** Continuous Integration and Deployment (CI/CD) via Vercel.

## Management Capabilities

The platform features an integrated, secure administrative area for comprehensive ecosystem control:

* **Profile Management:** Dynamic editing of professional biography, location, and social integration.
* **Gallery Orchestration:** Automated upload and categorization of digital artworks.
* **Commission System:** Management of pricing tiers, service descriptions, and visual references.
* **Asset Optimization:** Automated oversight of image dimensions and asset compression.

## Dependency updates and protected branches

Work on a separate branch and open a pull request into `main`. GitHub requires
the `Lint, tipos, testes e build` check to pass against the current `main`,
including for administrators. Merging into `main` publishes through Vercel.
Merged branches are deleted automatically.

Dependabot checks weekly, with at most one routine npm PR and one Actions PR
open at a time. npm minor and patch releases share a group so related packages
can be tested together. npm major upgrades require a deliberate migration;
security updates remain separate from these routine limits and version filters.

Repository settings are recorded in `.github/settings/`. An administrator can
reapply them with the GitHub CLI:

```sh
gh api --method PATCH repos/Francisco-Neto13/artist-portfolio --input .github/settings/repository.json
gh api --method PUT repos/Francisco-Neto13/artist-portfolio/branches/main/protection --input .github/settings/main-protection.json
```

## License

This project is proprietary and protected by copyright.

© 2026 Atmisuki. All rights reserved.

See the `LICENSE` file for the full terms of use and restrictions.

---

<div align="center">
  <p>Engineered for performance, aesthetics, and digital autonomy.</p>
</div>
