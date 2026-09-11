import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { requirePublishedResource } from '../middleware/requirePublishedResource.js';
import * as bookmarkController from '../controllers/bookmark.controller.js';

const router = Router();

router.use(authenticate);

router.post('/student/resources/:resourceId/bookmark', requirePublishedResource, bookmarkController.addBookmark);
router.delete('/student/resources/:resourceId/bookmark', requirePublishedResource, bookmarkController.removeBookmark);
router.get('/student/bookmarks', bookmarkController.getStudentBookmarks);

export default router;
