import express from 'express';
import { db } from '../db/db.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// POST /api/inquiries - Public (Contact form)
router.post('/', async (req, res) => {
  try {
    const { full_name, email, phone, company, subject_category, message } = req.body;
    if (!full_name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    const newInquiry = await db.insert('contact_inquiries', {
      id: Date.now(),
      full_name,
      email,
      phone: phone || '',
      company: company || '',
      subject_category: subject_category || 'General Inquiry',
      message,
      status: 'New',
      notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    await db.logActivity('Visitor', 'Public', 'Submitted Inquiry', 'Contact', `${full_name} (${subject_category || 'General'})`);

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received. Our team will contact you promptly.',
      inquiryId: newInquiry.id
    });
  } catch (err) {
    console.error('Contact submit error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit contact message.' });
  }
});

// GET /api/inquiries - Admin / Content Manager
router.get('/', authenticateToken, requirePermission('inquiries.manage'), async (req, res) => {
  try {
    const { status } = req.query;
    let inquiries;

    if (status && status !== 'all' && status !== 'All') {
      inquiries = await db.find('contact_inquiries', 'LOWER(status) = LOWER($1)', [status], 'created_at DESC');
    } else {
      inquiries = await db.find('contact_inquiries', '', [], 'created_at DESC');
    }

    res.json({ success: true, inquiries });
  } catch (err) {
    console.error('Inquiries fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch inquiries.' });
  }
});

// PATCH /api/inquiries/:id/status
router.patch('/:id/status', authenticateToken, requirePermission('inquiries.manage'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status is required.' });

    const updated = await db.update('contact_inquiries', { status }, 'id = $1', [id]);
    if (!updated) return res.status(404).json({ success: false, message: 'Inquiry not found.' });

    await db.logActivity(req.user.name, req.user.role, 'Updated Inquiry Status', 'Contact', `Inquiry #${id} -> ${status}`);
    res.json({ success: true, inquiry: updated });
  } catch (err) {
    console.error('Inquiry status update error:', err);
    res.status(500).json({ success: false, message: 'Failed to update inquiry status.' });
  }
});

// PUT /api/inquiries/:id (Notes, Status & Details)
router.put('/:id', authenticateToken, requirePermission('inquiries.manage'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, notes, full_name, email, phone, company, subject_category, message } = req.body;

    const updates = {};
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (full_name !== undefined) updates.full_name = full_name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (company !== undefined) updates.company = company;
    if (subject_category !== undefined) updates.subject_category = subject_category;
    if (message !== undefined) updates.message = message;

    const updated = await db.update('contact_inquiries', updates, 'id = $1', [id]);
    if (!updated) return res.status(404).json({ success: false, message: 'Inquiry not found.' });

    await db.logActivity(req.user.name, req.user.role, 'Updated Inquiry Details', 'Contact', `Inquiry #${id} (${updated.full_name})`);
    res.json({ success: true, inquiry: updated });
  } catch (err) {
    console.error('Inquiry update error:', err);
    res.status(500).json({ success: false, message: 'Failed to update inquiry.' });
  }
});

// DELETE /api/inquiries/:id
router.delete('/:id', authenticateToken, requirePermission('inquiries.delete'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const target = await db.findOne('contact_inquiries', 'id = $1', [id]);
    
    if (!target) {
      return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    }

    await db.delete('contact_inquiries', 'id = $1', [id]);
    await db.logActivity(req.user.name, req.user.role, 'Deleted Inquiry', 'Contact', `From ${target.full_name || id}`);
    
    res.json({ success: true, message: 'Inquiry removed.' });
  } catch (err) {
    console.error('Inquiry delete error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete inquiry.' });
  }
});

export default router;
