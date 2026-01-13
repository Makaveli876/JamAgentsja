# Jam Agents QA Checklist (Pre-Flight)

> **Status Reference**: `docs/DB_SCHEMA.md` | `docs/POLICY_DIFF.md`

## 1. Core Viral Loop (The Money Flow)
- [ ] **Create Listing**:
    - [ ] Upload image matches server action (`upload-asset.ts`).
    - [ ] Phone number normalizes to `1876...`.
    - [ ] "Promote" saves draft -> Publishes -> Returns Slug.
- [ ] **Showroom (`/item/[slug]`)**:
    - [ ] Page loads with SSR data.
    - [ ] QR Code renders (bottom right).
    - [ ] "Message Seller" opens WhatsApp with: *"Hi [BizName]! I'm interested in..."*
    - [ ] "More from Seller" shows related items (if >1 listing exists).
- [ ] **Share Flow**:
    - [ ] "Send to WhatsApp" (Editor) -> Generates Image -> Opens Share Sheet.
    - [ ] "Share" (Showroom) -> Opens WhatsApp intent.

## 2. Seller Vault & Identity
- [ ] **Onboarding**:
    - [ ] New device -> Visits `/vault` -> Enters Name/Phone.
    - [ ] Check Supabase `sellers` table: `whatsapp_e164` saved correctly.
- [ ] **Memory Management**:
    - [ ] Add a memory ("We deliver on Sundays").
    - [ ] Delete a memory.
    - [ ] Verify `seller_docs` table updates.
- [ ] **Listing Association**:
    - [ ] Create NEW listing after onboarding.
    - [ ] Verify `listings.seller_id` matches the Vault user.

## 3. Packs System (Phase 8)
- [ ] **Browse**: Visit `/packs`.
- [ ] **Wizard**: Click "Restaurant Pack" -> Enter "Oxtail" -> Generate.
- [ ] **Result**: 3 Mock assets appear.

## 4. AI & RAG (The Brain)
- [ ] **Creative Mode**:
    - [ ] Hit "Optimize" in editor.
    - [ ] Result uses Jamaican context/patois (if prompted).
- [ ] **Grounded Mode (RAG)**:
    - [ ] (If enabled) Ask question about seller.
    - [ ] Verify answer pulls from Vault memories.

## 5. Security & Limits
- [ ] **Rate Limiting**:
    - [ ] Spam the "Optimize" button (should cap at 50/hour).
    - [ ] Try to upload 100MB file (should fail at server action level).
- [ ] **RLS Safety**:
    - [ ] Try to fetch `events` table from Client Console (should fail - Service Role only).
    - [ ] Try to update another user's listing (should fail).

## 6. Mobile Polish
- [ ] **Viewport**: No horizontal scroll on mobile.
- [ ] **Inputs**: No zoom on focus (font-size >= 16px).
- [ ] **Overscroll**: `bg-neutral-950` matches root background.
