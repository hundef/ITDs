# How to Add Leaders & Professionals

## Step-by-Step Guide

### Adding a Leader

1. Go to: `http://localhost:5000/admin/team`
2. You'll see 3 tabs at the top: "Total", "Leaders", "Professionals"
3. **Click the "Leaders" tab** to switch to the leaders view
4. A button will appear: **"+ Add Leader"** in the top right
5. Click the "**+ Add Leader**" button
6. Fill in the form:
   - **Full Name** - e.g., "John Smith"
   - **Role / Job Title** - e.g., "Chief Executive Officer"
   - **Avatar Image** - Upload or paste image URL
   - (Optional) Other fields like department, email, etc.
7. Click **"Save"**
8. The new leader will appear immediately on the website at `/team`

### Adding a Professional

1. Go to: `http://localhost:5000/admin/team`
2. **Click the "Professionals" tab** to switch to professionals view
3. A button will appear: **"+ Add Professional"** in the top right
4. Click the **"+ Add Professional"** button
5. Fill in the form:
   - **Full Name** - e.g., "Jane Doe"
   - **Role / Job Title** - e.g., "Senior Software Engineer"
   - **Department** - e.g., "Engineering" (groups them on public site)
   - **Avatar Image** - Upload or paste image URL
   - (Optional) Other fields like email, LinkedIn, GitHub, etc.
6. Click **"Save"**
7. The professional will appear immediately on the public website under their department

## Important Notes

### ⚠️ View Modes
- **Total Tab**: Shows all members (add button hidden - use specific tabs instead)
- **Leaders Tab**: Click here to add leaders
- **Professionals Tab**: Click here to add professionals

### 🎨 Avatar Images

You have 3 options for avatar images:

1. **Upload from Computer**
   - Click "Upload" button in form
   - Select PNG, JPG, or GIF image
   - Image will be stored in server/uploads

2. **Paste External URL**
   - Use any public image URL
   - Example: `https://images.unsplash.com/photo-...`
   - Must be publicly accessible

3. **Default Avatar**
   - If left blank, uses: `/avatars/avatar_default.jpg`

### 👁️ Visibility

- By default, new members are **visible** on the public site
- To hide a member temporarily:
  - Find them in the list
  - Click the eye icon to toggle visibility
  - They won't appear on public pages but stay in database

### 📋 Required vs Optional Fields

**Required** (must fill):
- Full Name
- Role / Job Title

**Optional** (can leave blank):
- Department (for professionals)
- Bio
- Email
- LinkedIn URL
- GitHub URL
- Twitter URL
- Display Order

### 🔄 Where Changes Appear

- **Leaders**: Show on `/team` page and `/about` page
- **Professionals**: Show on `/team` page, grouped by department

### ⚡ Real-Time Updates

Changes appear immediately on the website - no page refresh needed!

## Troubleshooting

### "Add Leader" button doesn't appear
- Make sure you clicked the "Leaders" tab first
- Don't click the "Total" tab - it hides the add button

### Form won't submit
- Check that **Full Name** and **Role** are filled in
- Both fields are required

### Image doesn't show
- Check if the image URL is valid
- Try uploading instead of pasting URL

### Member shows but is hidden
- Click the eye icon to make them visible
- Or toggle visibility in the member list

## Example Data

### Leader Example
```
Full Name: Sarah Johnson
Role: Chief Technology Officer
Department: Executive
Avatar: [upload photo.jpg]
```

### Professional Example
```
Full Name: Michael Chen
Role: Senior Developer
Department: Engineering
Email: michael@company.com
LinkedIn: linkedin.com/in/michaelchen
Avatar: [upload photo.jpg]
```

---

**Need help?** Check the admin panel at `http://localhost:5000/admin` with credentials:
- Email: superadmin@insa.gov.et
- Password: admin123
