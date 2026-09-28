# Brochure Feature Testing Guide

## Overview
The brochure management system has all 5 features implemented and functional:
1. ✅ Add brochures
2. ✅ Upload PDF files
3. ✅ Upload cover images
4. ✅ Edit information
5. ✅ Delete brochures

## Testing Steps

### Step 1: Login to Admin Panel
1. Open browser to `http://localhost:5174`
2. Login with your credentials
3. Navigate to **Admin Panel** (top menu)

### Step 2: Create a Test Project (if needed)
1. Go to **Projects** → **Add Project**
2. Fill in basic info (name, description)
3. Complete all tabs and click **Create Project**

### Step 3: Upload Brochures
1. Go to **Admin Panel** → **Brochures** menu
2. Select a project from left panel
3. You should see **5 Feature Buttons** at top:
   - ✓ Add brochures
   - ✓ Upload PDF files
   - ✓ Upload cover images
   - ✓ Edit information
   - ✓ Delete brochures

4. Click the **"Choose Files"** button below features
5. Select a PDF or image file
6. Wait for upload progress
7. Brochure should appear in the list below

### Step 4: Edit Brochure Information
1. Hover over uploaded brochure in the list
2. You should see **Edit** (pencil icon) and **Delete** (trash icon) buttons
3. Click **Edit icon** to open modal
4. Change title and/or description
5. Click **Save** in modal
6. Verify changes appear in the list

### Step 5: Delete Brochure
1. Hover over a brochure
2. Click **Delete** (trash icon)
3. Confirm deletion in dialog
4. Brochure should disappear from list

### Step 6: View Brochures on Public Site
1. Go to public site: `http://localhost:5174`
2. Navigate to a project detail page
3. Scroll to bottom of project page
4. You should see **"Brochures & Documents"** section
5. Brochures display as gallery grid with:
   - Thumbnail preview
   - Title
   - Description
   - View button (opens in new tab)
   - Download button

## Browser Console Debugging

### Open Developer Tools
- Press `F12` or right-click → Inspect
- Go to **Console** tab

### Check for Errors
- Look for any red error messages
- Check Network tab for failed API calls

### Common Issues

**Issue: "Server is temporarily unavailable"**
- Solution: Restart backend with `npm run server`

**Issue: Features show as text only**
- Solution: Build frontend with `npm run build`

**Issue: Upload button doesn't work**
- Solution: Check browser console for API errors
- Verify token is being sent (check Network tab)

**Issue: Brochures don't appear after upload**
- Solution: Check API response in Network tab
- Verify `POST /api/brochures` returns success

**Issue: Edit modal doesn't open**
- Solution: Check console for JavaScript errors
- Verify button click is registering

## File Locations

### Frontend Components
- `src/pages/admin/AdminBrochuresPage.tsx` - Main admin brochures page
- `src/components/admin/BrochureUploader.tsx` - Upload component
- `src/components/public/BrochureViewer.tsx` - Public gallery display

### Backend Routes
- `server/src/routes/brochures.js` - API endpoints
- GET `/api/brochures?projectId=X` - List brochures
- POST `/api/brochures` - Create/upload
- PUT `/api/brochures/:id` - Update metadata
- DELETE `/api/brochures/:id` - Delete

### Database
- Table: `project_brochures`
- Columns: id, project_id, title, description, file_type, file_url, thumbnail_url, file_size_mb, display_order, created_at, updated_at

## Expected Behavior

### Upload
- Select files → Click upload
- Progress shows "Uploading 1 of X..."
- Success toast: "Successfully uploaded 1 brochure!"
- Brochure appears in list with:
  - File icon (PDF/Image)
  - Editable title field
  - Editable description textarea
  - View, Download, Delete buttons

### Edit
- Click pencil icon on brochure
- Modal opens with title & description fields
- Edit fields
- Click Save
- Modal closes
- List updates with new values
- Success toast: "Brochure updated successfully"

### Delete
- Click trash icon on brochure
- Confirmation dialog appears
- Click confirm
- Brochure disappears from list
- Success toast: "Brochure deleted successfully"

### Public Display
- Project page shows "Brochures & Documents" section
- Gallery grid layout (1 col mobile, 2 col tablet, 3 col desktop)
- Each brochure shows:
  - Thumbnail/icon
  - Title
  - Description
  - Download link
  - View button

## Troubleshooting Checklist

- [ ] Both servers running (`npm run server`, `npm run client`)
- [ ] Logged into admin panel
- [ ] Project exists
- [ ] Can select project from left panel
- [ ] Feature buttons visible at top
- [ ] Upload button is clickable
- [ ] File chooser opens
- [ ] Can select file and upload
- [ ] Brochures list shows uploaded files
- [ ] Edit icon visible on hover
- [ ] Delete icon visible on hover
- [ ] Edit modal opens and closes
- [ ] Changes save successfully
- [ ] Delete confirms and removes item
- [ ] Brochures visible on public project page

## Success Criteria

All 5 features are working when:
1. ✅ Files upload successfully
2. ✅ Uploaded brochures appear in list
3. ✅ Title and description are editable
4. ✅ Files can be viewed/downloaded
5. ✅ Files can be deleted with confirmation
6. ✅ Changes persist after page reload
7. ✅ Brochures display on public project page
