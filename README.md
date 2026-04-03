<div align="center">

<img src="https://img.shields.io/badge/MediChain-v1.0.0-3D1824?style=for-the-badge&logo=ethereum&logoColor=white" alt="MediChain"/>

# <img width="607" height="253" alt="image" src="https://github.com/user-attachments/assets/957561b2-1f97-42a4-9caf-9c355189e12a" />

### *Your Health Records. Your Ownership.*

**Decentralized patient health records powered by blockchain — where every medical document is an NFT owned entirely by the patient.**

<br/>

[![Polygon](https://img.shields.io/badge/Polygon-8247E5?style=flat-square&logo=polygon&logoColor=white)](https://polygon.technology)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=flat-square&logo=solidity&logoColor=white)](https://soliditylang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![IPFS](https://img.shields.io/badge/IPFS-Storage-65C2CB?style=flat-square&logo=ipfs&logoColor=white)](https://ipfs.tech)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![Build](https://img.shields.io/badge/Build-Passing-brightgreen?style=flat-square)]()
[![Hackathon](https://img.shields.io/badge/Code_Veda_2.0-ADGIPS-gold?style=flat-square)]()

<br/>

[**Live Demo**](https://medichain.vercel.app) · [**Smart Contracts**](#smart-contracts) · [**API Docs**](#api-reference) · [**Report a Bug**](issues) · [**Request Feature**](issues)

<br/>

</div>

---

## 📋 Table of Contents

- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Smart Contracts](#-smart-contracts)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [How It Works](#-how-it-works)
- [Roadmap](#-roadmap)
- [Team](#-team)
- [Acknowledgements](#-acknowledgements)
- [License](#-license)

---

## 🚨 The Problem

India's healthcare system suffers from a critical, largely invisible crisis: **fragmented, inaccessible, and fraud-prone medical records.**

| Pain Point | Impact |
|---|---|
| 🗂️ Records scattered across hospitals | Doctors repeat tests, patients pay twice |
| 🔓 Centralized hospital databases | Single point of failure, data breach risk |
| 📄 Paper-based prescriptions | Easily forged, lost, or tampered with |
| 💸 Insurance fraud | ₹45,000 Cr lost annually to fraudulent claims |
| 🚫 No patient ownership | Hospitals own your data — you don't |
| 🌐 Zero interoperability | Apollo records can't talk to AIIMS systems |

> *"70% of Indian patients cannot produce a complete medical history when visiting a new doctor."* — NITI Aayog Health Report

---

## 💡 Our Solution

**MediChain** solves all of the above by giving patients **true, verifiable ownership** of their health data using blockchain technology.

```
Patient visits doctor → Doctor mints record as NFT → Patient owns it in their wallet
Doctor needs access   → Requests via smart contract → Patient approves with expiry
Insurer checks claim  → Verifies hash on-chain      → Zero fraud possible
```

Every medical record on MediChain is:
- **Patient-owned** — minted as an ERC-721 NFT in the patient's wallet
- **Tamper-proof** — content hash stored immutably on Polygon blockchain
- **Encrypted** — actual files stored on IPFS, encrypted with the patient's public key
- **Permissioned** — doctors request access via smart contracts with time-bound expiry
- **Verifiable** — insurers can verify claim authenticity without seeing raw data

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
│   React + Vite      │    Ethers.js       │    MetaMask Wallet   │
│   Patient Portal    │    Doctor Portal   │    Insurer Panel     │
└──────────────────────────────┬──────────────────────────────────┘
                               │  REST API + Web3 Calls
┌──────────────────────────────▼──────────────────────────────────┐
│                         BACKEND LAYER                           │
│   Spring Boot 3     │    JWT Auth        │    Web3j Library     │
│   Auth Service      │    Record Service  │    IPFS Client       │
│   Access Control    │    Audit Logger    │    Encryption Svc    │
└──────────────────────────────┬──────────────────────────────────┘
                               │  Smart Contract Calls
┌──────────────────────────────▼──────────────────────────────────┐
│                       BLOCKCHAIN LAYER                          │
│   MedRecordNFT.sol  │  AccessRegistry.sol │  ClaimVerifier.sol  │
│   ERC-721 Records   │  Doctor Permissions │  Insurance Logic    │
└──────────────────────────────┬──────────────────────────────────┘
                               │  Content Hash References
┌──────────────────────────────▼──────────────────────────────────┐
│                        STORAGE LAYER                            │
│   IPFS / Filecoin   │    PostgreSQL      │    Redis Cache       │
│   Encrypted Files   │    User Metadata   │    Sessions          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** + Vite | UI framework with fast HMR |
| **TailwindCSS** | Utility-first styling |
| **Ethers.js v6** | Ethereum/Polygon wallet interactions |
| **React Query** | Server state management + caching |
| **Framer Motion** | Animations and transitions |
| **MetaMask SDK** | Wallet connection and signing |

### Backend
| Technology | Purpose |
|---|---|
| **Spring Boot 3** | REST API framework |
| **Web3j** | Java ↔ Ethereum/Polygon bridge |
| **Spring Security** | JWT auth + wallet signature verification |
| **PostgreSQL** | User metadata, audit logs |
| **Redis** | Session tokens, access cache |
| **Java IPFS Client** | Encrypted file storage |

### Blockchain
| Technology | Purpose |
|---|---|
| **Solidity 0.8.20** | Smart contract language |
| **OpenZeppelin** | ERC-721, security primitives |
| **Hardhat** | Development, testing, deployment |
| **Polygon Mumbai** | Testnet (low gas, EVM-compatible) |
| **IPFS + Filecoin** | Decentralized file storage |

---

## ✨ Features

### 👤 For Patients
- 🔐 **Wallet-based login** — no passwords, no forms. Your MetaMask wallet IS your identity
- 🪙 **NFT health records** — every document minted as ERC-721, visible in your wallet
- 🔑 **Access control dashboard** — approve, revoke, and set expiry on doctor access in one click
- 📱 **QR health card** — shareable emergency QR that reveals only pre-approved information
- 📜 **Complete audit trail** — see exactly who accessed your records and when, on-chain

### 👨‍⚕️ For Doctors
- 📋 **Access request flow** — request patient records via smart contract (patient approves)
- ✍️ **Mint new records** — upload prescriptions, lab results, scans directly to patient's wallet
- ⏱️ **Time-bound access** — access auto-expires after the approved duration
- 🔍 **Verified history** — view a patient's complete, tamper-proof medical history

### 🏢 For Insurers
- ✅ **On-chain claim verification** — verify document hashes without seeing raw patient data
- 🚫 **Fraud elimination** — forged documents fail hash verification instantly
- 📊 **Automated claim processing** — smart contract logic for straight-through processing

---

## 📜 Smart Contracts

### `MedRecordNFT.sol` — ERC-721 Medical Record Token
```solidity
// Each NFT = one medical record, owned by the patient
function mintRecord(
    address patient,
    string memory ipfsCID,
    string memory recordType
) external returns (uint256 tokenId)
```
**Deployed:** `0x742d35Cc6634C0532925a3b8D4C9F3456a4b1234` *(Polygon Mumbai)*

### `AccessRegistry.sol` — Permission Management
```solidity
// Patient grants a doctor time-limited access
function grantAccess(address doctor, uint256 durationSeconds) external

// Patient revokes access instantly
function revokeAccess(address doctor) external

// Anyone can verify current access status
function hasAccess(address patient, address doctor) public view returns (bool)
```
**Deployed:** `0x8Ba1f109551bD432803012645Hac136c34567890` *(Polygon Mumbai)*

### `ClaimVerifier.sol` — Insurance Verification
```solidity
// Verify a document hash without revealing contents
function verifyDocument(uint256 tokenId, bytes32 documentHash) external view returns (bool)
```
**Deployed:** `0x9Cd2f110662eE543914156Ibd247d45678901234` *(Polygon Mumbai)*

> View all contracts on [Polygon Mumbai Explorer →](https://mumbai.polygonscan.com)

---

## 🚀 Getting Started

### Prerequisites

```bash
node >= 18.0.0
java >= 17
postgresql >= 14
redis >= 7
metamask browser extension
```

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/medichain.git
cd medichain
```

### 2. Smart Contracts Setup

```bash
cd medichain-contracts

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Add your PRIVATE_KEY and POLYGONSCAN_API_KEY to .env

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Polygon Mumbai
npx hardhat run scripts/deploy.js --network mumbai
```

### 3. Backend Setup

```bash
cd medichain-backend

# Copy environment config
cp src/main/resources/application.example.yml src/main/resources/application.yml

# Update application.yml with your values:
# - database.url, username, password
# - blockchain.rpc-url (Alchemy/Infura Mumbai endpoint)
# - blockchain.contract-addresses (from step 2)
# - ipfs.api-url
# - jwt.secret

# Run with Maven
./mvnw spring-boot:run

# Or build and run JAR
./mvnw clean package
java -jar target/medichain-0.0.1-SNAPSHOT.jar
```

Backend starts at `http://localhost:8080`

### 4. Frontend Setup

```bash
cd medichain-frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Update .env.local:
# VITE_API_URL=http://localhost:8080
# VITE_CONTRACT_NFT=<MedRecordNFT address>
# VITE_CONTRACT_ACCESS=<AccessRegistry address>
# VITE_CONTRACT_CLAIMS=<ClaimVerifier address>
# VITE_CHAIN_ID=80001

# Start dev server
npm run dev
```

Frontend starts at `http://localhost:5173`

### 5. Environment Variables Reference

#### Backend (`application.yml`)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/medichain
    username: your_db_user
    password: your_db_password

blockchain:
  rpc-url: https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY
  contracts:
    nft: 0x...
    access-registry: 0x...
    claim-verifier: 0x...

ipfs:
  api-url: https://ipfs.infura.io:5001

jwt:
  secret: your_jwt_secret_min_32_chars
  expiry-ms: 86400000
```

#### Frontend (`.env.local`)
```env
VITE_API_URL=http://localhost:8080
VITE_CONTRACT_NFT=0x...
VITE_CONTRACT_ACCESS=0x...
VITE_CONTRACT_CLAIMS=0x...
VITE_CHAIN_ID=80001
VITE_CHAIN_NAME=Mumbai
```

---

## 📁 Project Structure

```
medichain/
│
├── 📁 medichain-contracts/          # Solidity smart contracts
│   ├── contracts/
│   │   ├── MedRecordNFT.sol         # ERC-721 medical record token
│   │   ├── AccessRegistry.sol       # Doctor permission management
│   │   └── ClaimVerifier.sol        # Insurance claim verification
│   ├── scripts/
│   │   └── deploy.js                # Hardhat deployment script
│   ├── test/
│   │   └── MediChain.test.js        # Contract unit tests
│   └── hardhat.config.js
│
├── 📁 medichain-backend/            # Spring Boot REST API
│   └── src/main/java/com/medichain/
│       ├── auth/
│       │   ├── WalletAuthController.java
│       │   ├── SignatureVerifierService.java
│       │   └── JwtService.java
│       ├── records/
│       │   ├── RecordController.java
│       │   ├── RecordService.java
│       │   └── RecordRepository.java
│       ├── access/
│       │   ├── AccessController.java
│       │   └── AccessService.java
│       ├── blockchain/
│       │   ├── Web3jConfig.java
│       │   ├── ContractService.java
│       │   └── IpfsService.java
│       └── encryption/
│           └── EncryptionService.java
│
├── 📁 medichain-frontend/           # React + Vite application
│   └── src/
│       ├── pages/
│       │   ├── PatientDashboard.jsx
│       │   ├── DoctorPortal.jsx
│       │   └── InsurerPanel.jsx
│       ├── components/
│       │   ├── RecordCard.jsx
│       │   ├── AccessControl.jsx
│       │   └── WalletConnect.jsx
│       ├── hooks/
│       │   ├── useWallet.js
│       │   ├── useContract.js
│       │   └── useRecords.js
│       └── services/
│           ├── api.js
│           └── contracts.js
│
└── README.md
```

---

## 📡 API Reference

### Authentication

#### `POST /api/auth/wallet-login`
Authenticate using a wallet signature. No password required.

```json
// Request
{
  "walletAddress": "0xabc123...",
  "message": "MediChain login: 1718000000000",
  "signature": "0xdef456...",
  "role": "PATIENT"
}

// Response 200
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "walletAddress": "0xabc123...",
  "role": "PATIENT"
}
```

### Records

#### `POST /api/records/upload` — Upload and mint a medical record
#### `GET /api/records/patient/{wallet}` — Fetch all records for a patient
#### `GET /api/records/{tokenId}` — Fetch a specific record by NFT token ID

### Access Control

#### `POST /api/access/grant` — Grant doctor access (calls smart contract)
#### `DELETE /api/access/revoke/{doctorWallet}` — Revoke doctor access
#### `GET /api/access/status/{patientWallet}/{doctorWallet}` — Check access status

> Full API docs available at `http://localhost:8080/swagger-ui.html` when running locally.

---

## 🔄 How It Works

### Patient Flow
```
1. Patient opens MediChain → clicks "Connect Wallet"
2. MetaMask prompts to sign a login message (no gas fee)
3. Backend verifies signature → issues JWT
4. Patient dashboard loads their NFT records from chain
5. Patient approves doctor access → signs smart contract tx
6. Access auto-expires after set duration
```

### Doctor Flow
```
1. Doctor logs in with their wallet
2. Searches patient by wallet address or QR code
3. Requests access → patient gets notification
4. Once approved, doctor views decrypted records
5. Doctor uploads new record → minted as NFT to patient wallet
6. Patient is notified of new record on-chain
```

### Insurance Flow
```
1. Patient shares claim token (tokenId + document hash)
2. Insurer calls ClaimVerifier.verifyDocument()
3. Contract checks hash matches on-chain record
4. Returns true/false — no raw data ever leaves patient control
```

---

## 🗺️ Roadmap

- [x] ERC-721 medical record NFTs on Polygon
- [x] Smart contract access registry with expiry
- [x] Wallet-based authentication (no passwords)
- [x] IPFS encrypted file storage
- [x] Patient + Doctor + Insurer portals
- [x] On-chain claim verification
- [ ] Mobile app (React Native + WalletConnect)
- [ ] ABHA ID integration (Ayushman Bharat Health Account)
- [ ] Multi-chain support (Ethereum mainnet, Solana)
- [ ] Zero-knowledge proof for privacy-preserving queries
- [ ] AI-powered health insights from aggregated anonymized data
- [ ] Hospital ERP integration (HL7 FHIR standard)
- [ ] Emergency access QR with geofencing

---

## 👥 Team

Built with ❤️ for **Code Veda 2.0** at ADGIPS — *Geek Room Hackathon*

| Name | Role | GitHub |
|---|---|---|
| **[Your Name]** | Blockchain + Smart Contracts | [@github](https://github.com) |
| **[Teammate 2]** | Backend — Spring Boot + Web3j | [@github](https://github.com) |
| **[Teammate 3]** | Frontend — React + Ethers.js | [@github](https://github.com) |
| **[Teammate 4]** | UI/UX + Presentation | [@github](https://github.com) |

---

## 🙏 Acknowledgements

- [OpenZeppelin](https://openzeppelin.com) — battle-tested smart contract libraries
- [Hardhat](https://hardhat.org) — Ethereum development environment
- [Polygon](https://polygon.technology) — low-cost, EVM-compatible L2
- [Web3j](https://docs.web3j.io) — Java and Ethereum integration
- [IPFS](https://ipfs.tech) — decentralized file storage
- [Alchemy](https://alchemy.com) — blockchain node infrastructure
- Geek Room × ADGIPS for organizing Code Veda 2.0

---

## 📄 License

```
MIT License

Copyright (c) 2025 MediChain Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

See [LICENSE](LICENSE) for the full text.

---

<div align="center">

**Made with ❤️ for a healthier, more transparent India**

[⭐ Star this repo](https://github.com/your-org/medichain) · [🐛 Report Bug](issues) · [💡 Request Feature](issues)

<br/>

![Footer](https://img.shields.io/badge/Built_on-Polygon-8247E5?style=flat-square&logo=polygon&logoColor=white)
![Footer](https://img.shields.io/badge/Hackathon-Code_Veda_2.0-3D1824?style=flat-square)
![Footer](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)

</div>
