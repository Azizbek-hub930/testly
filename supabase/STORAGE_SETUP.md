# Storage setup (dashboard steps)

Managed Supabase projects don't allow creating policies on `storage.objects`
from the SQL editor — the table is owned by `supabase_storage_admin` and
`postgres` may neither own it nor assume that role. The dashboard is the
supported route.

Two things to set up: the bucket, and one access policy.

---

## 1. The bucket

`supabase/migrations/0003_storage.sql` creates it. If that ran without error,
skip to part 2.

If it failed, create it by hand:

1. Left sidebar → **Storage**
2. **New bucket**
3. Name: `sources` — exactly that, lowercase
4. **Public bucket: OFF.** This matters. A public bucket would make every
   uploaded document readable by anyone with the URL
5. Expand **Additional configuration**
   - Restrict file size: `20` MB
   - Allowed MIME types: `application/pdf`
6. **Create**

---

## 2. The access policy

One policy covers all four operations. It says: you may only touch objects in
the `sources` bucket, inside a folder named after your own user id.

1. Left sidebar → **Storage**
2. Click **Policies** (in the Storage section of the sidebar, or the
   **Configuration → Policies** tab)
3. Find the **`sources`** bucket and click **New policy**
4. Choose **For full customization** (not the quick templates)
5. Fill it in:

   | Field | Value |
   | --- | --- |
   | Policy name | `sources_own_folder` |
   | Allowed operation | tick **SELECT**, **INSERT**, **UPDATE**, **DELETE** |
   | Target roles | `authenticated` |

6. Both the **USING** and **WITH CHECK** expression boxes get the same thing:

   ```sql
   bucket_id = 'sources' AND (storage.foldername(name))[1] = auth.uid()::text
   ```

   If only one box is shown, paste it there.

7. **Review** → **Save policy**

---

## What that expression does

`storage.foldername(name)` splits an object path into its folders. For
`sources/8f3c…d21/report.pdf` it returns `{8f3c…d21}`, so `[1]` is the first
folder — the owner's user id. Comparing it to `auth.uid()` means a signed-in
user can only reach their own folder, and an anonymous visitor matches nothing
at all.

`authenticated` as the target role is what keeps anonymous requests out.

---

## Confirming it worked

Run `supabase/verify.sql` in the SQL editor. The last two rows should read:

```
Private storage bucket "sources"   1 / 1   PASS
Storage access policy              1 / 1   PASS
```

Presence is all that query can prove. The real test is uploading a PDF as a
signed-in user and confirming a second account cannot see it — steps B24 and C3
in `TESTING.md`.
