import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import * as searchController from '../controllers/resourceSearch.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/classes/:classId/resources/search', searchController.hybridSearch);
router.post('/classes/:classId/resources/semantic-search', searchController.semanticSearch);

export default router;
