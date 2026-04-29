const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/', adminController.getAdmins);
router.post('/', adminController.createAdmin);
router.delete('/:id', adminController.deleteAdmin);

module.exports = router;
